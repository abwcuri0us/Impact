'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  ImageIcon,
  Video,
  Award,
  BookOpen,
  Plus,
  UserPlus,
  Upload,
  Clock,
  TrendingUp,
  Loader2,
  ArrowRight,
  Database,
  HardDrive,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { Progress } from '@/components/ui/progress';

/* ── Types ── */

interface RecentItem {
  id: string;
  type: 'faculty' | 'gallery' | 'videos' | 'certificates' | 'courses';
  title: string;
  subtitle: string;
  date: string;
}

interface BucketStat {
  id: string;
  name: string;
  public: boolean;
  fileCount: number;
  totalSize: number;
}

interface StorageData {
  buckets: BucketStat[];
  totalFiles: number;
  totalStorageUsed: number;
  totalStorageUsedLabel: string;
  totalStorageLimit: number;
  totalStorageLimitLabel: string;
  storagePercentUsed: number;
  storageRemaining: number;
  storageRemainingLabel: string;
}

/* ── Animation Variants ── */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

/* ── Pie / Donut chart colours ── */

const PIE_COLORS = [
  '#7C3AED', // brand-purple
  '#F59E0B', // brand-yellow
  '#06B6D4', // cyan
  '#EF4444', // red
  '#10B981', // emerald
  '#8B5CF6', // violet
];

const REMAINING_COLOR = '#E5E7EB'; // gray-200 for the "remaining" ring

/* ── Helpers ── */

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/* ── Storage Donut Chart Component ── */

