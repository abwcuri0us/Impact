'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  Loader2,
  ImagePlus,
  Star,
  Users,
  X,
  Upload,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface FacultyMember {
  id: string;
  name: string;
  role: string;
  designation: string;
  experience: string;
  expertise: string;
  photoUrl: string;
  bio: string;
  isFounder: boolean;
  sortOrder: number;
  branch: string;
  createdAt: string;
  updatedAt: string;
}

const branches = [
  'Ghansoli - Sector 7',
  'Ghansoli - Sector 5',
  'Koparkhairne - Sector 19',
  'Koparkhairne - Sector 12B',
];

const branchColors: Record<string, string> = {
  'Ghansoli - Sector 7': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Ghansoli - Sector 5': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'Koparkhairne - Sector 19': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Koparkhairne - Sector 12B': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
};

const emptyForm = {
  name: '',
  role: '',
  experience: '',
  expertise: '',
  photoUrl: '',
  bio: '',
  isFounder: false,
  sortOrder: 0,
  branch: 'Ghansoli - Sector 7',
};

export default function FacultyManagerPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [cropRatio, setCropRatio] = useState<'1:1' | '4:3' | '3:4'>('3:4');
  const { canWrite } = usePermissions();

  const fetchFaculty = useCallback(async () => {
    try {
      const res = await fetch('/api/faculty');
      if (res.ok) {
        const data = await res.json();
        setFaculty(data);
      }
    } catch {
      toast.error('Failed to load faculty members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setPhotoFile(null);
    setPhotoPreview('');
    setCropRatio('3:4');
    setModalOpen(true);
  };

  const openEditModal = (member: FacultyMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      role: member.role || member.designation || '',
      designation: member.designation || '',
      experience: member.experience || '',
      expertise: member.expertise || '',
      photoUrl: member.photoUrl || '',
      bio: member.bio || '',
      isFounder: member.isFounder,
      sortOrder: member.sortOrder,
      branch: member.branch || 'Ghansoli - Sector 7',
    });
    setPhotoFile(null);
    setPhotoPreview(member.photoUrl || '');
    setCropRatio('3:4');
    setModalOpen(true);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('bucket', 'faculty');
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
      const msg = err instanceof Error ? err.message : 'Failed to upload photo';
      toast.error(msg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.role) {
      toast.error('Name and role are required');
      return;
    }

    setSaving(true);
    try {
      let photoUrl = formData.photoUrl;

      if (photoFile) {
        const uploadedUrl = await uploadPhoto(photoFile);
        if (!uploadedUrl) {
          setSaving(false);
          return;
        }
        photoUrl = uploadedUrl;
      }

      if (editingId) {
        const res = await fetch(`/api/faculty/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, photoUrl }),
        });

        if (!res.ok) throw new Error('Failed to update faculty member');
        const updated = await res.json();

        setFaculty((prev) =>
          prev.map((m) => (m.id === editingId ? { ...m, ...updated } : m))
        );
        toast.success('Faculty member updated successfully');
      } else {
        const res = await fetch('/api/faculty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, photoUrl }),
        });

        if (!res.ok) throw new Error('Failed to create faculty member');
        const created = await res.json();

        setFaculty((prev) => [...prev, created]);
        toast.success('Faculty member created successfully');
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
      const res = await fetch(`/api/faculty/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setFaculty((prev) => prev.filter((m) => m.id !== deleteId));
      toast.success('Faculty member deleted');
    } catch {
      toast.error('Failed to delete faculty member');
    } finally {
      setDeleteId(null);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
        <div className="hidden md:block space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
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
            {faculty.length} faculty member{faculty.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canWrite('faculty') && (
          <Button onClick={openCreateModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
            <UserPlus className="w-4 h-4" />
            Add Faculty Member
          </Button>
        )}
      </div>

      {/* Faculty List */}
      {faculty.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No faculty members yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Add your first faculty member to get started.</p>
              {canWrite('faculty') && (
                <Button onClick={openCreateModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
                  <Plus className="w-4 h-4" />
                  Add Faculty Member
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            <AnimatePresence>
              {faculty.map((member, index) => (
                <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl bg-brand-purple/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                          {member.photoUrl ? (
                            <Image src={member.photoUrl} alt={member.name} fill sizes="56px" className="object-cover" />
                          ) : (
                            <span className="text-brand-purple font-bold text-lg">{getInitials(member.name)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm truncate">{member.name}</h3>
                            {member.isFounder && (
                              <Badge className="bg-brand-yellow/10 text-brand-yellow-dark border-brand-yellow/20 text-[10px] px-1.5 py-0">
                                <Star className="w-2.5 h-2.5 mr-0.5" />Founder
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.role || member.designation}</p>
                          {member.branch && (
                            <Badge className={`text-[10px] mt-1.5 ${branchColors[member.branch] || 'bg-brand-purple/10 text-brand-purple'}`}>
                              <MapPin className="w-2.5 h-2.5 mr-0.5" />{member.branch}
                            </Badge>
                          )}
                          {canWrite('faculty') && (
                            <div className="flex items-center gap-2 mt-3">
                              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => openEditModal(member)}>
                                <Pencil className="w-3 h-3" />Edit
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-red-500" onClick={() => setDeleteId(member.id)}>
                                <Trash2 className="w-3 h-3" />Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Faculty Member</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Role</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Branch</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {faculty.map((member, index) => (
                        <motion.tr key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.03 }} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                {member.photoUrl ? (
                                  <Image src={member.photoUrl} alt={member.name} fill sizes="40px" className="object-cover" />
                                ) : (
                                  <span className="text-brand-purple font-bold text-sm">{getInitials(member.name)}</span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{member.name}</span>
                                  {member.isFounder && (
                                    <Badge className="bg-brand-yellow/10 text-brand-yellow-dark border-brand-yellow/20 text-[10px] px-1.5 py-0">
                                      <Star className="w-2.5 h-2.5 mr-0.5" />Founder
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">Sort: {member.sortOrder}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="text-sm">{member.role || member.designation}</span></td>
                          <td className="px-6 py-4">
                            <Badge className={`text-[10px] ${branchColors[member.branch] || 'bg-brand-purple/10 text-brand-purple'}`}>
                              <MapPin className="w-2.5 h-2.5 mr-0.5" />{member.branch || 'Ghansoli - Sector 7'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {canWrite('faculty') && <>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(member)}>
                                  <Pencil className="w-4 h-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => setDeleteId(member.id)}>
                                  <Trash2 className="w-4 h-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </>}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Faculty Member' : 'Add Faculty Member'}</DialogTitle>
            <DialogDescription>{editingId ? 'Update the faculty member details below.' : 'Fill in the details to add a new faculty member.'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Photo</Label>

              {/* Aspect Ratio Selection */}
              {photoPreview && (
                <div className="flex gap-2">
                  {(['3:4', '1:1', '4:3'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setCropRatio(ratio)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        cropRatio === ratio
                          ? 'bg-brand-purple text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <div
                  className={`bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border flex-shrink-0 ${
                    cropRatio === '3:4' ? 'w-20 h-[107px] rounded-2xl' : cropRatio === '1:1' ? 'w-24 h-24 rounded-full' : 'w-[107px] h-20 rounded-2xl'
                  }`}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className={`w-full h-full object-cover ${
                        cropRatio === '1:1' ? 'rounded-full' : 'rounded-2xl'
                      } border-2 border-yellow-500/70 shadow-[0_0_12px_rgba(234,179,8,0.25)]`}
                    />
                  ) : (
                    <ImagePlus className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-input bg-background text-sm cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="w-4 h-4" />
                    Choose Photo
                    <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                  </label>
                  {photoFile && (
                    <button onClick={() => { setPhotoFile(null); setPhotoPreview(formData.photoUrl); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive mt-1.5 transition-colors">
                      <X className="w-3 h-3" />Remove selected photo
                    </button>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">Recommended: Passport size or larger. Face should be clearly visible.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty-name">Name <span className="text-destructive">*</span></Label>
              <Input id="faculty-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Mr. Sharad Shinde" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty-role">Role / Designation <span className="text-destructive">*</span></Label>
              <Input id="faculty-role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Founder & Director" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty-branch"><span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Branch</span></Label>
              <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty-expertise">Bio / Expertise</Label>
              <Textarea id="faculty-expertise" value={formData.expertise || formData.bio || ''} onChange={(e) => setFormData({ ...formData, expertise: e.target.value, bio: e.target.value })} placeholder="e.g. MS-CIT, Tally, Advanced Excel" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 pt-2">
                <Checkbox id="faculty-founder" checked={formData.isFounder} onCheckedChange={(checked) => setFormData({ ...formData, isFounder: checked === true })} />
                <Label htmlFor="faculty-founder" className="cursor-pointer">Is Founder</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty-sort">Sort Order</Label>
                <Input id="faculty-sort" type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving || uploading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving || uploading || !formData.name || !formData.role} className="bg-brand-purple hover:bg-brand-purple-dark">
              {(saving || uploading) && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {uploading ? 'Uploading...' : saving ? 'Saving...' : editingId ? 'Update Member' : 'Create Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Faculty Member</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this faculty member? This action cannot be undone.</AlertDialogDescription>
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
