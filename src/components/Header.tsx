'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Menu, X, Sun, Moon, ChevronDown, Camera, GraduationCap, Award, Video, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

const allNavItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About', dropdown: [
    { href: '/about#introduction', label: 'Introduction' },
    { href: '/about#aim', label: 'Our Aim & Objective' },
    { href: '/about#vision', label: 'Our Vision & Mission' },
    { href: '/about#founder', label: 'Our Founder' },
  ]},
  { href: '/courses', label: 'Courses' },
  { href: '/why-us', label: 'Why Us' },
  { href: '/gallery', label: 'Gallery', dropdown: [
    { href: '/gallery/photos', label: 'Photos', icon: Camera },
    { href: '/gallery/faculty', label: 'Faculty', icon: GraduationCap },
    { href: '/gallery/certificates', label: 'Certificates', icon: Award },
    { href: '/gallery/videos', label: 'Videos', icon: Video },
  ]},
  { href: '/contact', label: 'Contact' },
  { href: '/facilities', label: 'Facilities' },
  { href: '/ai-learning', label: 'AI Learning' },
  { href: '/enquiry', label: 'Enquiry' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Avoid hydration mismatch: defer theme-aware icon rendering until after mount
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => { setMobileMenuOpen(false); setActiveDropdown(null); }, [pathname]);
  useEffect(() => {
    const h = () => setActiveDropdown(null);
    window.addEventListener('scroll', h, true);
    return () => window.removeEventListener('scroll', h, true);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Don't render Header on admin pages
  if (pathname.startsWith('/admin')) return null;

  const IMPACT = { fontFamily: 'Impact, "Arial Black", "Helvetica Neue", sans-serif' };
  const GEORGIA = { fontFamily: 'Georgia, "Times New Roman", "Palatino Linotype", serif' };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* ═══ Since 1997 Top Bar ═══ */}
      <div className="bg-gradient-to-r from-[#c62828] via-[#b71c1c] to-[#c62828]">
        <div className="max-w-[95rem] mx-auto px-2 sm:px-5 lg:px-8 flex items-center justify-center h-6 sm:h-8">
          <span className="text-[8px] sm:text-[11px] lg:text-xs font-bold text-white/90 tracking-[0.15em] uppercase whitespace-nowrap" style={GEORGIA}>
            ★ Since 1997 ★ Trusted for 25+ Years ★ Government Certified ★
          </span>
        </div>
      </div>

      {/* ═══ MAIN HEADER — 3-Column Grid: Logo | Name Center | Logos Right ═══ */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-[95rem] mx-auto px-2 sm:px-5 lg:px-8">
          {/* Desktop & Tablet Header */}
          <div className="hidden sm:flex items-center justify-between h-[106px] lg:h-[126px]">

            {/* LEFT: Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <Image src="/logo-impact-transparent.png" alt="Impact Computers" width={100} height={100} priority
                className="h-[72px] sm:h-[80px] lg:h-[94px] w-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-120" />
            </Link>

            {/* CENTER: Institute Name */}
            <div className="flex flex-col items-center flex-1 min-w-0 px-4">
              <span className="text-[10px] md:text-[12px] lg:text-[14px] font-bold text-[#1a237e] tracking-wide leading-tight" style={GEORGIA}>
                महाराष्ट्र राज्य कौशल्य विकास मंडळ प्रमाणित
              </span>
              <span className="text-[11px] md:text-[13px] lg:text-[15px] font-bold text-[#0d47a1] tracking-wide leading-tight mt-0" style={GEORGIA}>
                MS-CIT Authorised Center
              </span>
              <div className="flex items-baseline leading-none mt-0.5">
                <span className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-[#c62828] tracking-tight" style={IMPACT}>impact&nbsp;</span>
                <span className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-[#c62828] tracking-tight" style={IMPACT}>computers</span>
              </div>
              <span className="text-[9px] md:text-[11px] lg:text-[12px] text-gray-500 font-semibold mt-0.5 tracking-wide" style={GEORGIA}>
                Koparkhairne &bull; Ghansoli &bull; Bonkode &bull; Since 1997
              </span>
            </div>

            {/* RIGHT: Recognized By + 4 Logos */}
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="text-[10px] sm:text-xs lg:text-sm text-black font-bold uppercase tracking-wider mb-1.5" style={GEORGIA}>Recognized by</span>
              <div className="flex items-center gap-2.5 lg:gap-3.5">
                <Image src="/logo-ashoka-emblem.png" alt="MKCL" width={56} height={56} className="h-11 sm:h-12 lg:h-[52px] w-auto object-contain" />
                <Image src="/logo-msbsvet.png" alt="MSBSVET" width={56} height={56} className="h-11 sm:h-12 lg:h-[52px] w-auto object-contain" />
                <Image src="/logo-mkcl-official.png" alt="GoI" width={56} height={56} className="h-11 sm:h-12 lg:h-[52px] w-auto object-contain" />
                <Image src="/logo-ycmou.png" alt="YCMOU" width={56} height={56} className="h-11 sm:h-12 lg:h-[52px] w-auto object-contain" />
              </div>
            </div>
          </div>

          {/* ═══ MOBILE HEADER — Compact Single Row ═══ */}
          <div className="flex sm:hidden items-center h-[62px]">
            {/* LEFT: Logo (small) */}
            <Link href="/" className="flex-shrink-0 mx-1">
              <Image src="/logo-impact-transparent.png" alt="Impact Computers" width={52} height={52} priority
                className="h-9 w-auto object-contain" />
            </Link>

            {/* CENTER: Impact Computers Name */}
            <div className="flex-1 flex flex-col items-center justify-center min-w-0 mx-1">
              <div className="mt-1"></div>
              <span className="text-[9px] font-bold text-[#1a237e] tracking-wide leading-none" style={GEORGIA}>
                महाराष्ट्र राज्य कौशल्य विकास मंडळ प्रमाणित
              </span>
              <span className="text-[10px] font-bold text-[#0d47a1] tracking-wide leading-tight" style={GEORGIA}>
                MS-CIT Authorised Center
              </span>
              <span className="text-[21px] text-[#c62828] leading-none" style={IMPACT}>impact computers</span>
            </div>

            {/* RIGHT: Hamburger + compact logos row */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center mx-0.5">
              {/* Hamburger on top */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-8 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu className="w-4 h-4 text-gray-700" />
              </button>
              {/* Mobile: no mini logos — only show on desktop/tablet */}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Desktop Navigation Bar ═══ */}
      <div className="bg-gradient-to-r from-brand-purple via-purple-700 to-brand-purple-dark hidden lg:block shadow-lg" style={GEORGIA}>
        <div className="max-w-[95rem] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[48px]">
            <div className="flex items-center gap-0 flex-1">
              {allNavItems.map((item) => {
                const active = isActiveLink(item.href);
                const hasDropdown = item.dropdown && item.dropdown.length > 0;
                if (hasDropdown) {
                  return (
                    <div key={item.href} className="relative group"
                      onMouseEnter={() => setActiveDropdown(item.href)}
                      onMouseLeave={() => setActiveDropdown(null)}>
                      <Link href={item.href}
                        className={`relative px-3 xl:px-4 h-[48px] flex items-center gap-1 text-[13px] font-bold transition-all ${active ? 'text-brand-yellow' : 'text-white/90 hover:text-white'}`}>
                        <motion.span className="relative z-10" whileHover={{ y: -1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>{item.label}</motion.span>
                        <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                        {active && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-yellow rounded-full" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                      </Link>
                      <AnimatePresence>
                        {activeDropdown === item.href && (
                          <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.98 }} transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-0 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-2 min-w-[230px] z-50">
                            {item.dropdown!.map((sub) => {
                              const SubIcon = (sub as { icon?: React.ComponentType<{ className?: string }> }).icon;
                              return (
                                <Link key={sub.href} href={sub.href} onClick={() => setActiveDropdown(null)}
                                  className={`flex items-center gap-3 px-4 py-2.5 text-sm ${pathname === sub.href ? 'text-brand-purple font-semibold bg-brand-purple/5' : 'text-foreground/70 hover:text-brand-purple hover:bg-brand-purple/5'}`}>
                                  {SubIcon && <SubIcon className="w-4 h-4 flex-shrink-0" />}<span>{sub.label}</span>
                                </Link>);
                            })}
                            {item.href === '/gallery' && (
                              <div className="border-t border-gray-100 mt-1 pt-1">
                                <Link href="/admin/login" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/40 hover:text-brand-purple hover:bg-brand-purple/5">
                                  <Lock className="w-4 h-4" />Admin Login
                                </Link>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <Link key={item.href} href={item.href} className="relative px-3 xl:px-4 h-[48px] flex items-center text-[13px] font-bold transition-all group">
                    <motion.span className={`relative z-10 ${active ? 'text-brand-yellow' : 'text-white/90 hover:text-white'}`} whileHover={{ y: -1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>{item.label}</motion.span>
                    {active && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-yellow rounded-full" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                    {!active && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-white/0 group-hover:bg-white/30 rounded-full transition-all" />}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-2 ml-auto pl-3 flex-shrink-0">
              <a href="tel:9768100649">
                <Button variant="outline" size="sm" className="h-[36px] border-white/30 text-white hover:bg-white hover:text-brand-purple bg-white/10 text-xs font-bold whitespace-nowrap">
                  <Phone className="w-3.5 h-3.5 mr-1.5" />Call Now
                </Button>
              </a>
              <Link href="/enquiry">
                <Button size="sm" className="h-[36px] bg-brand-yellow text-brand-purple-deep hover:bg-brand-yellow-light font-bold shadow-md text-xs whitespace-nowrap">Enroll Now</Button>
              </Link>
              <button onClick={toggleTheme} className="p-1.5 rounded-lg border border-white/20 hover:border-white/50 hover:bg-white/10 transition-all" aria-label="Toggle theme">
                {mounted ? (theme === 'light' ? <Moon className="w-4 h-4 text-white/80" /> : <Sun className="w-4 h-4 text-brand-yellow" />) : <Moon className="w-4 h-4 text-white/80" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Tablet Navigation (sm–lg) ═══ */}
      <div className="bg-gradient-to-r from-brand-purple to-brand-purple-dark hidden sm:block lg:hidden shadow-md" style={GEORGIA}>
        <div className="max-w-[95rem] mx-auto px-4">
          <div className="flex items-center justify-between h-[42px]">
            <div className="flex items-center gap-0 flex-1 overflow-x-auto">
              {allNavItems.map((item) => (
                <Link key={item.href} href={item.href}
                  className={`relative px-2.5 h-[42px] flex items-center text-[11px] font-bold transition-all whitespace-nowrap ${isActiveLink(item.href) ? 'text-brand-yellow' : 'text-white/80 hover:text-white'}`}>
                  {item.label}
                  {isActiveLink(item.href) && <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-brand-yellow rounded-full" />}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
              <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-white/10" aria-label="Toggle theme">
                {mounted ? (theme === 'light' ? <Moon className="w-4 h-4 text-white/70" /> : <Sun className="w-4 h-4 text-brand-yellow" />) : <Moon className="w-4 h-4 text-white/70" />}
              </button>
              <Link href="/enquiry" className="px-2 py-1 text-[11px] font-bold text-brand-yellow bg-brand-yellow/10 rounded-lg">Enroll</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Mobile Slide Menu ═══ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 sm:hidden" style={{ WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white dark:bg-background shadow-2xl z-50 sm:hidden overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
                <span className="font-bold text-foreground text-sm">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 px-3 py-3 space-y-0.5">
                {allNavItems.map((item, i) => {
                  const active = isActiveLink(item.href);
                  const hasDropdown = item.dropdown && item.dropdown.length > 0;
                  return (
                    <motion.div key={item.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.02 + i * 0.02 }}>
                      {hasDropdown ? (
                        <div>
                          <Link href={item.href} onClick={() => setMobileMenuOpen(false)}
                            className={`block px-3 py-3 text-sm font-bold rounded-xl ${active ? 'text-brand-purple bg-brand-purple/5' : 'text-foreground/70 hover:text-brand-purple hover:bg-gray-50'}`}>
                            {item.label}
                          </Link>
                          <div className="ml-4 pl-3 border-l-2 border-brand-purple/20 space-y-0.5">
                            {item.dropdown!.map((sub) => {
                              const SubIcon = (sub as { icon?: React.ComponentType<{ className?: string }> }).icon;
                              return (
                                <Link key={sub.href} href={sub.href} onClick={() => setMobileMenuOpen(false)}
                                  className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-gray-50 ${pathname === sub.href ? 'text-brand-purple font-semibold' : 'text-foreground/60'}`}>
                                  {SubIcon && <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />}<span>{sub.label}</span>
                                </Link>);
                            })}
                            {item.href === '/gallery' && (
                              <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-foreground/40 hover:text-brand-purple rounded-lg hover:bg-gray-50">
                                <Lock className="w-3.5 h-3.5" />Admin Login
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Link href={item.href} onClick={() => setMobileMenuOpen(false)}
                          className={`block px-3 py-3 text-sm font-bold rounded-xl ${active ? 'text-brand-purple bg-brand-purple/5' : 'text-foreground/70 hover:text-brand-purple hover:bg-gray-50'}`}>
                          {item.label}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <div className="px-3 py-4 border-t border-gray-100 space-y-2 flex-shrink-0">
                <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold rounded-xl text-foreground/70 hover:text-brand-purple hover:bg-gray-50">
                  {mounted ? (theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />) : <Moon className="w-4 h-4" />}
                  {mounted ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : 'Dark Mode'}
                </button>
                <a href="tel:9768100649" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="outline" className="w-full border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white text-sm font-bold">
                    <Phone className="w-4 h-4 mr-2" />Call: 9768100649
                  </Button>
                </a>
                <Link href="/enquiry" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button className="w-full bg-brand-yellow text-brand-purple-deep hover:bg-brand-yellow-light font-bold text-sm">Enroll Now</Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
