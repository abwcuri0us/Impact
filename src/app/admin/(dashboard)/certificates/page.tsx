'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Award,
  X,
  Upload,
  FileImage,
  Link,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface Certificate {
  id: string;
  title: string;
  section: string;
  imageUrl: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

type ImageSourceMode = 'upload' | 'url';

const defaultSections = ['General', 'MS-CIT', 'Tally', 'Excel', 'CAO', 'CMS', 'Python', 'Other'];

const sectionColors = [
  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'bg-violet-500/10 text-violet-600 border-violet-500/20',
  'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'bg-pink-500/10 text-pink-600 border-pink-500/20',
  'bg-orange-500/10 text-orange-600 border-orange-500/20',
];

function getSectionColor(section: string): string {
  if (!section) return sectionColors[0];
  let hash = 0;
  for (let i = 0; i < section.length; i++) {
    hash = section.charCodeAt(i) + ((hash << 5) - hash);
  }
  return sectionColors[Math.abs(hash) % sectionColors.length];
}

const emptyForm = {
  title: '',
  section: 'General',
  imageUrl: '',
  description: '',
  sortOrder: 0,
};

export default function CertificatesManagerPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<ImageSourceMode>('upload');
  const { canWrite } = usePermissions();

  const fetchCertificates = useCallback(async () => {
    try {
      const res = await fetch('/api/certificates');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      }
    } catch {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const sections = useMemo(() => {
    const secs = new Set<string>();
    defaultSections.forEach((s) => secs.add(s));
    certificates.forEach((c) => {
      if (c.section) secs.add(c.section);
    });
    return Array.from(secs).sort();
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    if (sectionFilter === 'all') return certificates;
    return certificates.filter((c) => c.section === sectionFilter);
  }, [certificates, sectionFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setImageMode('upload');
    setModalOpen(true);
  };

  const openEditModal = (cert: Certificate) => {
    setEditingId(cert.id);
    setFormData({
      title: cert.title,
      section: cert.section || 'General',
      imageUrl: cert.imageUrl || '',
      description: cert.description || '',
      sortOrder: cert.sortOrder,
    });
    setImageFile(null);
    setImagePreview(cert.imageUrl || '');
    setImageMode('upload');
    setModalOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('bucket', 'certificates');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }
      const result = await res.json();
      return result.imageUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to upload image';
      toast.error(msg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.imageUrl;

      if (imageMode === 'upload') {
        if (imageFile) {
          const uploadedUrl = await uploadImage(imageFile);
          if (!uploadedUrl) {
            setSaving(false);
            return;
          }
          imageUrl = uploadedUrl;
        }
      } else {
        if (!imageUrl) {
          toast.error('Please paste an image URL');
          setSaving(false);
          return;
        }
        setImagePreview(imageUrl);
      }

      if (editingId) {
        const res = await fetch(`/api/certificates/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, imageUrl }),
        });

        if (!res.ok) throw new Error('Failed to update');
        const updated = await res.json();

        setCertificates((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...updated } : c))
        );
        toast.success('Certificate updated successfully');
      } else {
        const res = await fetch('/api/certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, imageUrl }),
        });

        if (!res.ok) throw new Error('Failed to create');
        const created = await res.json();

        setCertificates((prev) => [...prev, created]);
        toast.success('Certificate added successfully');
      }

      setModalOpen(false);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/certificates/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setCertificates((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success('Certificate deleted');
    } catch {
      toast.error('Failed to delete certificate');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">
            {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
            {sectionFilter !== 'all' && (
              <span> &middot; {filteredCertificates.length} in {sectionFilter}</span>
            )}
          </p>
        </div>
        {canWrite('certificates') && (
          <Button onClick={openCreateModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
            <Upload className="w-4 h-4" />
            Add Certificate
          </Button>
        )}
      </div>

      {/* Section Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
            <SelectValue placeholder="All Sections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {sections.map((sec) => (
              <SelectItem key={sec} value={sec}>{sec}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No certificates yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Add your first certificate image to get started.
              </p>
              {canWrite('certificates') && (
                <Button onClick={openCreateModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
                  <Plus className="w-4 h-4" />
                  Add Certificate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredCertificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                  {cert.imageUrl ? (
                    <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                      <Image src={cert.imageUrl} alt={cert.title} fill sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-full shadow-lg" onClick={() => openEditModal(cert)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="destructive" size="sm" className="h-8 w-8 p-0 rounded-full shadow-lg" onClick={() => setDeleteId(cert.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-brand-purple/10 to-brand-yellow/10 flex items-center justify-center">
                      <Award className="w-12 h-12 text-brand-purple/30" />
                    </div>
                  )}
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate">{cert.title}</h3>
                    {cert.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{cert.description}</p>
                    )}
                    {cert.section && (
                      <Badge className={`text-[10px] mt-2 ${getSectionColor(cert.section)}`}>{cert.section}</Badge>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground">Order: {cert.sortOrder}</span>
                      <div className="flex gap-1 lg:hidden">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditModal(cert)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setDeleteId(cert.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Certificate' : 'Add New Certificate'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the certificate details below.' : 'Fill in the details and add a certificate.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image Source Toggle */}
            <div className="space-y-2">
              <Label>Image Source</Label>
              <div className="flex rounded-lg border border-input overflow-hidden">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                    imageMode === 'upload' ? 'bg-brand-purple text-white' : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Upload className="w-4 h-4" />Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                    imageMode === 'url' ? 'bg-brand-purple text-white' : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Link className="w-4 h-4" />Paste URL
                </button>
              </div>
            </div>

            {/* Image Upload / URL Input */}
            <div className="space-y-2">
              <Label>Certificate Image</Label>
              {imageMode === 'upload' ? (
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                      <button onClick={() => { setImageFile(null); setImagePreview(editingId ? formData.imageUrl : ''); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-border hover:border-brand-purple/50 bg-muted/30 cursor-pointer transition-colors gap-3">
                      <FileImage className="w-10 h-10 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Click to upload an image</p>
                        <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, GIF, WebP up to 5MB</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </label>
                  )}
                  {!imagePreview && (
                    <label className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-input bg-background text-sm cursor-pointer hover:bg-muted transition-colors w-full">
                      <Upload className="w-4 h-4" />Choose File
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </label>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Input value={formData.imageUrl} onChange={(e) => { setFormData({ ...formData, imageUrl: e.target.value }); setImagePreview(e.target.value); }} placeholder="https://example.com/certificate.jpg" type="url" />
                  {imagePreview && (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert-title">Title <span className="text-destructive">*</span></Label>
              <Input id="cert-title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. MS-CIT Certificate" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert-section">Section</Label>
              <Select
                value={formData.section && sections.includes(formData.section) ? formData.section : '__new__'}
                onValueChange={(value) => {
                  if (value === '__new__') {
                    setFormData({ ...formData, section: '' });
                  } else {
                    setFormData({ ...formData, section: value });
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select or type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__new__">+ New Section...</SelectItem>
                  {sections.map((sec) => (
                    <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formData.section === '' || !sections.includes(formData.section)) && (
              <div className="space-y-2">
                <Label htmlFor="cert-section-new">New Section Name</Label>
                <Input id="cert-section-new" value={formData.section || ''} onChange={(e) => setFormData({ ...formData, section: e.target.value })} placeholder="e.g. Academic, Sports, Events..." />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cert-description">Description</Label>
              <Textarea id="cert-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert-sort">Sort Order</Label>
              <Input id="cert-sort" type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving || uploading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving || uploading} className="bg-brand-purple hover:bg-brand-purple-dark">
              {saving || uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-1" />{uploading ? 'Uploading...' : 'Saving...'}</>
              ) : editingId ? 'Update Certificate' : 'Add Certificate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this certificate? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
