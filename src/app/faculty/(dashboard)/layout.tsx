'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Image,
  Video,
  Award,
  LogOut,
  Menu,
  X,
  Loader2,
  GraduationCap,
  Lock,
  Unlock,
  ShieldAlert,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FacultyAccessProvider } from '@/hooks/useFacultyAccess';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const facultyNavItems: NavItem[] = [
  { href: '/faculty', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/faculty/courses', label: 'Courses', icon: BookOpen },
  { href: '/faculty/gallery', label: 'Gallery', icon: Image },
  { href: '/faculty/videos', label: 'Videos', icon: Video },
  { href: '/faculty/certificates', label: 'Certificates', icon: Award },
  { href: '/faculty/settings', label: 'Settings', icon: Settings },
];

export default function FacultyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>('Faculty');
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isDesktop) setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop]);

  const router = useRouter();
  const pathname = usePathname();

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (!isDesktop) setMobileSidebarOpen(false);
  }, [pathname, isDesktop]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            if (!data.user.isFaculty) {
              router.push('/admin/login');
              return;
            }
            setAuthenticated(true);
            setAccessGranted(data.user.accessGranted || false);
            setUserDisplayName(data.user.displayName || data.user.username || 'Faculty');
          } else {
            router.push('/admin/login');
          }
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Hide main site elements
  useEffect(() => {
    document.documentElement.classList.add('admin-mode');
    return () => {
      document.documentElement.classList.remove('admin-mode');
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors, still redirect
    }
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-purple animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Verifying faculty access...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  const collapsed = isDesktop && !sidebarOpen;

  return (
    <>
      <FacultyAccessProvider>
      <div className="min-h-screen bg-background flex">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              key="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ═══ Sidebar ═══ */}
        <aside
          className={cn(
            'bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 ease-in-out z-50',
            // Desktop: static, width changes on collapse
            isDesktop
              ? cn(
                  sidebarOpen ? 'w-72' : 'w-[68px]',
                  'static',
                )
              : cn(
                  // Mobile: fixed, slide in/out
                  'fixed top-0 left-0 bottom-0 w-72',
                  mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                ),
          )}
        >
          {/* Sidebar Header */}
          <div className={cn(
            'border-b border-border flex items-center h-16 shrink-0',
            collapsed ? 'px-3 justify-center' : 'p-4',
          )}>
            {!collapsed ? (
              <>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-brand-purple/10 rounded-xl p-1.5 shrink-0">
                    <NextImage
                      src="/logo-impact-new.png"
                      alt="Impact Computers"
                      width={28}
                      height={28}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm truncate">Impact Computers</h2>
                    <p className="text-xs text-muted-foreground truncate">Faculty Portal</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (isDesktop) setSidebarOpen(false);
                    else setMobileSidebarOpen(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
                  aria-label="Close sidebar"
                >
                  {isDesktop ? <PanelLeftClose className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                aria-label="Open sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {!collapsed && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Navigation
              </p>
            )}
            {facultyNavItems.map((navItem) => {
              const isActive =
                navItem.href === '/faculty'
                  ? pathname === '/faculty'
                  : pathname.startsWith(navItem.href);
              const Icon = navItem.icon;

              return (
                <Link
                  key={navItem.href}
                  href={navItem.href}
                  onClick={() => {
                    if (!isDesktop) setMobileSidebarOpen(false);
                  }}
                  title={collapsed ? navItem.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                    collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/25'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{navItem.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className={cn(
            'border-t border-border shrink-0',
            collapsed ? 'p-3' : 'p-4',
          )}>
            {!collapsed ? (
              <>
                <a
                  href="/"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 mb-3"
                >
                  Visit Website <span aria-hidden="true">&rarr;</span>
                </a>

                {/* Access Status */}
                <div className="px-3 py-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-purple/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-brand-purple" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate capitalize">{userDisplayName}</p>
                      <Badge
                        className={`text-[10px] px-1.5 py-0 border ${
                          accessGranted
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}
                      >
                        {accessGranted ? (
                          <>
                            <Unlock className="w-2.5 h-2.5 mr-0.5" />
                            Edit Access
                          </>
                        ) : (
                          <>
                            <Lock className="w-2.5 h-2.5 mr-0.5" />
                            View Only
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-red-500/20"
                >
                  {loggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                title="Logout"
              >
                {loggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6">
              <div className="flex items-center gap-3">
                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-base sm:text-lg font-semibold">
                    {facultyNavItems.find(
                      (navItem) =>
                        navItem.href === '/faculty'
                          ? pathname === '/faculty'
                          : pathname.startsWith(navItem.href)
                    )?.label || 'Dashboard'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Access Status Indicator */}
                <div
                  className={`hidden sm:flex items-center gap-2 text-xs px-2 sm:px-3 py-1.5 rounded-full whitespace-nowrap ${
                    accessGranted
                      ? 'text-green-600 bg-green-500/10 border border-green-500/20'
                      : 'text-amber-600 bg-amber-500/10 border border-amber-500/20'
                  }`}
                >
                  {accessGranted ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      Edit Access Enabled
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      View Only Mode
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-red-500 hover:text-red-600 border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  {loggingOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5 sm:mr-1.5" />
                  )}
                  <span className="hidden sm:inline">{loggingOut ? 'Logging out...' : 'Log out'}</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Access Revoked Banner */}
          {!accessGranted && (
            <div className="bg-amber-500/5 border-b border-amber-500/20 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 max-w-3xl">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <p>
                  Your admin has <strong>revoked your edit access</strong>. You can currently only view content. Contact your admin to restore your edit permissions.
                </p>
              </div>
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
      </FacultyAccessProvider>
    </>
  );
}
