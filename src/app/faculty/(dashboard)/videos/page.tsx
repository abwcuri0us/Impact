'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Video, Plus, Pencil, Trash2, Loader2, ShieldAlert, Play } from 'lucide-react';
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VideoItem {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  section: string;
  description: string | null;
  is_active: boolean;
}

interface FormData {
  title: string;
  youtubeUrl: string;
  section: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SECTIONS = ['General', 'Tutorials', 'Seminars', 'Events', 'Testimonials'];

const EMPTY_FORM: FormData = {
  title: '',
  youtubeUrl: '',
  section: 'General',
  description: '',
};

const sectionColors: Record<string, string> = {
  General: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  Tutorials: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  Seminars: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  Events: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Testimonials: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isValidYouTubeUrl(url: string): boolean {
  return (
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url) &&
    extractYouTubeId(url) !== null
  );
}

function getThumbnailUrl(video: VideoItem): string {
  if (video.thumbnail_url) return video.thumbnail_url;
  const id = extractYouTubeId(video.video_url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

function getSectionColor(section: string): string {
  return sectionColors[section] || 'bg-brand-purple/10 text-brand-purple border-brand-purple/20';
}

function getYouTubeUrl(video: VideoItem): string {
  return video.video_url || '';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FacultyVideosPage() {
  const { accessGranted, loading: accessLoading } = useFacultyAccess();

  // Data
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [urlPreviewId, setUrlPreviewId] = useState<string | null>(null);
  const [urlError, setUrlError] = useState('');

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // -----------------------------------------------------------------------
  // Fetch
  // -----------------------------------------------------------------------

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // -----------------------------------------------------------------------
  // URL helpers
  // -----------------------------------------------------------------------

  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, youtubeUrl: url }));
    setUrlError('');

    if (!url) {
      setUrlPreviewId(null);
      return;
    }

    if (isValidYouTubeUrl(url)) {
      setUrlPreviewId(extractYouTubeId(url));
    } else {
      setUrlPreviewId(null);
      setUrlError('Please enter a valid YouTube URL (youtube.com or youtu.be)');
    }
  };

