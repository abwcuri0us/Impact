'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  ShieldAlert,
  X,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// ── Types ──

interface GalleryPhoto {
  id: string;
  caption: string | null;
  image_url: string;
  section: string;
  is_active: boolean;
}

interface FormData {
  title: string;
  caption: string;
  section: string;
  imageUrl: string;
}

type ImageSourceMode = 'upload' | 'url';

// ── Constants ──

const SECTIONS = ['General', 'Campus', 'Events', 'Training', 'Students', 'Awards'];

const emptyForm: FormData = {
  title: '',
  caption: '',
  section: 'General',
  imageUrl: '',
};

// ── Section Color Helper ──

const sectionColorMap: Record<string, string> = {
  General: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  Campus: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  Events: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  Training: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  Students: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Awards: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

function getSectionColor(section: string): string {
  return sectionColorMap[section] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
}

// ── Component ──

export default function FacultyGalleryPage() {
  const { accessGranted, loading: accessLoading } = useFacultyAccess();

  // Gallery data
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [imageMode, setImageMode] = useState<ImageSourceMode>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch Photos ──

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setPhotos(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error('Failed to load gallery photos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // ── Modal Helpers ──

  const openUploadModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setImageMode('url');
    setImageFile(null);
    setImagePreview('');
    setSaving(false);
    setUploading(false);
    setModalOpen(true);
  };

  const openEditModal = (photo: GalleryPhoto) => {
    setEditingId(photo.id);
    setFormData({
      title: photo.caption || '',
      caption: photo.caption || '',
      section: photo.section || 'General',
      imageUrl: photo.image_url || '',
    });
    setImageMode('url');
    setImageFile(null);
    setImagePreview(photo.image_url || '');
    setSaving(false);
    setUploading(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
    setImageMode('url');
    setImageFile(null);
    setImagePreview('');
    setSaving(false);
    setUploading(false);
  };

  // ── Image File Handling ──

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(editingId ? formData.imageUrl : '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ── Upload Image to Server ──

  const uploadImageFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('bucket', 'photos');
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

  // ── Submit Handler ──

  const handleSubmit = async () => {
    const hasTitle = formData.title.trim() !== '';
    const hasCaption = formData.caption.trim() !== '';
    const hasImage = imageMode === 'url' ? formData.imageUrl.trim() !== '' : !!imageFile;

    if (!hasTitle && !hasCaption) {
      toast.error('Title or caption is required');
      return;
    }

    if (!hasImage && !editingId) {
      toast.error('Please provide an image URL or upload a file');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.imageUrl;

      if (imageMode === 'upload' && imageFile) {
        const uploadedUrl = await uploadImageFile(imageFile);
        if (!uploadedUrl) {
          setSaving(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      if (imageMode === 'url' && imageUrl && !imagePreview) {
        setImagePreview(imageUrl);
      }

      const payload = {
        title: formData.title || formData.caption,
        caption: formData.caption || formData.title,
        section: formData.section,
        imageUrl,
      };

      if (editingId) {
        const res = await fetch(`/api/gallery/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to update photo');
        }
        const updated = await res.json();
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  caption: updated.caption ?? p.caption,
                  image_url: updated.imageUrl ?? updated.image_url ?? p.image_url,
                  section: updated.section ?? p.section,
                }
              : p
          )
        );
        toast.success('Photo updated successfully');
      } else {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to upload photo');
        }
        const created = await res.json();
        setPhotos((prev) => [
          ...prev,
          {
            id: created.id,
            caption: created.caption ?? null,
            image_url: created.imageUrl ?? created.image_url ?? '',
            section: created.section ?? 'General',
            is_active: true,
          },
        ]);
        toast.success('Photo uploaded successfully');
      }

      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Handler ──

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/gallery/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete photo');
      }
      setPhotos((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success('Photo deleted successfully');
      setDeleteId(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete photo';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Loading Skeleton ──

  if (loading || accessLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gallery</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} in gallery
          </p>
        </div>
        {accessGranted && (
          <Button
            onClick={openUploadModal}
            className="gap-2 bg-brand-purple hover:bg-brand-purple-dark"
          >
            <Plus className="w-4 h-4" />
            Upload Photo
          </Button>
        )}
      </div>

      {/* ── View-Only Access Banner ── */}
      {!accessGranted && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            You are in <strong>view-only</strong> mode. Ask your admin to grant edit access if
            you need to upload or modify photos.
          </p>
        </div>
      )}

      {/* ── Gallery Grid ── */}
      {photos.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Photos Found</h3>
              <p className="text-muted-foreground text-sm mb-6">
                The gallery is currently empty.
              </p>
              {accessGranted && (
                <Button
                  onClick={openUploadModal}
                  className="gap-2 bg-brand-purple hover:bg-brand-purple-dark"
                >
                  <Plus className="w-4 h-4" />
                  Upload First Photo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {photo.image_url ? (
                      <img
                        src={photo.image_url}
                        alt={photo.caption || 'Gallery photo'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
                      </div>
                    )}

                    {/* Hover Overlay with Edit & Delete Buttons */}
                    {accessGranted && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-9 w-9 p-0 rounded-full shadow-lg"
                          onClick={() => openEditModal(photo)}
                          aria-label="Edit photo"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-9 w-9 p-0 rounded-full shadow-lg"
                          onClick={() => setDeleteId(photo.id)}
                          aria-label="Delete photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Section Badge */}
                    {photo.section && photo.section !== 'General' && (
                      <div className="absolute top-2 left-2">
                        <Badge
                          className={`text-[10px] ${getSectionColor(photo.section)}`}
                        >
                          {photo.section}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-3">
                    {photo.caption && (
                      <p className="text-sm font-medium truncate">{photo.caption}</p>
                    )}
                    {!photo.caption && (
                      <p className="text-sm text-muted-foreground truncate">Untitled</p>
                    )}

                    {/* Mobile-only action buttons */}
                    {accessGranted && (
                      <div className="flex gap-1 mt-2 lg:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openEditModal(photo)}
                          aria-label="Edit photo"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                          onClick={() => setDeleteId(photo.id)}
                          aria-label="Delete photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════
          UPLOAD / EDIT MODAL
          ══════════════════════════════════════════ */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Photo' : 'Upload Photo'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the photo details below.'
                : 'Add a new photo to the gallery.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* ── Image Source Toggle ── */}
            <div className="space-y-2">
              <Label>Image Source</Label>
              <div className="flex rounded-lg border border-input overflow-hidden">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                    imageMode === 'url'
                      ? 'bg-brand-purple text-white'
                      : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Paste URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                    imageMode === 'upload'
                      ? 'bg-brand-purple text-white'
                      : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
              </div>
            </div>

            {/* ── Image URL Input ── */}
            {imageMode === 'url' && (
              <div className="space-y-2">
                <Label htmlFor="image-url">
                  Image URL {!editingId && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="image-url"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/photo.jpg"
                  type="url"
                />
                {imagePreview && (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── File Upload ── */}
            {imageMode === 'upload' && (
              <div className="space-y-2">
                <Label>
                  Image {!editingId && <span className="text-destructive">*</span>}
                </Label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-border hover:border-brand-purple/50 bg-muted/30 cursor-pointer transition-colors gap-3">
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium">Click to upload an image</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        PNG, JPG, GIF, WebP up to 5MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
                {!imagePreview && (
                  <label className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-input bg-background text-sm cursor-pointer hover:bg-muted transition-colors w-full">
                    <Upload className="w-4 h-4" />
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* ── Caption ── */}
            <div className="space-y-2">
              <Label htmlFor="photo-caption">
                Caption <span className="text-destructive">*</span>
              </Label>
              <Input
                id="photo-caption"
                value={formData.caption}
                onChange={(e) => {
                  setFormData({ ...formData, caption: e.target.value, title: e.target.value });
                }}
                placeholder="e.g. Students during the annual workshop"
              />
            </div>

            {/* ── Section Select ── */}
            <div className="space-y-2">
              <Label htmlFor="photo-section">Section</Label>
              <Select
                value={formData.section}
                onValueChange={(value) => setFormData({ ...formData, section: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((sec) => (
                    <SelectItem key={sec} value={sec}>
                      {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={saving || uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || uploading}
              className="bg-brand-purple hover:bg-brand-purple-dark"
            >
              {saving || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  {uploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : editingId ? (
                'Update Photo'
              ) : (
                'Upload Photo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════
          DELETE CONFIRMATION DIALOG
          ══════════════════════════════════════════ */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
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
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
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
