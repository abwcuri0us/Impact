'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  VideoIcon,
  ExternalLink,
  Youtube,
  Filter,
  Play,
  Upload,
  Film,
  FileVideo,
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

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  videoUrl: string;
  videoId: string;
  videoType: string;
  section: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const defaultSections = ['General', 'Events', 'Tutorials', 'Testimonials', 'Seminars'];

const sectionColors = [
  'bg-red-500/10 text-red-600 border-red-500/20',
  'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'bg-violet-500/10 text-violet-600 border-violet-500/20',
  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'bg-pink-500/10 text-pink-600 border-pink-500/20',
];

function getSectionColor(section: string): string {
  if (!section) return sectionColors[0];
  let hash = 0;
  for (let i = 0; i < section.length; i++) {
    hash = section.charCodeAt(i) + ((hash << 5) - hash);
  }
  return sectionColors[Math.abs(hash) % sectionColors.length];
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

const emptyForm = {
  title: '',
  youtubeUrl: '',
  videoUrl: '',
  section: 'General',
  description: '',
  sortOrder: 0,
};

export default function VideoManagerPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [urlPreviewId, setUrlPreviewId] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'youtube' | 'upload'>('youtube');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const { canWrite } = usePermissions();

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
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

  const sections = useMemo(() => {
    const secs = new Set<string>();
    defaultSections.forEach((s) => secs.add(s));
    videos.forEach((v) => {
      if (v.section) secs.add(v.section);
    });
    return Array.from(secs).sort();
  }, [videos]);

  const filteredVideos = useMemo(() => {
    if (sectionFilter === 'all') return videos;
    return videos.filter((v) => v.section === sectionFilter);
  }, [videos, sectionFilter]);

  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, youtubeUrl: url }));
    const id = extractYouTubeId(url);
    setUrlPreviewId(id);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setUrlPreviewId(null);
    setUploadMode('youtube');
    setUploadingFile(false);
    setUploadedVideoUrl('');
    setModalOpen(true);
  };

  const openEditModal = (video: Video) => {
    setEditingId(video.id);
    const isYT = !!extractYouTubeId(video.youtubeUrl || video.videoUrl || '');
    setFormData({
      title: video.title,
      youtubeUrl: isYT ? (video.youtubeUrl || video.videoUrl || '') : '',
      videoUrl: isYT ? '' : (video.videoUrl || ''),
      section: video.section || 'General',
      description: video.description || '',
      sortOrder: video.sortOrder,
    });
    setUploadMode(isYT ? 'youtube' : 'upload');
    setUrlPreviewId(video.videoId || null);
    setUploadedVideoUrl(isYT ? '' : (video.videoUrl || ''));
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`File is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed is 10MB.`);
      return;
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const allowedExts = ['.mp4', '.webm', '.ogg', '.mov'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      toast.error('Only MP4, WebM, OGG, and MOV video files are allowed.');
      return;
    }

    setUploadingFile(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: uploadData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      const { videoUrl } = await res.json();
      setUploadedVideoUrl(videoUrl);
      setFormData((prev) => ({ ...prev, videoUrl }));
      toast.success('Video uploaded successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    const isYouTube = uploadMode === 'youtube';
    const videoUrl = isYouTube ? formData.youtubeUrl : formData.videoUrl;

    if (!videoUrl) {
      toast.error(isYouTube ? 'YouTube URL is required' : 'Please upload a video file');
      return;
    }

    if (isYouTube && !extractYouTubeId(videoUrl)) {
      toast.error('Invalid YouTube URL. Please check the URL and try again.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        youtubeUrl: isYouTube ? videoUrl : '',
        videoUrl: isYouTube ? videoUrl : videoUrl,
        section: formData.section,
        description: formData.description,
        sortOrder: formData.sortOrder,
      };

      if (editingId) {
        const res = await fetch(`/api/videos/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Failed to update');
        const updated = await res.json();

        setVideos((prev) =>
          prev.map((v) => (v.id === editingId ? { ...v, ...updated } : v))
        );
        toast.success('Video updated successfully');
      } else {
        const res = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to create');
        }
        const created = await res.json();

        setVideos((prev) => [...prev, created]);
        toast.success('Video added successfully');
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
      const res = await fetch(`/api/videos/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setVideos((prev) => prev.filter((v) => v.id !== deleteId));
      toast.success('Video deleted');
    } catch {
      toast.error('Failed to delete video');
    } finally {
      setDeleteId(null);
    }
  };

  const isSubmitDisabled = (() => {
    if (!formData.title) return true;
    if (saving) return true;
    if (uploadMode === 'youtube') {
      return !formData.youtubeUrl || !urlPreviewId;
    }
    return !formData.videoUrl;
  })();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
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
            {videos.length} total video{videos.length !== 1 ? 's' : ''}
            {sectionFilter !== 'all' && (
              <span> &middot; {filteredVideos.length} in section: {sectionFilter}</span>
            )}
          </p>
        </div>
        {canWrite('videos') && (
          <Button onClick={openCreateModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
            <Plus className="w-4 h-4" />
            Add Video
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

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                <VideoIcon className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {sectionFilter !== 'all' ? `No videos in "${sectionFilter}"` : 'No videos yet'}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">Add a YouTube video or upload a video file (max 10MB) to get started.</p>
              {canWrite('videos') && (
                <Button onClick={openCreateModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
                  <Plus className="w-4 h-4" />
                  Add Video
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video, index) => {
              const isYouTube = video.videoType === 'youtube' || !!video.videoId;
              return (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {isYouTube ? (
                        <Image
                          src={getThumbnailUrl(video.videoId)}
                          alt={video.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/20 to-brand-purple-dark/30 flex items-center justify-center">
                          <FileVideo className="w-12 h-12 text-white/60" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-black/40" />
                        <a
                          href={video.youtubeUrl || video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        </a>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className={`${isYouTube ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'} text-[10px] px-1.5 gap-1`}>
                          {isYouTube ? <Youtube className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                          {isYouTube ? 'YouTube' : 'Uploaded'}
                        </Badge>
                      </div>
                      {video.section && (
                        <div className="absolute top-2 left-2">
                          <Badge className={`text-[10px] ${getSectionColor(video.section)}`}>{video.section}</Badge>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-full shadow-lg" onClick={() => openEditModal(video)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="destructive" size="sm" className="h-8 w-8 p-0 rounded-full shadow-lg" onClick={() => setDeleteId(video.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-muted-foreground">Order: {video.sortOrder}</span>
                            <a
                              href={video.youtubeUrl || video.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-brand-purple hover:underline"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />Open
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-3 sm:hidden">
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 flex-1" onClick={() => openEditModal(video)}>
                          <Pencil className="w-3 h-3" />Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 flex-1 text-red-500 hover:text-red-600" onClick={() => setDeleteId(video.id)}>
                          <Trash2 className="w-3 h-3" />Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Video' : 'Add New Video'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the video details below.' : 'Add a YouTube video or upload a video file.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Mode Toggle */}
            {!editingId && (
              <div className="flex rounded-lg border border-border p-1 bg-muted/50">
                <button
                  type="button"
                  onClick={() => setUploadMode('youtube')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    uploadMode === 'youtube'
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Youtube className="w-4 h-4 text-red-500" />
                  YouTube URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    uploadMode === 'upload'
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  Upload File
                </button>
              </div>
            )}

            {/* YouTube URL Input */}
            {uploadMode === 'youtube' && (
              <div className="space-y-2">
                <Label htmlFor="video-url">YouTube URL <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <Input id="video-url" value={formData.youtubeUrl} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="pl-10" type="url" />
                </div>
                <p className="text-[11px] text-muted-foreground">Supports youtube.com/watch?v=, youtu.be/, youtube.com/embed/</p>
              </div>
            )}

            {/* YouTube Preview */}
            {uploadMode === 'youtube' && urlPreviewId && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                  <Image src={getThumbnailUrl(urlPreviewId)} alt="Video thumbnail preview" fill sizes="500px" className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            {uploadMode === 'upload' && (
              <div className="space-y-3">
                <Label>Upload Video File</Label>
                {uploadedVideoUrl && editingId ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/5">
                    <FileVideo className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">Video file ready</p>
                      <p className="text-[11px] text-muted-foreground truncate">{uploadedVideoUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedVideoUrl('');
                        setFormData((prev) => ({ ...prev, videoUrl: '' }));
                      }}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="video-file-upload"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-24 gap-3 border-2 border-dashed hover:border-brand-purple/50 transition-colors"
                      onClick={() => document.getElementById('video-file-upload')?.click()}
                      disabled={uploadingFile}
                    >
                      {uploadingFile ? (
                        <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
                      ) : (
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      )}
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {uploadingFile ? 'Uploading...' : 'Click to upload video'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          MP4, WebM, OGG, MOV — Max 10MB
                        </p>
                      </div>
                    </Button>
                  </div>
                )}

                {/* Upload Progress / Success */}
                {uploadedVideoUrl && !editingId && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <p className="text-xs text-green-700 dark:text-green-400 font-medium">Video uploaded successfully</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="video-title">Title <span className="text-destructive">*</span></Label>
              <Input id="video-title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Impact Computers Annual Event 2024" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-section">Section</Label>
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
                <Label htmlFor="video-section-new">New Section Name</Label>
                <Input id="video-section-new" value={formData.section || ''} onChange={(e) => setFormData({ ...formData, section: e.target.value })} placeholder="e.g. Events, Seminars, Testimonials..." />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="video-description">Description</Label>
              <Textarea id="video-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the video..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-sort">Sort Order</Label>
              <Input id="video-sort" type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitDisabled} className="bg-brand-purple hover:bg-brand-purple-dark">
              {saving ? (<><Loader2 className="w-4 h-4 animate-spin mr-1" />Saving...</>) : editingId ? 'Update Video' : 'Add Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this video? This action cannot be undone.</AlertDialogDescription>
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
