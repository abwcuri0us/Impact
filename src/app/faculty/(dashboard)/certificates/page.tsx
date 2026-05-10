'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Award, Plus, Pencil, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFacultyAccess } from '@/hooks/useFacultyAccess';

interface Certificate {
  id: string;
  title: string;
  image_url: string | null;
  section: string;
  description: string | null;
  is_active: boolean;
}

const SECTIONS = ['General', 'MS-CIT', 'Tally', 'Programming', 'DTP', 'Other'] as const;

interface FormData {
  title: string;
  section: string;
  imageUrl: string;
  description: string;
}

const emptyForm: FormData = {
  title: '',
  section: 'General',
  imageUrl: '',
  description: '',
};

export default function FacultyCertificatesPage() {
  const { accessGranted, loading: accessLoading } = useFacultyAccess();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit modal state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetchCertificates = useCallback(async () => {
    try {
      const res = await fetch('/api/certificates');
      if (res.ok) {
        const data = await res.json();
        setCertificates(Array.isArray(data) ? data : []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // ── Helpers ───────────────────────────────────────────────────────────
  const updateField = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  // ── Add ───────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          section: form.section,
          imageUrl: form.imageUrl.trim(),
          description: form.description.trim(),
        }),
      });
      if (res.ok) {
        toast.success('Certificate added successfully');
        setAddOpen(false);
        resetForm();
        fetchCertificates();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to add certificate');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────
  const openEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    setForm({
      title: cert.title,
      section: cert.section || 'General',
      imageUrl: cert.image_url || '',
      description: cert.description || '',
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingId || !form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/certificates/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          section: form.section,
          imageUrl: form.imageUrl.trim(),
          description: form.description.trim(),
        }),
      });
      if (res.ok) {
        toast.success('Certificate updated successfully');
        setEditOpen(false);
        resetForm();
        fetchCertificates();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to update certificate');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/certificates/${deletingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Certificate deleted successfully');
        setDeleteOpen(false);
        setDeletingId(null);
        fetchCertificates();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to delete certificate');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeleting(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading || accessLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Shared form inside both dialogs ───────────────────────────────────
  const CertificateForm = () => (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="cert-title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="cert-title"
          placeholder="e.g. Diploma in Computer Applications"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cert-image">Image URL</Label>
        <Input
          id="cert-image"
          placeholder="https://example.com/certificate.jpg"
          value={form.imageUrl}
          onChange={(e) => updateField('imageUrl', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cert-section">Section</Label>
        <Select value={form.section} onValueChange={(v) => updateField('section', v)}>
          <SelectTrigger id="cert-section" className="w-full">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {SECTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cert-description">Description</Label>
        <Textarea
          id="cert-description"
          placeholder="Brief description of the certificate..."
          rows={3}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Certificates</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
          </p>
        </div>
        {accessGranted && (
          <Button
            className="gap-2 bg-brand-purple hover:bg-brand-purple-dark"
            onClick={() => {
              resetForm();
              setAddOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Certificate
          </Button>
        )}
      </div>

      {/* ── Access Banner ──────────────────────────────────────────── */}
      {!accessGranted && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            You are in <strong>view-only</strong> mode. Ask your admin to grant edit access
            if you need to add or modify certificates.
          </p>
        </div>
      )}

      {/* ── Certificate Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {certificates.map((cert, index) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card className="overflow-hidden group">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {cert.image_url ? (
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-amber-600/10">
                    <Award className="w-10 h-10 text-amber-500/30" />
                  </div>
                )}

                {/* Hover overlay with edit / delete buttons */}
                {accessGranted && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full shadow-md"
                      onClick={() => openEdit(cert)}
                      aria-label={`Edit ${cert.title}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-9 w-9 rounded-full shadow-md"
                      onClick={() => openDelete(cert.id)}
                      aria-label={`Delete ${cert.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{cert.title}</p>
                {cert.section && cert.section !== 'General' && (
                  <Badge className="text-[10px] mt-1 bg-brand-purple/10 text-brand-purple">
                    {cert.section}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Empty State ────────────────────────────────────────────── */}
      {certificates.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Certificates Found</h3>
              <p className="text-muted-foreground text-sm">
                No certificates are currently available.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Add Certificate Dialog ─────────────────────────────────── */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Certificate</DialogTitle>
            <DialogDescription>
              Add a new certificate to the gallery. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <CertificateForm />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                resetForm();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-brand-purple hover:bg-brand-purple-dark"
              onClick={handleAdd}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Certificate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Certificate Dialog ────────────────────────────────── */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Certificate</DialogTitle>
            <DialogDescription>
              Update the certificate details. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <CertificateForm />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                resetForm();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-brand-purple hover:bg-brand-purple-dark"
              onClick={handleEdit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Alert Dialog ───────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this certificate? This action cannot be undone
              and will permanently remove the certificate from the gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
