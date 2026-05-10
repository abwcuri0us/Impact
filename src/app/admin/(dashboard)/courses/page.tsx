'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Loader2,
  Star,
  Search,
  Clock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowUpDown,
  Upload,
  ImageIcon,
  X,
  CheckCircle,
  ChevronRight,
  IndianRupee,
  Award,
  Crop,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
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

interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  duration: string;
  fees: string;
  description: string;
  overview: string;
  syllabus: string[];
  benefits: string[];
  color: string;
  popular: boolean;
  certification: string;
  examDetails: string;
  iconUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const lucideIcons = [
  'GraduationCap', 'BookOpen', 'Laptop', 'Code', 'Calculator',
  'FileSpreadsheet', 'FileCode', 'Monitor', 'PieChart', 'BarChart3',
  'Database', 'Keyboard', 'Type', 'Verified', 'Award',
  'Shield', 'Star', 'Zap', 'Globe', 'Brain',
  'Cpu', 'Layers', 'Terminal', 'Presentation', 'School',
];

const gradientPresets = [
  { value: 'from-brand-purple to-brand-purple-dark', label: 'Purple', preview: 'bg-gradient-to-r from-brand-purple to-brand-purple-dark' },
  { value: 'from-brand-purple-dark to-brand-purple-deep', label: 'Deep Purple', preview: 'bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep' },
  { value: 'from-brand-purple-light to-brand-purple', label: 'Light Purple', preview: 'bg-gradient-to-r from-brand-purple-light to-brand-purple' },
  { value: 'from-brand-yellow-dark to-brand-yellow', label: 'Yellow', preview: 'bg-gradient-to-r from-brand-yellow-dark to-brand-yellow' },
  { value: 'from-brand-yellow to-brand-yellow-dark', label: 'Gold', preview: 'bg-gradient-to-r from-brand-yellow to-brand-yellow-dark' },
  { value: 'from-emerald-500 to-emerald-700', label: 'Emerald', preview: 'bg-gradient-to-r from-emerald-500 to-emerald-700' },
  { value: 'from-orange-500 to-orange-700', label: 'Orange', preview: 'bg-gradient-to-r from-orange-500 to-orange-700' },
  { value: 'from-rose-500 to-rose-700', label: 'Rose', preview: 'bg-gradient-to-r from-rose-500 to-rose-700' },
  { value: 'from-cyan-500 to-cyan-700', label: 'Cyan', preview: 'bg-gradient-to-r from-cyan-500 to-cyan-700' },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const emptyForm = {
  title: '',
  subtitle: '',
  slug: '',
  icon: 'GraduationCap',
  duration: '',
  fees: '',
  description: '',
  overview: '',
  syllabusText: '',
  benefitsText: '',
  color: 'from-brand-purple to-brand-purple-dark',
  popular: false,
  certification: '',
  examDetails: '',
  iconUrl: '',
  sortOrder: 0,
  isActive: true,
};

type SortField = 'sortOrder' | 'title' | 'duration' | 'createdAt';
type SortDir = 'asc' | 'desc';

export default function CoursesManagerPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<SortField>('sortOrder');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const { canWrite } = usePermissions();

  // --- Crop Dialog State & Refs ---
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropBoxRender, setCropBoxRender] = useState({ x: 0, y: 0, size: 100 });
  const [cropImgLoaded, setCropImgLoaded] = useState(false);
  const cropBoxRef = useRef({ x: 0, y: 0, size: 100 });
  const interactionRef = useRef<'none' | 'drag' | 'resize'>('none');
  const dragStartRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0, cropSize: 0 });
  const cropImgDimsRef = useRef({ width: 0, height: 0 });
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CROP_CONTAINER_SIZE = 300;

  // --- Browse Dialog State ---
  const [browseDialogOpen, setBrowseDialogOpen] = useState(false);
  const [browseIcons, setBrowseIcons] = useState<Course[]>([]);
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseLoading, setBrowseLoading] = useState(false);

  // --- Crop Helpers ---
  const getDisplayBounds = () => {
    const { width, height } = cropImgDimsRef.current;
    if (!width || !height) return null;
    const scale = Math.min(CROP_CONTAINER_SIZE / width, CROP_CONTAINER_SIZE / height);
    const displayW = width * scale;
    const displayH = height * scale;
    const offsetX = (CROP_CONTAINER_SIZE - displayW) / 2;
    const offsetY = (CROP_CONTAINER_SIZE - displayH) / 2;
    return { scale, displayW, displayH, offsetX, offsetY };
  };

  // --- Crop Mouse Listeners ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const bounds = getDisplayBounds();
      if (!bounds) return;

      if (interactionRef.current === 'drag') {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        let newX = dragStartRef.current.cropX + dx;
        let newY = dragStartRef.current.cropY + dy;
        const { offsetX, offsetY, displayW, displayH } = bounds;
        const sz = cropBoxRef.current.size;
        newX = Math.max(offsetX, Math.min(newX, offsetX + displayW - sz));
        newY = Math.max(offsetY, Math.min(newY, offsetY + displayH - sz));
        cropBoxRef.current = { ...cropBoxRef.current, x: newX, y: newY };
        setCropBoxRender({ ...cropBoxRef.current });
      } else if (interactionRef.current === 'resize') {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const delta = Math.max(dx, dy);
        const maxW = bounds.offsetX + bounds.displayW - cropBoxRef.current.x;
        const maxH = bounds.offsetY + bounds.displayH - cropBoxRef.current.y;
        const maxSize = Math.min(maxW, maxH);
        const newSize = Math.max(30, Math.min(dragStartRef.current.cropSize + delta, maxSize));
        cropBoxRef.current = { ...cropBoxRef.current, size: newSize };
        setCropBoxRender({ ...cropBoxRef.current });
      }
    };

    const handleMouseUp = () => {
      interactionRef.current = 'none';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // --- Crop Preview (updates canvas during drag/resize) ---
  useEffect(() => {
    if (!cropImgLoaded || !canvasRef.current || !cropImageRef.current) return;
    const bounds = getDisplayBounds();
    if (!bounds) return;

    const canvas = canvasRef.current;
    const previewSize = 96;
    canvas.width = previewSize;
    canvas.height = previewSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const origX = (cropBoxRef.current.x - bounds.offsetX) / bounds.scale;
    const origY = (cropBoxRef.current.y - bounds.offsetY) / bounds.scale;
    const origSize = cropBoxRef.current.size / bounds.scale;

    ctx.clearRect(0, 0, previewSize, previewSize);
    ctx.drawImage(cropImageRef.current, origX, origY, origSize, origSize, 0, 0, previewSize, previewSize);
  }, [cropBoxRender, cropImgLoaded]);

  // --- Crop Event Handlers ---
  const handleCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    cropImageRef.current = img;
    const { naturalWidth: w, naturalHeight: h } = img;
    cropImgDimsRef.current = { width: w, height: h };
    const bounds = getDisplayBounds();
    if (bounds) {
      const initSize = Math.min(bounds.displayW, bounds.displayH) * 0.6;
      const initX = bounds.offsetX + (bounds.displayW - initSize) / 2;
      const initY = bounds.offsetY + (bounds.displayH - initSize) / 2;
      const box = { x: initX, y: initY, size: initSize };
      cropBoxRef.current = box;
      setCropBoxRender(box);
    }
    setCropImgLoaded(true);
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    interactionRef.current = 'drag';
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      cropX: cropBoxRef.current.x,
      cropY: cropBoxRef.current.y,
      cropSize: cropBoxRef.current.size,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    interactionRef.current = 'resize';
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      cropX: cropBoxRef.current.x,
      cropY: cropBoxRef.current.y,
      cropSize: cropBoxRef.current.size,
    };
  };

  const applyCrop = () => {
    const bounds = getDisplayBounds();
    if (!bounds || !cropImageRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const outputSize = 256;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const origX = (cropBoxRef.current.x - bounds.offsetX) / bounds.scale;
    const origY = (cropBoxRef.current.y - bounds.offsetY) / bounds.scale;
    const origSize = cropBoxRef.current.size / bounds.scale;

    ctx.drawImage(cropImageRef.current, origX, origY, origSize, origSize, 0, 0, outputSize, outputSize);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Failed to process cropped image');
        return;
      }
      setUploadingIcon(true);
      setCropDialogOpen(false);
      setCropImgLoaded(false);
      try {
        const uploadData = new FormData();
        uploadData.append('file', blob, 'cropped-icon.png');
        const res = await fetch('/api/upload/course-icon', {
          method: 'POST',
          body: uploadData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Upload failed');
        }
        const { iconUrl } = await res.json();
        setFormData((prev) => ({ ...prev, iconUrl }));
        toast.success('Cropped icon uploaded successfully');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to upload cropped icon');
      } finally {
        setUploadingIcon(false);
      }
    }, 'image/png');
  };

  const cancelCrop = () => {
    setCropDialogOpen(false);
    setCropImageSrc('');
    setCropImgLoaded(false);
  };

  // --- Browse Existing Handlers ---
  const openBrowseDialog = async () => {
    setBrowseDialogOpen(true);
    setBrowseLoading(true);
    setBrowseSearch('');
    try {
      const res = await fetch('/api/courses?all=true');
      if (res.ok) {
        const data: Course[] = await res.json();
        setBrowseIcons(data.filter((c) => c.iconUrl && (c.iconUrl.startsWith('http') || c.iconUrl.startsWith('/'))));
      }
    } catch {
      toast.error('Failed to load existing icons');
    } finally {
      setBrowseLoading(false);
    }
  };

  const selectBrowseIcon = (url: string) => {
    setFormData((prev) => ({ ...prev, iconUrl: url }));
    setBrowseDialogOpen(false);
    toast.success('Icon selected');
  };

  const filteredBrowseIcons = useMemo(() => {
    if (!browseSearch) return browseIcons;
    const q = browseSearch.toLowerCase();
    return browseIcons.filter((c) => c.title.toLowerCase().includes(q));
  }, [browseIcons, browseSearch]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses?all=true');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = useMemo(() => {
    let filtered = courses;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.subtitle || '').toLowerCase().includes(q) ||
          (c.certification || '').toLowerCase().includes(q) ||
          (c.slug || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter((c) => c.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((c) => !c.isActive);
    }

    return filtered.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'sortOrder') return (a.sortOrder - b.sortOrder) * dir;
      if (sortField === 'title') return (a.title || '').localeCompare(b.title || '') * dir;
      if (sortField === 'duration') return (a.duration || '').localeCompare(b.duration || '') * dir;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    });
  }, [courses, searchQuery, statusFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  // Sanitize any string field — remove literal \n, actual newlines, and trim
  const sanitize = (val: string | null | undefined, fallback = ''): string =>
    (val || fallback).replace(/[\\\n\r]/g, '').trim();

  const openEditModal = (course: Course) => {
    setEditingId(course.id);
    setFormData({
      title: sanitize(course.title),
      subtitle: sanitize(course.subtitle),
      slug: sanitize(course.slug),
      icon: sanitize(course.icon, 'GraduationCap'),
      duration: sanitize(course.duration),
      fees: sanitize(course.fees),
      description: sanitize(course.description),
      overview: sanitize(course.overview),
      syllabusText: Array.isArray(course.syllabus) ? course.syllabus.join('\n') : '',
      benefitsText: Array.isArray(course.benefits) ? course.benefits.join('\n') : '',
      color: sanitize(course.color, 'from-brand-purple to-brand-purple-dark'),
      popular: course.popular,
      certification: sanitize(course.certification),
      examDetails: sanitize(course.examDetails),
      iconUrl: sanitize(course.iconUrl),
      sortOrder: course.sortOrder,
      isActive: course.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error('Course title is required');
      return;
    }

    setSaving(true);
    try {
      const syllabus = formData.syllabusText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const benefits = formData.benefitsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const slug = formData.slug || generateSlug(formData.title);

      // Sanitize all text fields before sending
      const clean = (v: string) => v.replace(/[\\\n\r]/g, '').trim();

      const payload = {
        title: clean(formData.title),
        subtitle: clean(formData.subtitle),
        slug: clean(slug),
        icon: clean(formData.icon),
        duration: clean(formData.duration),
        fees: clean(formData.fees),
        description: clean(formData.description),
        overview: clean(formData.overview),
        syllabus,
        benefits,
        color: clean(formData.color),
        popular: formData.popular,
        certification: clean(formData.certification),
        examDetails: clean(formData.examDetails),
        iconUrl: clean(formData.iconUrl),
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };

      if (editingId) {
        const res = await fetch(`/api/courses/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update course');
        }
        const updated = await res.json();

        setCourses((prev) =>
          prev.map((c) => (c.id === editingId ? updated : c))
        );
        toast.success('Course updated successfully');
      } else {
        const res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to create course');
        }
        const created = await res.json();

        setCourses((prev) => [...prev, created]);
        toast.success('Course created successfully');
      }

      setModalOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/courses/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setCourses((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete course');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
        <div className="hidden md:block space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const activeCount = courses.filter((c) => c.isActive).length;
  const popularCount = courses.filter((c) => c.popular).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {courses.length} total course{courses.length !== 1 ? 's' : ''}
            &middot; {activeCount} active &middot; {popularCount} popular
            {searchQuery && <span> &middot; {filteredCourses.length} results</span>}
          </p>
        </div>
        {canWrite('courses') && (
          <Button onClick={openCreateModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title, subtitle, certification..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
          <SelectTrigger className="w-full sm:w-[160px] h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {searchQuery ? 'No courses found' : 'No courses yet'}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                {searchQuery
                  ? 'Try adjusting your search query or filters.'
                  : 'Add your first course to get started.'}
              </p>
              {!searchQuery && canWrite('courses') && (
                <Button onClick={openCreateModal} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
                  <Plus className="w-4 h-4" />
                  Add Course
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
              {filteredCourses.map((course, index) => (
                <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }}>
                  <Card className={`overflow-hidden ${!course.isActive ? 'opacity-60' : ''}`}>
                    <div className={`h-2 bg-gradient-to-r ${course.color}`} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                            {course.iconUrl ? (
                              <img src={course.iconUrl} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                              <GraduationCap className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-semibold text-sm truncate">{course.title}</h3>
                              {course.popular && (
                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5 py-0">
                                  <Star className="w-2.5 h-2.5 mr-0.5" />Popular
                                </Badge>
                              )}
                              {!course.isActive && (
                                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1.5 py-0">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            {course.subtitle && (
                              <p className="text-xs text-muted-foreground truncate">{course.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        {course.duration && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                        )}
                        <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />#{course.sortOrder}</span>
                      </div>

                      {canWrite('courses') && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-blue-500 border-blue-200 hover:bg-blue-50" onClick={() => setPreviewCourse(course)}>
                            <Eye className="w-3 h-3" />Preview
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => openEditModal(course)}>
                            <Pencil className="w-3 h-3" />Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-red-500" onClick={() => setDeleteId(course.id)}>
                            <Trash2 className="w-3 h-3" />Delete
                          </Button>
                        </div>
                      )}
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
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Course</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('duration')}>
                        <span className="flex items-center gap-1">Duration <ArrowUpDown className="w-3 h-3" /></span>
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Certification</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('sortOrder')}>
                        <span className="flex items-center gap-1">Order <ArrowUpDown className="w-3 h-3" /></span>
                      </th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredCourses.map((course, index) => (
                        <motion.tr key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.03 }} className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${!course.isActive ? 'opacity-60' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                                {course.iconUrl ? (
                                  <img src={course.iconUrl} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                  <GraduationCap className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">{course.title}</span>
                                  {course.popular && (
                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5 py-0">
                                      <Star className="w-2.5 h-2.5 mr-0.5" />Popular
                                    </Badge>
                                  )}
                                </div>
                                {course.subtitle && (
                                  <span className="text-xs text-muted-foreground">{course.subtitle}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm flex items-center gap-1.5">
                              {course.duration && <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                              {course.duration || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{course.certification || '—'}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge className={`text-[10px] ${course.isActive ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                              {course.isActive ? <Eye className="w-2.5 h-2.5 mr-0.5" /> : <EyeOff className="w-2.5 h-2.5 mr-0.5" />}
                              {course.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground">{course.sortOrder}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600" onClick={() => setPreviewCourse(course)}>
                                <Eye className="w-4 h-4" />
                                <span className="sr-only">Preview</span>
                              </Button>
                              {canWrite('courses') && <>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(course)}>
                                  <Pencil className="w-4 h-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => setDeleteId(course.id)}>
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the course details below.' : 'Fill in the details to create a new course.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Row 1: Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="course-title">Course Title <span className="text-destructive">*</span></Label>
                <Input
                  id="course-title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: editingId ? formData.slug : generateSlug(e.target.value),
                    });
                  }}
                  placeholder="e.g. MS-CIT Course"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-slug">Slug</Label>
                <Input
                  id="course-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ms-cit"
                />
              </div>
            </div>

            {/* Row 2: Subtitle & Duration & Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-subtitle">Subtitle</Label>
                <Input
                  id="course-subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Government Certified"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-duration">Duration</Label>
                <Input
                  id="course-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. 3 Months"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-fees">Fees</Label>
                <Input
                  id="course-fees"
                  value={formData.fees}
                  onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                  placeholder="e.g. Rs 5,000/-"
                />
              </div>
            </div>

            {/* Row 3: Icon & Color & Sort Order */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Icon (Lucide)</Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lucideIcons.map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color Gradient</Label>
                <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gradientPresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${preset.preview}`} />
                          {preset.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-sort">Sort Order</Label>
                <Input
                  id="course-sort"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Row 4: Popular & Active toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="course-popular"
                  checked={formData.popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, popular: checked === true })}
                />
                <Label htmlFor="course-popular" className="cursor-pointer flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" />Popular
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="course-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="course-active" className="cursor-pointer">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="course-desc">Description</Label>
              <Textarea
                id="course-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the course..."
                rows={3}
              />
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <Label htmlFor="course-overview">Overview</Label>
              <Textarea
                id="course-overview"
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                placeholder="Detailed overview of the course..."
                rows={4}
              />
            </div>

            {/* Syllabus */}
            <div className="space-y-2">
              <Label htmlFor="course-syllabus">Syllabus <span className="text-xs text-muted-foreground font-normal">(one topic per line)</span></Label>
              <Textarea
                id="course-syllabus"
                value={formData.syllabusText}
                onChange={(e) => setFormData({ ...formData, syllabusText: e.target.value })}
                placeholder={"MS Word 2019\nMS Excel 2019\nMS Power Point 2019"}
                rows={5}
              />
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <Label htmlFor="course-benefits">Benefits <span className="text-xs text-muted-foreground font-normal">(one per line)</span></Label>
              <Textarea
                id="course-benefits"
                value={formData.benefitsText}
                onChange={(e) => setFormData({ ...formData, benefitsText: e.target.value })}
                placeholder={"Government Certification\nJob-Ready Skills\nPractical Training"}
                rows={4}
              />
            </div>

            {/* Certification */}
            <div className="space-y-2">
              <Label htmlFor="course-cert">Certification</Label>
              <Input
                id="course-cert"
                value={formData.certification}
                onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                placeholder="e.g. MKCL, Maharashtra State Board..."
              />
            </div>

            {/* Exam Details */}
            <div className="space-y-2">
              <Label htmlFor="course-exam">Exam Details</Label>
              <Textarea
                id="course-exam"
                value={formData.examDetails}
                onChange={(e) => setFormData({ ...formData, examDetails: e.target.value })}
                placeholder="Exam structure, marks distribution..."
                rows={2}
              />
            </div>

            {/* Course Icon Upload + URL */}
            <div className="space-y-3">
              <Label>Course Icon</Label>
              <div className="flex items-start gap-4">
                {/* Icon Preview */}
                <div className="relative w-16 h-16 rounded-xl bg-muted border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {formData.iconUrl ? (
                    <>
                      <img src={formData.iconUrl} alt="Icon preview" className="w-full h-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, iconUrl: '' })}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90 shadow-sm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      id="course-icon-upload"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error('Image must be under 2MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          setCropImageSrc(reader.result as string);
                          setCropImgLoaded(false);
                          setCropDialogOpen(true);
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => document.getElementById('course-icon-upload')?.click()}
                        disabled={uploadingIcon}
                      >
                        {uploadingIcon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingIcon ? 'Uploading...' : 'Upload'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={openBrowseDialog}
                        disabled={uploadingIcon}
                      >
                        <FolderOpen className="w-4 h-4" />
                        Browse Existing
                      </Button>
                    </div>
                  </div>
                  {/* URL fallback */}
                  <Input
                    id="course-iconurl"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                    placeholder="Or paste icon URL here"
                    type="url"
                  />
                  <p className="text-[11px] text-muted-foreground">Upload a custom icon (JPG, PNG, GIF, WebP, SVG — max 2MB) or paste a URL</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !formData.title}
              className="bg-brand-purple hover:bg-brand-purple-dark"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-1" />Saving...</>
              ) : editingId ? 'Update Course' : 'Create Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone. All course data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Course Preview Dialog */}
      <Dialog open={!!previewCourse} onOpenChange={(open) => !open && setPreviewCourse(null)}>
        <DialogContent className="sm:max-w-[380px] max-h-[85vh] overflow-y-auto mx-2 p-0">
          <DialogTitle className="sr-only">Course Preview</DialogTitle>
          {previewCourse && (
            <div className="relative">
              {/* Card Header - mimics the courses page card */}
              <div className={`bg-gradient-to-r ${previewCourse.color} p-6 pb-8 relative`}>
                <div
                  className="absolute bottom-0 left-0 right-0 h-8 bg-white dark:bg-card rounded-t-3xl"
                  style={{ transform: 'translateY(50%)' }}
                />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 overflow-hidden p-1.5 relative">
                    {previewCourse.iconUrl ? (
                      <img src={previewCourse.iconUrl} alt={previewCourse.title} className="w-full h-full object-contain" />
                    ) : (
                      <GraduationCap className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <h3 className="text-lg font-extrabold text-white leading-tight">
                    {previewCourse.title}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">{previewCourse.subtitle}</p>
                </div>
                {previewCourse.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-brand-yellow text-brand-purple-deep font-bold shadow-md">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
              </div>

              {/* Card Body - mimics the courses page card */}
              <div className="px-6 pt-6 pb-6">
                {previewCourse.description && (
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                    {previewCourse.description}
                  </p>
                )}

                {previewCourse.duration && (
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-brand-purple">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>Duration: {previewCourse.duration}</span>
                  </div>
                )}

                {previewCourse.fees && (
                  <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-brand-yellow-dark">
                    <IndianRupee className="w-4 h-4 flex-shrink-0" />
                    <span>{previewCourse.fees}</span>
                  </div>
                )}

                {(previewCourse.benefits || []).length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {(previewCourse.benefits || []).slice(0, 4).map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="line-clamp-1">{benefit}</span>
                      </li>
                    ))}
                    {(previewCourse.benefits || []).length > 4 && (
                      <li className="text-xs text-muted-foreground ml-6">
                        +{(previewCourse.benefits || []).length - 4} more benefits
                      </li>
                    )}
                  </ul>
                )}

                {previewCourse.certification && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/10 mb-4">
                    <Award className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">{previewCourse.certification}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  <div className="bg-brand-purple text-white text-center py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1">
                    View Details <ChevronRight className="w-4 h-4" />
                  </div>
                  <div className="border-2 border-brand-purple/30 text-brand-purple text-center py-2.5 rounded-lg font-bold text-sm">
                    Enroll Now
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground text-center mt-3">
                  This is how the course card appears on the courses page
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Crop Image Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={(open) => { if (!open) cancelCrop(); }}>
        <DialogContent className="sm:max-w-[520px] mx-2">
          <DialogHeader>
            <DialogTitle>Crop Icon Image</DialogTitle>
            <DialogDescription>
              Drag to move the crop area. Use the corner handle to resize. The result will be a square icon.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Crop Area */}
              <div className="flex flex-col items-center gap-2 mx-auto sm:mx-0">
                <div
                  className="relative bg-muted rounded-lg overflow-hidden flex-shrink-0 select-none"
                  style={{ width: CROP_CONTAINER_SIZE, height: CROP_CONTAINER_SIZE }}
                >
                  <img
                    src={cropImageSrc || undefined}
                    alt="Crop target"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    draggable={false}
                    onLoad={handleCropImageLoad}
                  />
                  {cropImgLoaded && (
                    <div
                      className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] cursor-move z-10"
                      style={{
                        left: cropBoxRender.x,
                        top: cropBoxRender.y,
                        width: cropBoxRender.size,
                        height: cropBoxRender.size,
                      }}
                      onMouseDown={handleCropMouseDown}
                    >
                      {/* Grid lines for rule-of-thirds */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
                        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
                      </div>
                      {/* Corner handles */}
                      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white rounded-sm border border-gray-300 pointer-events-none" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-sm border border-gray-300 pointer-events-none" />
                      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white rounded-sm border border-gray-300 pointer-events-none" />
                      {/* Bottom-right resize handle */}
                      <div
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-sm cursor-se-resize shadow-sm border border-gray-300"
                        onMouseDown={handleResizeMouseDown}
                      />
                    </div>
                  )}
                </div>
                {!cropImgLoaded && (
                  <div className="flex items-center justify-center" style={{ width: CROP_CONTAINER_SIZE, height: 40 }}>
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {/* Preview */}
              {cropImgLoaded && (
                <div className="flex flex-col items-center gap-2 mx-auto sm:mx-0 sm:ml-auto">
                  <p className="text-xs font-medium text-muted-foreground">Preview</p>
                  <div className="w-24 h-24 rounded-xl bg-muted border-2 border-dashed border-muted-foreground/20 overflow-hidden flex-shrink-0">
                    <canvas ref={canvasRef} className="w-full h-full" />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center max-w-[120px]">
                    256 × 256 px output
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelCrop}>Cancel</Button>
            <Button onClick={applyCrop} disabled={!cropImgLoaded} className="bg-brand-purple hover:bg-brand-purple-dark gap-2">
              <Crop className="w-4 h-4" />
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Browse Existing Icons Dialog */}
      <Dialog open={browseDialogOpen} onOpenChange={setBrowseDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col mx-2">
          <DialogHeader>
            <DialogTitle>Browse Existing Course Icons</DialogTitle>
            <DialogDescription>
              Select an existing course icon to reuse for this course.
            </DialogDescription>
          </DialogHeader>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={browseSearch}
              onChange={(e) => setBrowseSearch(e.target.value)}
              placeholder="Search by course title..."
              className="pl-10"
            />
          </div>
          {/* Icons Grid */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {browseLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBrowseIcons.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {browseSearch ? 'No icons match your search' : 'No existing course icons found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                {filteredBrowseIcons.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    className="group flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 border-transparent hover:border-brand-purple/40 hover:bg-brand-purple/5 transition-all cursor-pointer"
                    onClick={() => selectBrowseIcon(course.iconUrl)}
                  >
                    <div className="w-14 h-14 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center group-hover:border-brand-purple/30 transition-colors">
                      <img
                        src={course.iconUrl}
                        alt={course.title}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground text-center line-clamp-1 w-full group-hover:text-foreground transition-colors">
                      {course.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrowseDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
