'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MessageCircle, ChevronRight, MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  // Don't render Footer on admin pages
  if (pathname.startsWith('/admin')) return null;

  const GEORGIA = { fontFamily: 'Georgia, "Times New Roman", "Palatino Linotype", serif' };
  return (
    <>
      {/* ═══ Recognized By Banner (just above footer) ═══ */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs sm:text-sm text-black dark:text-gray-200 font-bold uppercase tracking-[0.2em]" style={GEORGIA}>
              Recognized &amp; Affiliated By
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider">
              Since <span className="font-bold text-black dark:text-gray-200">1997</span> — Trusted for 27+ Years
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full max-w-3xl">
              {[
                { src: '/logo-mkcl-official.png', label: 'Government of India', sublabel: '' },
                { src: '/logo-msbsvet.png', label: 'MSBSVET', sublabel: '(Maharashtra State Board of Skills, Vocational Education and Training)' },
                { src: '/logo-ashoka-emblem.png', label: 'MKCL', sublabel: '(Maharashtra Knowledge Corporation)' },
                { src: '/logo-ycmou.png', label: 'YCMOU', sublabel: '(Yashwantrao Chavan Open University)' },
              ].map((logo) => (
                <div key={logo.label} className="bg-white !bg-white rounded-2xl p-3 sm:p-4 shadow-md border border-gray-200 flex flex-col items-center gap-2 cursor-default hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] flex items-center justify-center">
                    <Image src={logo.src} alt={logo.label} width={80} height={80} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center leading-tight">
                    <span className="block text-[10px] sm:text-xs font-bold text-gray-800">{logo.label}</span>
                    <span className="block text-[8px] sm:text-[10px] text-gray-500 mt-0.5">{logo.sublabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Footer ═══ */}
      <footer className="bg-white dark:bg-background border-t border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center p-1 flex-shrink-0">
                  <Image
                    src="/logo-impact-transparent.png"
                    alt="Impact Computers"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-base font-extrabold block text-foreground" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>Impact Computers</span>
                  <span className="text-xs text-muted-foreground">Koparkhairne &bull; Ghansoli &bull; Bonkode &bull; Since 1997</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Government-authorized MS-CIT training center in Navi Mumbai. Building careers through quality computer education since 1997. 4 branches across Koparkhairne and Ghansoli.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <a
                  href="https://www.instagram.com/impact_computergh007?igsh=cHpjMmxkZDlheGk1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-110 transition-all"
                  title="Follow us on Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a
                  href="https://whatsapp.com/channel/0029Vb7WiBMF6smsKbRvlQ30"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-110 transition-all"
                  title="Join our WhatsApp Channel"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="https://www.facebook.com/share/1EBaow79e7/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md hover:shadow-lg hover:scale-110 transition-all"
                  title="Follow us on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-foreground mb-4 text-lg" style={GEORGIA}>Quick Links</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Our Courses', href: '/courses' },
                  { label: 'Why Choose Us', href: '/why-us' },
                  { label: 'AI Learning', href: '/ai-learning' },
                  { label: 'Gallery', href: '/gallery' },
                  { label: 'Contact Us', href: '/contact' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-brand-purple dark:hover:text-brand-yellow text-sm transition-colors inline-flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-3 h-3 opacity-50" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Courses */}
            <div>
              <h4 className="font-bold text-foreground mb-4 text-lg" style={GEORGIA}>Our Courses</h4>
              <ul className="space-y-2.5">
                {[
                  { name: 'MS-CIT', slug: 'ms-cit' },
                  { name: 'Advanced Tally', slug: 'advance-tally-prime-with-gst-tax' },
                  { name: 'Advanced Excel', slug: 'advance-excel' },
                  { name: 'CAO', slug: 'certificate-course-in-computerised-accounting-and-office-automation' },
                  { name: 'CMS', slug: 'certificate-course-in-computer-operation-with-ms-office' },
                ].map((course) => (
                  <li key={course.slug}>
                    <Link href={`/courses/${course.slug}`} className="text-muted-foreground hover:text-brand-purple dark:hover:text-brand-yellow text-sm transition-colors">
                      {course.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact - All Branches REORDERED: Koparkhairne first */}
            <div>
              <h4 className="font-bold text-foreground mb-4 text-lg" style={GEORGIA}>All Branches</h4>
              <div className="space-y-3">
                {[
                  { name: 'Koparkhairne - Sector 19', detail: 'Near Bus Depot, 400709' },
                  { name: 'Koparkhairne - Sector 12B', detail: 'Sicily Park, 400709' },
                  { name: 'Ghansoli - Sector 7', detail: 'Near D-Mart, 400701' },
                  { name: 'Ghansoli - Sector 5', detail: 'Haware Panchvati, 400701' },
                ].map((branch) => (
                  <div key={branch.name} className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-brand-purple dark:text-brand-yellow mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground/80 text-xs font-semibold">{branch.name}</p>
                      <p className="text-muted-foreground text-xs">{branch.detail}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 pt-1">
                  <Phone className="w-4 h-4 text-brand-purple dark:text-brand-yellow flex-shrink-0" />
                  <div className="text-xs">
                    <a href="tel:9768100649" className="text-muted-foreground hover:text-brand-purple dark:hover:text-brand-yellow transition-colors">9768100649</a>
                    <span className="text-muted-foreground/30 mx-1">|</span>
                    <a href="tel:8454044041" className="text-muted-foreground hover:text-brand-purple dark:hover:text-brand-yellow transition-colors">8454044041</a>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-purple dark:text-brand-yellow flex-shrink-0" />
                  <p className="text-muted-foreground text-xs">Mon - Sat: 7 AM - 10 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-gray-200 dark:border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
              <p className="text-muted-foreground/60 text-sm text-center md:text-left">
                &copy; 1997 Impact Computers. All Rights Reserved.
              </p>
              <p className="text-muted-foreground/60 text-xs sm:text-sm text-center md:text-right">
                Government Authorized MS-CIT Training Center &bull; 4 Branches &bull; Navi Mumbai
              </p>
            </div>
            <div className="mt-3 text-center">
              <Link href="/admin/login" className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
