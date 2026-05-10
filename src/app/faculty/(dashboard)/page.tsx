'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Image,
  Video,
  Award,
  Lock,
  Unlock,
  User,
  Calendar,
  Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface FacultyUser {
  displayName: string;
  username: string;
  accessGranted: boolean;
  facultyId: string | null;
  role: string;
}

interface Stats {
  courses: number;
  gallery: number;
  videos: number;
  certificates: number;
}

export default function FacultyDashboardPage() {
  const [user, setUser] = useState<FacultyUser | null>(null);
  const [facultyDetails, setFacultyDetails] = useState<{ name: string; designation: string; branch: string; photo_url: string | null } | null>(null);
  const [stats, setStats] = useState<Stats>({ courses: 0, gallery: 0, videos: 0, certificates: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user info
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) {
            setUser({
              displayName: meData.user.displayName,
              username: meData.user.username,
              accessGranted: meData.user.accessGranted,
              facultyId: meData.user.facultyId,
              role: meData.user.role,
            });

            // Get faculty details if linked
            if (meData.user.facultyId) {
              const facRes = await fetch(`/api/faculty/${meData.user.facultyId}`);
              if (facRes.ok) {
                const facData = await facRes.json();
                setFacultyDetails(facData);
              }
            }
          }
        }

        // Get stats (public data)
        const [coursesRes, galleryRes, videosRes, certsRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/gallery'),
          fetch('/api/videos'),
          fetch('/api/certificates'),
        ]);

        const [coursesData, galleryData, videosData, certsData] = await Promise.all([
          coursesRes.ok ? coursesRes.json() : [],
          galleryRes.ok ? galleryRes.json() : [],
          videosRes.ok ? videosRes.json() : [],
          certsRes.ok ? certsRes.json() : [],
        ]);

        setStats({
          courses: Array.isArray(coursesData) ? coursesData.length : 0,
          gallery: Array.isArray(galleryData) ? galleryData.length : 0,
          videos: Array.isArray(videosData) ? videosData.length : 0,
          certificates: Array.isArray(certsData) ? certsData.length : 0,
        });
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Gallery Photos', value: stats.gallery, icon: Image, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Videos', value: stats.videos, icon: Video, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Certificates', value: stats.certificates, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-brand-purple to-brand-purple-dark p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                {facultyDetails?.photo_url ? (
                  <img
                    src={facultyDetails.photo_url}
                    alt={facultyDetails.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <GraduationCap className="w-8 h-8" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">Welcome, {user?.displayName || 'Faculty'}!</h2>
                <p className="text-white/70 text-sm mt-1">
                  {facultyDetails ? (
                    <>
                      {facultyDetails.designation} &middot; {facultyDetails.branch}
                    </>
                  ) : (
                    'Faculty Member'
                  )}
                </p>
                <div className="mt-2">
                  <Badge
                    className={`text-[10px] px-2 py-0.5 border ${
                      user?.accessGranted
                        ? 'bg-green-500/20 text-green-100 border-green-500/30'
                        : 'bg-amber-500/20 text-amber-100 border-amber-500/30'
                    }`}
                  >
                    {user?.accessGranted ? (
                      <>
                        <Unlock className="w-3 h-3 mr-1" />
                        Full Edit Access
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        View Only (Revoked)
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-brand-purple">{stats.courses}</p>
                <p className="text-xs text-muted-foreground">Active Courses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{stats.gallery}</p>
                <p className="text-xs text-muted-foreground">Gallery Photos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">{stats.videos}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{stats.certificates}</p>
                <p className="text-xs text-muted-foreground">Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{card.value}</p>
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Access Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-purple" />
              Your Access Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Account
                </span>
                <span className="text-sm font-medium">@{user?.username}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Role
                </span>
                <span className="text-sm font-medium capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Content Viewing
                </span>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">
                  Allowed
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  {user?.accessGranted ? (
                    <Unlock className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-500" />
                  )}
                  Add / Edit Content
                </span>
                <Badge
                  className={`text-[10px] border ${
                    user?.accessGranted
                      ? 'bg-green-500/10 text-green-600 border-green-500/20'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}
                >
                  {user?.accessGranted ? 'Active' : 'Revoked by Admin'}
                </Badge>
              </div>
            </div>
            {!user?.accessGranted && (
              <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Note:</strong> Your admin has revoked your edit access. You can browse all content but cannot add or modify anything. Please contact your administrator to restore edit access.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