  // -----------------------------------------------------------------------
  // Modal handlers
  // -----------------------------------------------------------------------

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setUrlPreviewId(null);
    setUrlError('');
    setModalOpen(true);
  };

  const openEditModal = (video: VideoItem) => {
    setEditingId(video.id);
    setFormData({
      title: video.title,
      youtubeUrl: video.video_url,
      section: video.section || 'General',
      description: video.description || '',
    });
    setUrlPreviewId(extractYouTubeId(video.video_url));
    setUrlError('');
    setModalOpen(true);
  };

  // -----------------------------------------------------------------------
  // Submit (Add / Edit)
  // -----------------------------------------------------------------------

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.youtubeUrl.trim()) {
      toast.error('YouTube URL is required');
      return;
    }

    if (!isValidYouTubeUrl(formData.youtubeUrl)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        // PUT /api/videos/{id}
        const res = await fetch(`/api/videos/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update video');
        }

        const updated = await res.json();
        setVideos((prev) =>
          prev.map((v) =>
            v.id === editingId
              ? {
                  ...v,
                  title: updated.title ?? v.title,
                  video_url: updated.youtubeUrl ?? updated.videoUrl ?? v.video_url,
                  thumbnail_url: updated.thumbnail_url ?? v.thumbnail_url,
                  section: updated.section ?? v.section,
                  description: updated.description ?? v.description,
                }
              : v
          )
        );

        toast.success('Video updated successfully');
      } else {
        // POST /api/videos
        const res = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to add video');
        }

        const created = await res.json();
        setVideos((prev) => [
          ...prev,
          {
            id: created.id,
            title: created.title,
            video_url: created.youtubeUrl || created.video_url || formData.youtubeUrl,
            thumbnail_url: created.thumbnail_url || null,
            section: created.section || formData.section,
            description: created.description || formData.description || null,
            is_active: true,
          },
        ]);

        toast.success('Video added successfully');
      }

      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/videos/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete video');
      }

      setVideos((prev) => prev.filter((v) => v.id !== deleteId));
      toast.success('Video deleted successfully');
      setDeleteId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete video');
    } finally {
      setDeleting(false);
    }
  };

  // -----------------------------------------------------------------------
  // Loading skeleton
  // -----------------------------------------------------------------------

  if (loading || accessLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Videos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {videos.length} video{videos.length !== 1 ? 's' : ''} available
          </p>
        </div>
        {accessGranted && (
          <Button onClick={openCreateModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
            <Plus className="w-4 h-4" />
            Add Video
          </Button>
        )}
      </div>

      {/* ---- Access Banner ---- */}
      {!accessGranted && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3"
        >
          <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            You are in <strong>view-only</strong> mode. Ask your admin to grant edit access if you need to add or modify videos.
          </p>
        </motion.div>
      )}

      {/* ---- Video Grid ---- */}
      {videos.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Videos Found</h3>
              <p className="text-muted-foreground text-sm mb-6">
                No videos are currently available. Add your first YouTube video to get started.
              </p>
              {accessGranted && (
                <Button onClick={openCreateModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
                  <Plus className="w-4 h-4" />
                  Add Video
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {videos.map((video, index) => {
              const thumbnailSrc = getThumbnailUrl(video);
              const ytUrl = getYouTubeUrl(video);

              return (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {thumbnailSrc ? (
                        <img
                          src={thumbnailSrc}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/10 to-brand-purple-dark/10">
                          <Video className="w-12 h-12 text-brand-purple/30" />
                        </div>
                      )}

                      {/* Play button — center overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-black/40" />
                        {ytUrl && (
                          <a
                            href={ytUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Play className="w-6 h-6 text-white ml-0.5" />
                          </a>
                        )}
                      </div>

                      {/* Static play button (always visible) */}
                      <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-black/60 flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 text-brand-purple ml-0.5" />
                        </div>
                      </div>

                      {/* Section badge — top left */}
                      {video.section && video.section !== 'General' && (
                        <div className="absolute top-2 left-2">
                          <Badge className={`text-[10px] ${getSectionColor(video.section)}`}>
                            {video.section}
                          </Badge>
                        </div>
                      )}

                      {/* Edit / Delete buttons — hover overlay, only when accessGranted */}
                      {accessGranted && (
                        <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(video);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(video.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>

                      {/* Mobile-only edit/delete row */}
                      {accessGranted && (
                        <div className="flex gap-1.5 mt-3 sm:hidden">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1 flex-1"
                            onClick={() => openEditModal(video)}
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1 flex-1 text-red-500 hover:text-red-600"
                            onClick={() => setDeleteId(video.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ---- Add / Edit Modal ---- */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Video' : 'Add New Video'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the video details below.'
                : 'Paste a YouTube URL to add a video to the gallery.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* YouTube URL */}
            <div className="space-y-2">
              <Label htmlFor="youtube-url">
                YouTube URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="youtube-url"
                value={formData.youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                type="url"
              />
              {urlError && <p className="text-xs text-destructive">{urlError}</p>}
              <p className="text-[11px] text-muted-foreground">
                Supports youtube.com/watch?v=, youtu.be/, youtube.com/embed/
              </p>
            </div>

            {/* Thumbnail preview */}
            {urlPreviewId && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                  <img
                    src={`https://img.youtube.com/vi/${urlPreviewId}/hqdefault.jpg`}
                    alt="Video thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="video-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="video-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. Impact Computers Annual Event 2024"
              />
            </div>

            {/* Section */}
            <div className="space-y-2">
              <Label htmlFor="video-section">Section</Label>
              <Select
                value={formData.section}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, section: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a section" />
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="video-description">Description</Label>
              <Textarea
                id="video-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description of the video..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                saving ||
                !formData.title.trim() ||
                !formData.youtubeUrl.trim() ||
                !urlPreviewId
              }
              className="bg-brand-purple hover:bg-brand-purple-dark"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Saving...
                </>
              ) : editingId ? (
                'Update Video'
              ) : (
                'Add Video'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Confirmation ---- */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
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
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
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