function StoragePieChart({ data }: { data: StorageData }) {
  const { buckets, totalStorageUsed, totalStorageLimit, storagePercentUsed } = data;

  const bucketsWithSize = buckets.filter((b) => b.totalSize > 0);

  if (buckets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        <Database className="w-8 h-8 mr-3 opacity-40" />
        No storage data
      </div>
    );
  }

  /* Build SVG arcs: used segments + remaining */
  const segments: Array<{
    name: string;
    size: number;
    percent: number;
    color: string;
  }> = [];

  let usedAccum = 0;
  for (const b of bucketsWithSize) {
    const pctOfUsed = totalStorageUsed > 0 ? (b.totalSize / totalStorageUsed) * 100 : 0;
    const pctOfTotal = totalStorageLimit > 0 ? (b.totalSize / totalStorageLimit) * 100 : 0;
    segments.push({
      name: b.name,
      size: b.totalSize,
      percent: pctOfTotal,
      color: PIE_COLORS[bucketsWithSize.indexOf(b) % PIE_COLORS.length],
    });
    usedAccum += pctOfTotal;
  }

  // Remaining segment
  const remainingPercent = Math.max(100 - usedAccum, 0);
  if (remainingPercent > 0.1) {
    segments.push({
      name: 'Remaining',
      size: totalStorageLimit - totalStorageUsed,
      percent: remainingPercent,
      color: REMAINING_COLOR,
    });
  }

  // Build SVG path data
  let cumDeg = 0;
  const slices = segments.map((seg) => {
    const startAngle = cumDeg;
    cumDeg += seg.percent * 3.6;
    const endAngle = cumDeg;
    const largeArc = seg.percent > 50 ? 1 : 0;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 50 + 38 * Math.cos(startRad);
    const y1 = 50 + 38 * Math.sin(startRad);
    const x2 = 50 + 38 * Math.cos(endRad);
    const y2 = 50 + 38 * Math.sin(endRad);

    const d =
      seg.percent >= 99.9
        ? `M 50 50 L ${x1} ${y1} A 38 38 0 ${largeArc} 1 50 12 Z`
        : `M 50 50 L ${x1} ${y1} A 38 38 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { ...seg, d };
  });

  return (
    <div className="space-y-5">
      {/* Chart + Legend */}
      <div className="flex items-center gap-6">
        {/* SVG Donut */}
        <div className="relative w-[140px] h-[140px] flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {slices.map((s, i) => (
              <motion.path
                key={s.name}
                d={s.d}
                fill={s.color}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="drop-shadow-sm"
              />
            ))}
            {/* Center circle (donut hole) */}
            <circle cx="50" cy="50" r="22" fill="white" className="dark:bg-card" />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground">
              {storagePercentUsed.toFixed(0)}%
            </span>
            <span className="text-[10px] text-muted-foreground">Used</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 min-w-0">
          {bucketsWithSize.map((b, i) => {
            const color = PIE_COLORS[i % PIE_COLORS.length];
            const pctOfTotal =
              totalStorageLimit > 0
                ? ((b.totalSize / totalStorageLimit) * 100).toFixed(1)
                : '0';
            return (
              <div key={b.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground capitalize truncate min-w-0">
                  {b.name}
                </span>
                <span className="text-xs font-semibold text-foreground ml-auto flex-shrink-0">
                  {formatBytes(b.totalSize)}
                </span>
                <span className="text-[10px] text-muted-foreground/60 w-10 text-right flex-shrink-0">
                  {pctOfTotal}%
                </span>
              </div>
            );
          })}
          {/* Remaining legend item */}
          {remainingPercent > 0.1 && (
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: REMAINING_COLOR }}
              />
              <span className="text-xs text-muted-foreground capitalize truncate min-w-0">
                Free
              </span>
              <span className="text-xs font-semibold text-foreground ml-auto flex-shrink-0">
                {formatBytes(totalStorageLimit - totalStorageUsed)}
              </span>
              <span className="text-[10px] text-muted-foreground/60 w-10 text-right flex-shrink-0">
                {remainingPercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Usage bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Used:{' '}
            <span className="font-semibold text-foreground">
              {data.totalStorageUsedLabel}
            </span>{' '}
            / {data.totalStorageLimitLabel}
          </span>
          <span className="font-semibold text-foreground">
            {storagePercentUsed.toFixed(1)}%
          </span>
        </div>
        <Progress
          value={storagePercentUsed}
          className="h-2.5"
        />
      </div>
    </div>
  );
}

/* ── Main Page Component ── */

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({ faculty: 0, gallery: 0, videos: 0, certificates: 0, courses: 0 });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const { role, canRead } = usePermissions();
  const isAdmin = role === 'admin';

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) +
          '  •  ' +
          now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoints = [
          { key: 'faculty', url: '/api/faculty' },
          { key: 'gallery', url: '/api/gallery' },
          { key: 'videos', url: '/api/videos' },
          { key: 'certificates', url: '/api/certificates' },
          { key: 'courses', url: '/api/courses' },
        ];

        const [apiResults, storageRes] = await Promise.all([
          Promise.all(
            endpoints.map(async (ep) => {
              try {
                const res = await fetch(ep.url);
                if (!res.ok) return { key: ep.key, data: [] };
                const json = await res.json();
                return { key: ep.key, data: Array.isArray(json) ? json : [] };
              } catch {
                return { key: ep.key, data: [] };
              }
            })
          ),
          fetch('/api/admin/storage').catch(() => null),
        ]);

        const dataMap: Record<string, unknown[]> = {};
        for (const r of apiResults) dataMap[r.key] = Array.isArray(r.data) ? r.data : [];

        setCounts({
          faculty: dataMap.faculty.length,
          gallery: dataMap.gallery.length,
          videos: dataMap.videos.length,
          certificates: dataMap.certificates.length,
          courses: dataMap.courses.length,
        });

        // Storage data
        if (storageRes && storageRes.ok) {
          try {
            const sd = await storageRes.json();
            if (sd.buckets) setStorageData(sd);
          } catch {}
        }

        const items: RecentItem[] = [
          ...dataMap.faculty.map((f: Record<string, string>) => ({
            id: f.id, type: 'faculty' as const, title: f.name || 'Untitled', subtitle: f.role || '', date: f.updatedAt || f.createdAt,
          })),
          ...dataMap.gallery.map((g: Record<string, string>) => ({
            id: g.id, type: 'gallery' as const, title: g.title || g.caption || 'Photo', subtitle: g.section || g.category || '', date: g.updatedAt || g.createdAt,
          })),
          ...dataMap.videos.map((v: Record<string, string>) => ({
            id: v.id, type: 'videos' as const, title: v.title || 'Video', subtitle: v.section || '', date: v.updatedAt || v.createdAt,
          })),
          ...dataMap.certificates.map((c: Record<string, string>) => ({
            id: c.id, type: 'certificates' as const, title: c.title || 'Certificate', subtitle: c.section || '', date: c.updatedAt || c.createdAt,
          })),
          ...dataMap.courses.map((c: Record<string, string>) => ({
            id: c.id, type: 'courses' as const, title: c.title || 'Course', subtitle: c.subtitle || '', date: c.updatedAt || c.createdAt,
          })),
        ];

        items.sort((a, b) => {
          const timeA = a.date ? new Date(a.date).getTime() : 0;
          const timeB = b.date ? new Date(b.date).getTime() : 0;
          return timeB - timeA;
        });
        setRecentItems(items.slice(0, 5));
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Auto-refresh storage data every 30 seconds
    const storageInterval = setInterval(async () => {
      try {
        const storageRes = await fetch('/api/admin/storage');
        if (storageRes.ok) {
          const sd = await storageRes.json();
          if (sd.buckets) setStorageData(sd);
        }
      } catch {}
    }, 30000);
    return () => clearInterval(storageInterval);
  }, []);

  // Filter stat cards and quick actions based on permissions
  const statCards = [
    { label: 'Faculty Members', count: counts.faculty, icon: Users, color: 'brand-purple', href: '/admin/faculty', section: 'faculty' as const },
    { label: 'Courses', count: counts.courses, icon: BookOpen, color: 'brand-yellow', href: '/admin/courses', section: 'courses' as const },
    { label: 'Gallery Images', count: counts.gallery, icon: ImageIcon, color: 'brand-purple', href: '/admin/gallery', section: 'gallery' as const },
    { label: 'Videos', count: counts.videos, icon: Video, color: 'brand-yellow', href: '/admin/videos', section: 'videos' as const },
    { label: 'Certificates', count: counts.certificates, icon: Award, color: 'brand-purple', href: '/admin/certificates', section: 'certificates' as const },
  ].filter((card) => isAdmin || canRead(card.section));

  const quickActions = [
    { title: 'Add Faculty Member', desc: 'Add a new faculty member with photo, role, and branch details.', icon: UserPlus, href: '/admin/faculty', color: 'brand-purple', section: 'faculty' as const },
    { title: 'Manage Courses', desc: 'Add, edit, or manage your course offerings and details.', icon: BookOpen, href: '/admin/courses', color: 'brand-yellow', section: 'courses' as const },
    { title: 'Upload Gallery Image', desc: 'Add photos, event images to your gallery showcase.', icon: Upload, href: '/admin/gallery', color: 'brand-purple', section: 'gallery' as const },
    { title: 'Add Video', desc: 'Add YouTube videos or upload video files to your gallery.', icon: Video, href: '/admin/videos', color: 'brand-yellow', section: 'videos' as const },
    { title: 'Add Certificate', desc: 'Upload certificate images and achievements.', icon: Award, href: '/admin/certificates', color: 'brand-purple', section: 'certificates' as const },
  ].filter((action) => isAdmin || canRead(action.section));

  const typeIconMap = { faculty: Users, gallery: ImageIcon, videos: Video, certificates: Award, courses: BookOpen };
  const typeColorMap = {
    faculty: 'bg-brand-purple/10 text-brand-purple',
    gallery: 'bg-brand-yellow/10 text-brand-yellow-dark',
    videos: 'bg-red-500/10 text-red-500',
    certificates: 'bg-green-500/10 text-green-600',
    courses: 'bg-cyan-500/10 text-cyan-600',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* ── Gradient Welcome Banner ── */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-purple via-purple-600 to-brand-purple p-6 sm:p-8 text-white">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-brand-yellow/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-yellow" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                  Welcome back, Admin
                </h1>
              </div>
              <p className="text-white/80 text-sm sm:text-base">
                {total} total items across{' '}
                {Object.values(counts).filter((c) => c > 0).length} sections.
              </p>
              {currentDateTime && (
                <div className="flex items-center gap-2 text-white/60 text-xs sm:text-sm">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{currentDateTime}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
                asChild
              >
                <Link href="/admin/faculty">
                  <UserPlus className="w-4 h-4" />Add Faculty
                </Link>
              </Button>
              <Button
                size="sm"
                className="gap-2 bg-brand-yellow hover:bg-brand-yellow-light text-brand-purple-deep font-semibold"
                asChild
              >
                <Link href="/admin/gallery">
                  <Upload className="w-4 h-4" />Upload Image
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Cards ── */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isPurple = stat.color === 'brand-purple';
          return (
            <Link key={stat.label} href={stat.href} className="block group">
              <Card className="h-full border-border/60 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                {/* Subtle gradient accent at top */}
                <div
                  className={`h-1 ${
                    isPurple
                      ? 'bg-gradient-to-r from-brand-purple to-purple-400'
                      : 'bg-gradient-to-r from-brand-yellow to-yellow-400'
                  }`}
                />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs md:text-sm">
                      {stat.label}
                    </CardDescription>
                    <div
                      className={`w-9 h-9 rounded-xl ${
                        isPurple
                          ? 'bg-gradient-to-br from-brand-purple/15 to-purple-500/10'
                          : 'bg-gradient-to-br from-brand-yellow/20 to-yellow-500/10'
                      } flex items-center justify-center`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isPurple ? 'text-brand-purple' : 'text-brand-yellow-dark'
                        }`}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-bold">
                    {stat.count}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3 ml-auto" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </motion.div>

      {/* ── Storage Pie Chart + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Stats */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-brand-purple" />
                    Storage Overview
                  </CardTitle>
                  <CardDescription>Real-time storage usage across all buckets</CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                  <Database className="w-3.5 h-3.5" />
                  {storageData?.totalStorageLimitLabel || '11 GB'} Plan
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {storageData ? (
                <StoragePieChart data={storageData} />
              ) : (
                <div className="flex items-center justify-center h-[140px] text-muted-foreground text-sm">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading storage data…
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-purple" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest updates across your content</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">
                    No content yet. Start by adding faculty members, gallery
                    images, videos, or certificates.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {recentItems.map((recent) => {
                    const Icon = typeIconMap[recent.type];
                    return (
                      <div
                        key={`${recent.type}-${recent.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColorMap[recent.type]}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {recent.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {recent.subtitle}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColorMap[recent.type]}`}
                          >
                            {recent.type}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {recent.date
                              ? new Date(recent.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      </motion.div>
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
      >
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isPurple = action.color === 'brand-purple';
          return (
            <Card
              key={action.title}
              className="hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              {/* Top accent */}
              <div
                className={`h-1 ${
                  isPurple
                    ? 'bg-gradient-to-r from-brand-purple to-purple-400'
                    : 'bg-gradient-to-r from-brand-yellow to-yellow-400'
                }`}
              />
              <CardContent className="pt-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isPurple
                        ? 'bg-gradient-to-br from-brand-purple/15 to-purple-500/10'
                        : 'bg-gradient-to-br from-brand-yellow/20 to-yellow-500/10'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isPurple ? 'text-brand-purple' : 'text-brand-yellow-dark'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                      {action.desc}
                    </p>
                    <Button
                      size="sm"
                      className={`gap-2 ${
                        isPurple
                          ? 'bg-brand-purple hover:bg-brand-purple-dark'
                          : 'bg-brand-yellow hover:bg-brand-yellow-light text-brand-purple-deep'
                      }`}
                      asChild
                    >
                      <Link href={action.href}>
                        <Plus className="w-4 h-4" />
                        {action.title.includes('Faculty')
                          ? 'Add Member'
                          : action.title.includes('Image')
                            ? 'Upload'
                            : 'Add'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
