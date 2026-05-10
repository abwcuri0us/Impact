'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  ImageIcon,
  X,
  FileImage,
  Link,
  Filter,
  Images,
  Check,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  caption: string;
  section: string;
  imageUrl: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface BatchFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

type ImageSourceMode = 'upload' | 'url';
type ModalMode = 'single' | 'batch' | null;

const defaultSections = ['General', 'Campus', 'Events', 'Training', 'Students', 'Awards'];

const sectionColors = [
  'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'bg-pink-500/10 text-pink-600 border-pink-500/20',
  'bg-violet-500/10 text-violet-600 border-violet-500/20',
  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'bg-amber-500/10 text-amber-600 border-amber-500/20',
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
  caption: '',
  section: 'General',
  imageUrl: '',
  description: '',
  sortOrder: 0,
};

export default function GalleryManagerPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<ImageSourceMode>('upload');
  const { canWrite } = usePermissions();

  // Batch upload state
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [batchSection, setBatchSection] = useState('General');
  const [batchNewSection, setBatchNewSection] = useState('');
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch {
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const sections = useMemo(() => {
    const secs = new Set<string>();
    defaultSections.forEach((s) => secs.add(s));
    images.forEach((img) => {
      if (img.section) secs.add(img.section);
    });
    return Array.from(secs).sort();
  }, [images]);

  const filteredImages = useMemo(() => {
    if (sectionFilter === 'all') return images;
    return images.filter((img) => img.section === sectionFilter);
  }, [images, sectionFilter]);

  const openSingleModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setImageMode('upload');
    setModalMode('single');
  };

  const openBatchModal = () => {
    setBatchFiles([]);
    setBatchSection('General');
    setBatchNewSection('');
    setBatchUploading(false);
    setBatchProgress(0);
    setModalMode('batch');
  };

  const openEditModal = (img: GalleryImage) => {
    setEditingId(img.id);
    setFormData({
      title: img.title,
      caption: img.caption || '',
      section: img.section || 'General',
      imageUrl: img.imageUrl,
      description: img.description || '',
      sortOrder: img.sortOrder,
    });
    setImageFile(null);
    setImagePreview(img.imageUrl || '');
    setImageMode('upload');
    setModalMode('single');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
    setImageFile(null);
    setImagePreview('');
    setSaving(false);
    setUploading(false);
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

  const uploadSingleImage = async (file: File): Promise<string | null> => {
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

  const handleSubmit = async () => {
    if (!formData.title && !formData.caption) {
      toast.error('Title or caption is required');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.imageUrl;

      if (imageMode === 'upload') {
        if (imageFile) {
          const uploadedUrl = await uploadSingleImage(imageFile);
          if (!uploadedUrl) {
            setSaving(false);
            return;
          }
          imageUrl = uploadedUrl;
        } else if (!editingId && !imageUrl) {
          toast.error('Please upload an image or paste a URL');
          setSaving(false);
          return;
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
        const res = await fetch(`/api/gallery/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, imageUrl }),
        });

        if (!res.ok) throw new Error('Failed to update');
        const updated = await res.json();

        setImages((prev) =>
          prev.map((img) => (img.id === editingId ? { ...img, ...updated } : img))
        );
        toast.success('Gallery image updated successfully');
      } else {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, imageUrl }),
        });

        if (!res.ok) throw new Error('Failed to create');
        const created = await res.json();

        setImages((prev) => [...prev, created]);
        toast.success('Gallery image uploaded successfully');
      }

      closeModal();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/gallery/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setImages((prev) => prev.filter((img) => img.id !== deleteId));
      toast.success('Gallery image deleted');
    } catch {
      toast.error('Failed to delete gallery image');
    } finally {
      setDeleteId(null);
    }
  };

  // ── Batch Upload Logic ──
  const getResolvedSection = (): string => {
    if (batchSection === '__new__') {
      return batchNewSection.trim() || 'General';
    }
    return batchSection;
  };

  const handleBatchFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newBatchFiles: BatchFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview = URL.createObjectURL(file);
      newBatchFiles.push({ file, preview, status: 'pending', progress: 0 });
    }

    setBatchFiles((prev) => [...prev, ...newBatchFiles]);

    // Reset the input so the same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeBatchFile = (index: number) => {
    setBatchFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleBatchUpload = async () => {
    const section = getResolvedSection();
    if (!section || section === 'General' && batchSection === '__new__' && !batchNewSection.trim()) {
      toast.error('Please select or create a section');
      return;
    }

    if (batchFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setBatchUploading(true);
    setBatchProgress(0);

    let successCount = 0;
    let errorCount = 0;
    const totalFiles = batchFiles.length;

    for (let i = 0; i < batchFiles.length; i++) {
      const bf = batchFiles[i];

      // Mark as uploading
      setBatchFiles((prev) =>
        prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' as const, progress: 10 } : f)
      );

      try {
        // Step 1: Upload the file
        const formData = new FormData();
        formData.append('file', bf.file);
        formData.append('bucket', 'photos');

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        setBatchFiles((prev) =>
          prev.map((f, idx) => idx === i ? { ...f, progress: 50 } : f)
        );

        if (!uploadRes.ok) {
          throw new Error('File upload failed');
        }
        const uploadResult = await uploadRes.json();
        const imageUrl = uploadResult.imageUrl;

        // Step 2: Save to gallery
        const fileName = bf.file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const saveRes = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: fileName.charAt(0).toUpperCase() + fileName.slice(1),
            caption: '',
            section,
            imageUrl,
            sortOrder: 0,
          }),
        });

        setBatchFiles((prev) =>
          prev.map((f, idx) => idx === i ? { ...f, progress: 90 } : f)
        );

        if (!saveRes.ok) {
          throw new Error('Failed to save gallery entry');
        }

        const savedImage = await saveRes.json();

        // Mark as success
        setBatchFiles((prev) =>
          prev.map((f, idx) => idx === i ? { ...f, status: 'success' as const, progress: 100 } : f)
        );

        // Add to gallery list
        setImages((prev) => [...prev, savedImage]);
        successCount++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        setBatchFiles((prev) =>
          prev.map((f, idx) => idx === i ? { ...f, status: 'error' as const, progress: 0, error: errorMsg } : f)
        );
        errorCount++;
      }

      setBatchProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    setBatchUploading(false);

    if (errorCount === 0) {
      toast.success(`All ${successCount} images uploaded successfully!`);
    } else if (successCount > 0) {
      toast.warning(`${successCount} uploaded, ${errorCount} failed`);
    } else {
      toast.error(`All ${errorCount} uploads failed. Please try again.`);
    }

    // Auto-close after a brief delay if all succeeded
    if (errorCount === 0) {
      setTimeout(() => {
        setModalMode(null);
        setBatchFiles([]);
      }, 1500);
    }
  };

  const pendingCount = batchFiles.filter((f) => f.status === 'pending').length;
  const successCount = batchFiles.filter((f) => f.status === 'success').length;
  const errorCount = batchFiles.filter((f) => f.status === 'error').length;

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
            {images.length} total image{images.length !== 1 ? 's' : ''}
            {sectionFilter !== 'all' && (
              <span> &middot; {filteredImages.length} in {sectionFilter}</span>
            )}
          </p>
        </div>
        {canWrite('gallery') && (
          <div className="flex items-center gap-2">
            <Button onClick={openBatchModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
              <Images className="w-4 h-4" />
              Batch Upload
            </Button>
            <Button onClick={openSingleModal} variant="outline" className="gap-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white">
              <Plus className="w-4 h-4" />
              Add Single
            </Button>
          </div>
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
              <SelectItem key={sec} value={sec}>
                {sec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No gallery images found</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Upload your first image to get started.
              </p>
              {canWrite('gallery') && (
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={openBatchModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
                    <Images className="w-4 h-4" />
                    Batch Upload
                  </Button>
                  <Button onClick={openSingleModal} variant="outline" className="gap-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white">
                    <Plus className="w-4 h-4" />
                    Add Single
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img, index) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <Image
                      src={img.imageUrl}
                      alt={img.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-full shadow-lg" onClick={() => openEditModal(img)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="destructive" size="sm" className="h-8 w-8 p-0 rounded-full shadow-lg" onClick={() => setDeleteId(img.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {img.section && (
                      <div className="absolute top-2 left-2">
                        <Badge className={`text-[10px] ${getSectionColor(img.section)}`}>{img.section}</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate">{img.title || 'Untitled'}</h3>
                    {img.caption && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 italic">
                        &ldquo;{img.caption}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground">Order: {img.sortOrder}</span>
                      <div className="flex gap-1 lg:hidden">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditModal(img)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setDeleteId(img.id)}>
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

      {/* ═══════ SINGLE IMAGE MODAL ═══════ */}
      <Dialog open={modalMode === 'single'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Gallery Image' : 'Add New Image'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the gallery image details below.' : 'Fill in the details and add an image.'}
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
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                    imageMode === 'url' ? 'bg-brand-purple text-white' : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Link className="w-4 h-4" />
                  Paste URL
                </button>
              </div>
            </div>

            {/* Image Upload / URL Input */}
            <div className="space-y-2">
              <Label>Image <span className="text-destructive">*</span></Label>
              {imageMode === 'upload' ? (
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(editingId ? formData.imageUrl : '');
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                      >
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
                      <Upload className="w-4 h-4" />
                      Choose File
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </label>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                  {imagePreview && (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="gallery-title">Title</Label>
              <Input
                id="gallery-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. MS-CIT Classroom"
              />
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="gallery-caption">Caption</Label>
              <Input
                id="gallery-caption"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                placeholder="e.g. Students practicing MS-CIT modules"
              />
            </div>

            {/* Section */}
            <div className="space-y-2">
              <Label htmlFor="gallery-section">Section</Label>
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

            {/* Custom Section Input */}
            {(formData.section === '' || !sections.includes(formData.section)) && (
              <div className="space-y-2">
                <Label htmlFor="gallery-section-new">New Section Name</Label>
                <Input
                  id="gallery-section-new"
                  value={formData.section || ''}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="e.g. Campus, Events, Seminars..."
                />
              </div>
            )}

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="gallery-sort">Sort Order</Label>
              <Input
                id="gallery-sort"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={saving || uploading}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || uploading}
              className="bg-brand-purple hover:bg-brand-purple-dark"
            >
              {saving || uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-1" />{uploading ? 'Uploading...' : 'Saving...'}</>
              ) : editingId ? 'Update Image' : 'Add Image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ BATCH UPLOAD MODAL ═══════ */}
      <Dialog open={modalMode === 'batch'} onOpenChange={(open) => !open && !batchUploading && setModalMode(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Images className="w-5 h-5 text-brand-purple" />
              Batch Upload Photos
            </DialogTitle>
            <DialogDescription>
              Select a section, choose multiple images, and upload them all at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Section Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Section <span className="text-destructive">*</span>
                <span className="text-xs font-normal text-muted-foreground ml-1">— All photos will be added to this section</span>
              </Label>
              <Select
                value={batchSection}
                onValueChange={setBatchSection}
                disabled={batchUploading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__new__">+ Create New Section...</SelectItem>
                  {sections.map((sec) => (
                    <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {batchSection === '__new__' && (
                <Input
                  value={batchNewSection}
                  onChange={(e) => setBatchNewSection(e.target.value)}
                  placeholder="Enter new section name..."
                  disabled={batchUploading}
                  className="mt-2"
                />
              )}
            </div>

            {/* Drop Zone / File Picker */}
            {!batchUploading && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Select Photos</Label>
                <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-brand-purple/30 hover:border-brand-purple/60 bg-brand-purple/5 hover:bg-brand-purple/10 cursor-pointer transition-all gap-3">
                  <Upload className="w-10 h-10 text-brand-purple" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-brand-purple">Click to select multiple photos</p>
                    <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, GIF, WebP &bull; Select as many as you want</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBatchFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Progress Bar */}
            {batchUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Uploading...</span>
                  <span className="text-muted-foreground">{batchProgress}%</span>
                </div>
                <Progress value={batchProgress} className="h-2" />
              </div>
            )}

            {/* File Preview Grid */}
            {batchFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Selected Photos ({batchFiles.length})
                  </Label>
                  {(successCount > 0 || errorCount > 0) && (
                    <div className="flex items-center gap-2 text-xs">
                      {successCount > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" />{successCount} uploaded
                        </span>
                      )}
                      {errorCount > 0 && (
                        <span className="flex items-center gap-1 text-red-500">
                          <AlertCircle className="w-3 h-3" />{errorCount} failed
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto p-1">
                  {batchFiles.map((bf, index) => (
                    <div
                      key={`${bf.file.name}-${index}`}
                      className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                        bf.status === 'success' ? 'border-green-500' :
                        bf.status === 'error' ? 'border-red-500' :
                        bf.status === 'uploading' ? 'border-brand-purple animate-pulse' :
                        'border-border'
                      }`}
                    >
                      <img
                        src={bf.preview}
                        alt={bf.file.name}
                        className="w-full aspect-square object-cover"
                      />
                      {/* Status overlay */}
                      {bf.status === 'success' && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                      {bf.status === 'error' && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                      )}
                      {bf.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                      {/* Remove button */}
                      {!batchUploading && (
                        <button
                          onClick={() => removeBatchFile(index)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      {/* File name */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                        <p className="text-[9px] text-white truncate">{bf.file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add more files button */}
                {!batchUploading && (
                  <label className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-dashed border-brand-purple/30 hover:border-brand-purple/60 bg-brand-purple/5 hover:bg-brand-purple/10 text-sm cursor-pointer transition-colors text-brand-purple font-medium w-full">
                    <Plus className="w-4 h-4" />
                    Add More Photos
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBatchFileSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMode(null)} disabled={batchUploading}>
              {successCount > 0 && errorCount > 0 ? 'Close' : 'Cancel'}
            </Button>
            <Button
              onClick={handleBatchUpload}
              disabled={batchUploading || pendingCount === 0 || !getResolvedSection()}
              className="bg-brand-purple hover:bg-brand-purple-dark"
            >
              {batchUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Uploading {pendingCount > 0 ? `(${pendingCount} remaining)` : '...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1" />
                  Upload {batchFiles.length} Photo{batchFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gallery Image</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this gallery image? This action cannot be undone.</AlertDialogDescription>
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
