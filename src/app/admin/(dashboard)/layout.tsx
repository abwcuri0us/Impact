'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Image,
  Video,
  Award,
  BookOpen,
  LogOut,
  Menu,
  X,
  Loader2,
  ShieldCheck,
  UserCog,
  Settings,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
}

const allNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare, section: 'enquiries' },
  { href: '/admin/faculty', label: 'Faculty Members', icon: Users, section: 'faculty' },
  { href: '/admin/courses', label: 'Courses Manager', icon: BookOpen, section: 'courses' },
  { href: '/admin/gallery', label: 'Gallery Manager', icon: Image, section: 'gallery' },
  { href: '/admin/videos', label: 'Video Manager', icon: Video, section: 'videos' },
  { href: '/admin/certificates', label: 'Certificates', icon: Award, section: 'certificates' },
  { href: '/admin/users', label: 'User Management', icon: UserCog, section: 'users' },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userPermissions, setUserPermissions] = useState<Record<string, { read: boolean; write: boolean }>>({});
  const [userRole, setUserRole] = useState<string>('');
  const [userDisplayName, setUserDisplayName] = useState<string>('Admin');
  const [accessDenied, setAccessDenied] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAuthenticated(true);
            setUserPermissions(data.user.permissions || {});
            setUserRole(data.user.role || '');
            setUserDisplayName(data.user.username || 'Admin');
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

  useEffect(() => {
    if (!authenticated) return;

    const currentItem = allNavItems.find((item) =>
      item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
    );

    if (pathname === '/admin') {
      setAccessDenied(false);
      return;
    }

    if (userRole === 'admin') {
      setAccessDenied(false);
      return;
    }

    if (pathname === '/admin/users') {
      setAccessDenied(true);
      return;
    }

    if (currentItem?.section) {
      const perm = userPermissions[currentItem.section];
      if (!perm || !perm.read) {
        setAccessDenied(true);
      } else {
        setAccessDenied(false);
      }
    } else {
      setAccessDenied(false);
    }
  }, [authenticated, pathname, userPermissions]);

  const navItems = allNavItems.filter((item) => {
    if (!authenticated) return true;
    if (item.href === '/admin') return true;
    if (item.section === 'users') return userRole === 'admin';
    if (item.section) {
      const perm = userPermissions[item.section];
      return perm && perm.read;
    }
    return true;
  });

  // Set admin mode class
  useEffect(() => {
    document.documentElement.classList.add('admin-mode');
    document.body.classList.add('admin-mode-active');
    return () => {
      document.documentElement.classList.remove('admin-mode');
      document.body.classList.remove('admin-mode-active');
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-purple animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  // Active sidebar state: desktop uses sidebarOpen, mobile uses mobileSidebarOpen
  const activeSidebar = isDesktop ? sidebarOpen : mobileSidebarOpen;

  return (
    <>
      {/* ═══ Admin Mode CSS — Hide main site elements ═══ */}
      <style>{`
        /* Hide all main site navigation, footer, floating elements */
        html.admin-mode body > nav,
        html.admin-mode body > div > nav,
        html.admin-mode body > footer,
        html.admin-mode body > div > footer,
        html.admin-mode nav[class*="fixed"],
        html.admin-mode footer {
          display: none !important;
        }
        /* Hide floating buttons (WhatsApp, Call, Scroll-top) */
        html.admin-mode a.fixed,
        html.admin-mode button.fixed,
        html.admin-mode .fixed[class*="bottom-"][class*="right-"],
        html.admin-mode .fixed[class*="bottom-"][class*="left-"] {
          display: none !important;
        }
        /* Hide scroll progress bar */
        html.admin-mode [class*="scroll-progress"],
        html.admin-mode .fixed.top-0[class*="origin-left"] {
          display: none !important;
        }
        /* Remove body padding/margin from main site header */
        html.admin-mode body {
          padding-top: 0 !important;
          margin-top: 0 !important;
        }
        /* Make main wrapper non-interfering */
        html.admin-mode main {
          min-height: 0 !important;
          display: block !important;
        }
        /* Ensure Radix UI portals (Dialogs, Selects, Alerts) render above admin */
        html.admin-mode [data-radix-portal] {
          z-index: 10001 !important;
        }
        /* Ensure dialog overlays are visible */
        html.admin-mode [role="dialog"],
        html.admin-mode [data-state="open"] {
          z-index: 10001 !important;
        }
      `}</style>

      {/* ═══ Admin Dashboard Container ═══ */}
      <div className="min-h-screen bg-background flex">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
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
        {/* Desktop: static, visible always, collapsible */}
        {/* Mobile: fixed overlay, toggle with hamburger */}
        <aside
          className={cn(
            'bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 ease-in-out z-50',
            // Desktop: always in flow, width changes on collapse
            isDesktop
              ? cn(
                  sidebarOpen ? 'w-72' : 'w-[68px]',
                  'static',
                )
              : cn(
                  // Mobile: fixed positioning, slide in/out
                  'fixed top-0 left-0 bottom-0 w-72',
                  mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                ),
          )}
        >
          {/* Sidebar Header */}
          <div className={cn(
            'border-b border-border flex items-center h-16 shrink-0',
            sidebarOpen || !isDesktop ? 'p-4' : 'px-3 justify-center',
          )}>
            {(sidebarOpen || !isDesktop) ? (
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
                    <h2 className="font-bold text-sm truncate" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>Impact Computers</h2>
                    <p className="text-xs text-muted-foreground truncate">Admin Panel</p>
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
            {(sidebarOpen || !isDesktop) && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Navigation
              </p>
            )}
            {navItems.map((navItem) => {
              const isActive =
                navItem.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(navItem.href);
              const Icon = navItem.icon;
              const collapsed = isDesktop && !sidebarOpen;

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
                  {(!collapsed) && <span>{navItem.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className={cn(
            'border-t border-border shrink-0',
            sidebarOpen || !isDesktop ? 'p-4' : 'p-3',
          )}>
            {(sidebarOpen || !isDesktop) ? (
              <>
                <a
                  href="/"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 mb-3"
                >
                  Visit Website <span aria-hidden="true">&rarr;</span>
                </a>
                <div className="flex items-center gap-3 px-3 py-2 mb-3">
                  <div className="w-9 h-9 rounded-full bg-brand-purple/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate capitalize">{userDisplayName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userRole} &middot; Authenticated</p>
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
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border flex-shrink-0">
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
                    {navItems.find(
                      (navItem) =>
                        navItem.href === '/admin'
                          ? pathname === '/admin'
                          : pathname.startsWith(navItem.href)
                    )?.label || 'Dashboard'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 sm:px-3 py-1.5 rounded-full whitespace-nowrap">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Admin Mode
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-brand-purple hover:text-brand-purple-dark border-brand-purple/30 hover:border-brand-purple/50"
                >
                  <Link href="/admin">
                    <LayoutDashboard className="w-3.5 h-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                >
                  <Link href="/admin/enquiries">
                    <MessageSquare className="w-3.5 h-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Enquiries</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-brand-purple hover:text-brand-purple-dark border-brand-purple/30 hover:border-brand-purple/50"
                >
                  <Link href="/admin/settings">
                    <Settings className="w-3.5 h-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Settings</span>
                  </Link>
                </Button>
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

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
            {accessDenied ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                  <p className="text-muted-foreground text-sm max-w-md">
                    You don&apos;t have permission to view this section. Contact your administrator for access.
                  </p>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </>
  );
}
