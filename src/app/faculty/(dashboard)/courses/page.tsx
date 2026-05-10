'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useFacultyAccess } from '@/hooks/useFacultyAccess';
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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Course {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  icon: string;
  iconUrl: string;
  duration: string;
  fees: string;
  is_active: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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
  icon: '',
  duration: '',
  fees: '',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FacultyCoursesPage() {
  const { accessGranted, loading: accessLoading } = useFacultyAccess();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  /* ---- Track icon images that fail to load ---- */
  const [brokenIcons, setBrokenIcons] = useState<Set<string>>(new Set());

  /* ---------------------------------------------------------------- */
  /*  Fetch courses                                                    */
  /* ---------------------------------------------------------------- */

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /* ---------------------------------------------------------------- */
  /*  Modal helpers                                                    */
  /* ---------------------------------------------------------------- */

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title || '',
      subtitle: course.subtitle || '',
      slug: course.slug || '',
      icon: course.iconUrl || course.icon || '',
      duration: course.duration || '',
      fees: course.fees || '',
    });
    setModalOpen(true);
  };

  /* ---------------------------------------------------------------- */
  /*  Submit (create / update)                                         */
  /* ---------------------------------------------------------------- */

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Course title is required');
      return;
    }

    setSaving(true);
    try {
      const slug = formData.slug || generateSlug(formData.title);

      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        slug,
        iconUrl: formData.icon,
        duration: formData.duration,
        fees: formData.fees,
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
          prev.map((c) => (c.id === editingId ? { ...c, ...updated } : c))
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
      const msg =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Delete                                                           */
  /* ---------------------------------------------------------------- */

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${deleteId}`, { method: 'DELETE' });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete');
      }

      setCourses((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success('Course deleted successfully');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to delete course';
      toast.error(msg);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Icon error handler                                               */
  /* ---------------------------------------------------------------- */

  const handleIconError = (id: string) => {
    setBrokenIcons((prev) => new Set(prev).add(id));
  };

  /* ---------------------------------------------------------------- */
  /*  Loading state                                                    */
  /* ---------------------------------------------------------------- */

  if (loading || accessLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {courses.length} course{courses.length !== 1 ? 's' : ''} available
          </p>
        </div>
        {accessGranted && (
          <Button
            onClick={openCreateModal}
            className="gap-2 bg-brand-purple hover:bg-brand-purple-dark"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        )}
      </div>

      {/* ---- Access Banner ---- */}
      {!accessGranted && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              You are in <strong>view-only</strong> mode. Ask your admin to grant
              edit access if you need to add or modify courses.
            </p>
          </div>
        </motion.div>
      )}

      {/* ---- Empty State ---- */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Courses Found</h3>
              <p className="text-muted-foreground text-sm">
                No courses are currently available.
              </p>
              {accessGranted && (
                <Button
                  onClick={openCreateModal}
                  className="mt-6 gap-2 bg-brand-purple hover:bg-brand-purple-dark"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Course
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ---- Course Cards Grid ---- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, index) => {
            const iconSrc = course.iconUrl || course.icon;
            const isBroken = brokenIcons.has(course.id);
            const showImage =
              iconSrc && !isBroken && (iconSrc.startsWith('http') || iconSrc.startsWith('/'));

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group h-full hover:shadow-lg transition-shadow relative">
                  <CardContent className="p-5">
                    {/* Top row: icon + badges + hover actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {showImage ? (
                          <img
                            src={iconSrc}
                            alt={course.title}
                            className="w-6 h-6 object-contain"
                            onError={() => handleIconError(course.id)}
                          />
                        ) : (
                          <BookOpen className="w-5 h-5 text-brand-purple" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            course.is_active
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}
                        >
                          {course.is_active ? 'Active' : 'Inactive'}
                        </Badge>

                        {/* Hover edit / delete buttons */}
                        {accessGranted && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditModal(course)}
                            >
                              <Pencil className="w-4 h-4" />
                              <span className="sr-only">Edit {course.title}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                              onClick={() => setDeleteId(course.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="sr-only">Delete {course.title}</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm mt-3 line-clamp-1">
                      {course.title}
                    </h3>

                    {/* Subtitle */}
                    {course.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {course.subtitle}
                      </p>
                    )}

                    {/* Duration & Fees */}
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      {course.duration && <span>Duration: {course.duration}</span>}
                      {course.fees && <span>Fees: {course.fees}</span>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ================================================================ */}
      {/*  Add / Edit Modal                                                 */}
      {/* ================================================================ */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px] mx-4">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Course' : 'Add New Course'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the course details below.'
                : 'Fill in the details to create a new course.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title (required) */}
            <div className="space-y-2">
              <Label htmlFor="course-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="course-title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: editingId
                      ? formData.slug
                      : generateSlug(e.target.value),
                  });
                }}
                placeholder="e.g. MS-CIT Course"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="course-subtitle">Subtitle</Label>
              <Input
                id="course-subtitle"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                placeholder="e.g. Government Certified"
              />
            </div>

            {/* Slug (auto-generated) */}
            <div className="space-y-2">
              <Label htmlFor="course-slug">Slug</Label>
              <Input
                id="course-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="auto-generated-from-title"
              />
              <p className="text-[11px] text-muted-foreground">
                Auto-generated from the title. Edit if needed.
              </p>
            </div>

            {/* Icon URL */}
            <div className="space-y-2">
              <Label htmlFor="course-icon">Icon URL</Label>
              <Input
                id="course-icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="https://example.com/course-icon.png"
                type="url"
              />
              <p className="text-[11px] text-muted-foreground">
                Optional: URL to a custom course icon image.
              </p>
            </div>

            {/* Duration & Fees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-duration">Duration</Label>
                <Input
                  id="course-duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g. 3 Months"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-fees">Fees</Label>
                <Input
                  id="course-fees"
                  value={formData.fees}
                  onChange={(e) =>
                    setFormData({ ...formData, fees: e.target.value })
                  }
                  placeholder="e.g. Rs 5,000/-"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !formData.title.trim()}
              className="bg-brand-purple hover:bg-brand-purple-dark"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Saving…
                </>
              ) : editingId ? (
                'Update Course'
              ) : (
                'Create Course'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/*  Delete Confirmation Dialog                                       */}
      {/* ================================================================ */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be
              undone and all course data will be permanently removed.
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
                  Deleting…
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
