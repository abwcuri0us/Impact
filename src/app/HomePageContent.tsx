'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Brain, GraduationCap, Award, Users, Phone,
  Shield, ChevronRight, Verified, Sparkles,
  MapPin, Clock, Star, BookOpen, Target,
  Laptop, TrendingUp, HeartHandshake, IndianRupee,
  MessageCircle, CheckCircle, BarChart3, Code,
  Database, FileText, Globe, Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ParticleBackground from '@/components/ParticleBackground';
import PageTransition from '@/components/PageTransition';
import MagneticButton from '@/components/MagneticButton';
import TextReveal from '@/components/TextReveal';
import CountUp from '@/components/shared/CountUp';

/* ── Animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.35, ease: 'easeOut', delay },
});

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
};

/* Color palettes for course cards */
const cardColors = [
  { gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)', accent: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { gradient: 'linear-gradient(135deg, #10b981, #059669)', accent: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  { gradient: 'linear-gradient(135deg, #ec4899, #be185d)', accent: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
];

/* No default Lucide icons for courses — only DB-uploaded logos are shown */

/* Fallback courses for when API is unavailable — no default icons */
interface CourseItem {
  name: string;
  slug: string;
  icon: string;
  iconName: string;
  popular: boolean;
  description: string;
  duration: string;
  fees: string;
  benefits: string[];
  syllabus: string[];
  certification: string;
  subtitle: string;
  overview: string;
  examDetails: string;
}
const fallbackCourses: CourseItem[] = [];

/* Skeleton for course cards */
function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-white/5">
      <Skeleton className="h-1.5 w-full" />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [courses, setCourses] = useState<typeof fallbackCourses>([]);
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState(false);

  // Fetch courses from API (admin-managed)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) {
          setCoursesError(true);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((c: Record<string, unknown>) => ({
            name: c.title || c.name || '',
            slug: c.slug || '',
            icon: (c.iconUrl as string) || (c.icon_url as string) || '',
            iconName: (c.icon as string) || '',
            color: (c.color as string) || '',
            popular: !!c.popular,
            description: (c.description as string) || '',
            duration: (c.duration as string) || '',
            fees: (c.fees as string) || '',
            benefits: (c.benefits as string[]) || [],
            syllabus: (c.syllabus as string[]) || [],
            certification: (c.certification as string) || '',
            subtitle: (c.subtitle as string) || '',
            overview: (c.overview as string) || '',
            examDetails: (c.exam_details as string) || '',
          }));
          setCourses(mapped);
        }
      } catch {
        setCoursesError(true);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Subtle parallax on hero blobs using rAF
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let rafId: number;
    const blobs = document.querySelectorAll<HTMLElement>('.hero-parallax-blob');

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        blobs.forEach((blob) => {
          const speed = parseFloat(blob.dataset.speed || '0');
          blob.style.transform = `translateY(${scrollY * speed}px)`;
        });
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div>
      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden pt-32 sm:pt-40 md:pt-44">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-yellow rounded-full blur-3xl hero-parallax-blob" data-speed="0.15" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-purple-light rounded-full blur-3xl hero-parallax-blob" data-speed="-0.1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-yellow rounded-full blur-[120px] hero-parallax-blob" data-speed="0.08" />
        </div>

        <div className="absolute top-20 left-[5%] w-64 h-64 bg-brand-yellow/10 animate-morph hero-parallax-blob" data-speed="0.12" />
        <div className="absolute bottom-32 right-[5%] w-80 h-80 bg-brand-purple-light/15 animate-morph hero-parallax-blob" data-speed="-0.08" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-[60%] left-[50%] w-48 h-48 bg-white/5 animate-morph hero-parallax-blob" data-speed="0.05" style={{ animationDelay: '-2s' }} />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 right-[15%] animate-float-slow"><Brain className="w-12 h-12 md:w-16 md:h-16 text-brand-yellow/30" /></div>
          <div className="absolute bottom-40 left-[10%] animate-float-reverse"><GraduationCap className="w-10 h-10 md:w-14 md:h-14 text-brand-yellow/25" /></div>
          <div className="absolute top-[45%] right-[8%] animate-float-slow" style={{ animationDelay: '-2s' }}><Verified className="w-8 h-8 md:w-12 md:h-12 text-white/20" /></div>
          <div className="absolute top-[25%] left-[8%] animate-float-reverse" style={{ animationDelay: '-1s' }}><Award className="w-10 h-10 md:w-12 md:h-12 text-brand-yellow/20" /></div>
          <div className="absolute bottom-[30%] right-[20%] animate-float-slow" style={{ animationDelay: '-3s' }}><Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white/15" /></div>
          <div className="absolute top-[18%] right-[30%] animate-float-slow" style={{ animationDelay: '-5s' }}>
            <div className="relative w-14 h-14 md:w-20 md:h-20">
              <Image src="/logo-impact-transparent.png" alt="" fill quality={1} unoptimized className="object-contain opacity-[0.12]" />
            </div>
          </div>
          <div className="absolute bottom-[25%] left-[20%] animate-float-reverse" style={{ animationDelay: '-4s' }}>
            <div className="relative w-10 h-10 md:w-16 md:h-16">
              <Image src="/logo-impact-transparent.png" alt="" fill quality={1} unoptimized className="object-contain opacity-[0.08]" />
            </div>
          </div>
          <div className="absolute top-[55%] left-[75%] animate-float-slow" style={{ animationDelay: '-1.5s' }}>
            <div className="relative w-8 h-8 md:w-12 md:h-12">
              <Image src="/logo-impact-transparent.png" alt="" fill quality={1} unoptimized className="object-contain opacity-[0.10] rotate-12" />
            </div>
          </div>
        </div>

        <ParticleBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 pb-24 md:pb-12">
          <PageTransition>
            <div className="max-w-3xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <Badge className="mb-6 px-4 py-2 bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 text-sm font-semibold">
                    <Sparkles className="w-4 h-4 mr-1.5" /> Now with AI-Powered Learning
                  </Badge>
                </motion.div>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-extrabold text-white leading-[1.1] mb-6 text-shadow-lg">
                <TextReveal text="Learn Computer Skills That" className="text-white" delay={0.05} />
                <span className="text-brand-yellow"><TextReveal text="Actually Get You Jobs" delay={0.15} /></span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="text-base sm:text-lg md:text-xl text-white/80 mb-8 max-w-xl mx-auto">
                Government Certified Courses &bull; Trusted Since 1997 &bull; 4 Branches in Navi Mumbai &bull; 25,000+ Students Trained
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton strength={0.2}>
                  <Link href="/enquiry">
                    <Button size="lg" className="w-full sm:w-auto bg-brand-yellow text-brand-purple-deep hover:bg-brand-yellow-light font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-xl hover:shadow-2xl transition-all border-2 border-brand-yellow-dark/20">
                      <GraduationCap className="w-5 h-5 mr-2" /> Enroll Now <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </MagneticButton>
                <MagneticButton strength={0.2}>
                  <a href="tel:9768100649">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-brand-purple-deep hover:bg-brand-yellow hover:text-brand-purple-deep font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all border-2 border-white/50">
                      <Phone className="w-5 h-5 mr-2" /> Call Now
                    </Button>
                  </a>
                </MagneticButton>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.45 }} className="mt-6 flex flex-wrap items-center gap-4 justify-center">
                <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm rounded-lg px-3 py-1.5 border border-white/15"><Shield className="w-4 h-4 text-brand-yellow" /><span>Govt. Certified</span></div>
                <div className="w-px h-4 bg-white/30 hidden sm:block" />
                <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm rounded-lg px-3 py-1.5 border border-white/15"><Award className="w-4 h-4 text-brand-yellow" /><span>25+ Years Experience</span></div>
                <div className="w-px h-4 bg-white/30 hidden sm:block" />
                <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm rounded-lg px-3 py-1.5 border border-white/15"><Users className="w-4 h-4 text-brand-yellow" /><span>25,000+ Students</span></div>
              </motion.div>
            </div>
          </PageTransition>
        </div>

        <div className="absolute bottom-0 left-0 right-0 text-white dark:text-[#0f0a1a]">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50L60 45C120 40 240 30 360 35C480 40 600 60 720 65C840 70 960 60 1080 50C1200 40 1320 30 1380 25L1440 20V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* ═══════ ABOUT PREVIEW ═══════ */}
      <section className="py-16 md:py-20 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <Badge className="mb-4 px-3 py-1.5 bg-brand-purple/10 text-brand-purple border border-brand-purple/20 text-xs font-semibold">
                <Star className="w-3 h-3 mr-1" /> About Us
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
                Trusted Since <span className="text-brand-purple">1997</span> — Building Futures Through Computer Education
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Impact Computers was founded by <strong className="text-foreground">Mr. Sharad Shinde</strong> with a vision to make quality computer education accessible to everyone in Navi Mumbai. With over <strong className="text-foreground">27 years</strong> of dedication, we have trained more than <strong className="text-foreground">25,000 students</strong> across our 4 branches.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We are a <strong className="text-foreground">government-authorized MS-CIT center</strong> recognized by MKCL and MSBSVET. Our motto — <em className="text-brand-purple">&ldquo;We may not make student&rsquo;s future, but we can make students for the future&rdquo;</em> — reflects our commitment to practical, job-oriented education that empowers students to achieve their career goals.
              </p>
              <Link href="/about">
                <Button variant="outline" className="border-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white font-semibold transition-all">
                  Read Our Full Story <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-brand-purple/10 to-brand-yellow/10 rounded-3xl blur-xl" />
              <div className="relative bg-gradient-to-br from-brand-purple/5 to-brand-yellow/5 dark:from-brand-purple/10 dark:to-brand-yellow/10 rounded-2xl p-6 md:p-8 border-2 border-brand-purple/10 dark:border-brand-purple/20">
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                >
                  {[
                    { num: 27, suffix: '+', label: 'Years of Trust', icon: Award },
                    { num: 25, suffix: 'K+', label: 'Students Trained', icon: Users },
                    { num: 4, suffix: '', label: 'Branches', icon: MapPin },
                    { num: 15, suffix: '+', label: 'Courses Offered', icon: BookOpen },
                  ].map((s) => (
                    <motion.div key={s.label} variants={staggerItem} whileHover={{ scale: 1.05, y: -2 }} className="text-center p-3 sm:p-4 rounded-xl bg-white/80 dark:bg-white/5 border-2 border-brand-purple/10 dark:border-brand-purple/15 shadow-sm hover:shadow-md hover:border-brand-purple/25 transition-all cursor-default">
                      <s.icon className="w-5 h-5 mx-auto mb-1.5 text-brand-purple dark:text-brand-yellow" />
                      <p className="text-2xl font-extrabold text-foreground"><CountUp end={s.num} suffix={s.suffix} duration={2000} /></p>
                      <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ COURSES PREVIEW ═══════ */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-[#0a0618]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <Badge className="mb-4 px-3 py-1.5 bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 text-xs font-semibold">
              <BookOpen className="w-3 h-3 mr-1" /> Our Courses
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
              Job-Oriented Courses for <span className="text-brand-purple">Every Career Goal</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From basic computer literacy to advanced programming — we offer government-certified courses designed to get you job-ready with hands-on practical training.
            </p>
          </motion.div>

          {loadingCourses ? (
            /* ── Loading Skeleton ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : coursesError ? (
            /* ── Error State ── */
            <motion.div {...fadeUp()} className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">Unable to load courses</p>
              <p className="text-muted-foreground/70 text-sm mb-4">Please check your connection or try again later.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-brand-purple text-sm font-semibold hover:underline inline-flex items-center gap-1"
              >
                <ChevronRight className="w-3 h-3 rotate-180" /> Retry
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                {courses.slice(0, 9).map((c, i) => {
                  const palette = cardColors[i % cardColors.length];
                  const courseGradient = c.color ? (() => {
                    const colorMap: Record<string, string> = {
                      'from-brand-purple to-brand-purple-dark': 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                      'from-brand-purple-dark to-brand-purple-deep': 'linear-gradient(135deg, #5B21B6, #4C1D95)',
                      'from-brand-purple-light to-brand-purple': 'linear-gradient(135deg, #A78BFA, #7C3AED)',
                      'from-brand-yellow-dark to-brand-yellow': 'linear-gradient(135deg, #D97706, #F59E0B)',
                      'from-brand-yellow to-brand-yellow-dark': 'linear-gradient(135deg, #F59E0B, #D97706)',
                      'from-emerald-500 to-emerald-700': 'linear-gradient(135deg, #10B981, #047857)',
                      'from-orange-500 to-orange-700': 'linear-gradient(135deg, #F97316, #C2410C)',
                      'from-rose-500 to-rose-700': 'linear-gradient(135deg, #F43F5E, #BE123C)',
                      'from-cyan-500 to-cyan-700': 'linear-gradient(135deg, #06B6D4, #0E7490)',
                    };
                    return colorMap[c.color] || palette.gradient;
                  })() : palette.gradient;
                  return (
                    <motion.div
                      key={c.name}
                      variants={staggerItem}
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="group relative bg-white dark:bg-card rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 cursor-pointer border border-gray-100 dark:border-white/5 hover:border-brand-purple/20 dark:hover:border-brand-purple/30"
                      onClick={() => setSelectedCourse(c)}
                    >
                      {/* Gradient header strip */}
                      <div className="h-1.5 w-full" style={{ background: courseGradient }} />
                      {/* Hover gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      <div className="relative p-5">
                        <div className="flex items-start gap-4">
                          {/* Course Icon — uploaded logo or default gradient */}
                          <div className="relative w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden border-2 border-gray-200 shadow-sm group-hover:shadow-md group-hover:border-brand-purple/20 transition-all" style={{ backgroundColor: '#ffffff' }}>
                            {c.icon && (c.icon.startsWith('http') || c.icon.startsWith('/')) ? (
                              <Image src={c.icon} alt={c.name} fill sizes="56px" className="object-contain p-1.5" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple to-fuchsia-600">
                                <BookOpen className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                          {/* Course Info */}
                          <div className="flex-1 min-w-0">
                            {c.popular && (
                              <Badge className="bg-brand-yellow text-brand-purple-deep text-[9px] font-bold px-2 py-0 shadow-sm border-0 mb-1">
                                <Star className="w-2.5 h-2.5 mr-0.5" /> Popular
                              </Badge>
                            )}
                            <h3 className="font-bold text-foreground text-sm sm:text-base group-hover:text-brand-purple dark:group-hover:text-brand-yellow transition-colors leading-snug">
                              {c.name}
                            </h3>
                            {c.duration && (
                              <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{c.duration}</span>
                              </div>
                            )}
                            {c.subtitle && (
                              <p className="text-[11px] text-muted-foreground/70 mt-1 line-clamp-1">{c.subtitle}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <ChevronRight className="w-3 h-3" />
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {courses.length > 9 && (
                <motion.div {...fadeUp(0.25)} className="text-center mt-8">
                  <Link href="/courses">
                    <Button className="bg-brand-purple hover:bg-brand-purple-dark text-white font-semibold shadow-md hover:shadow-lg transition-all border-2 border-brand-purple-dark/30">
                      View All {courses.length} Courses <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ═══════ WHY CHOOSE US PREVIEW ═══════ */}
      <section className="py-16 md:py-20 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <Badge className="mb-4 px-3 py-1.5 bg-brand-purple/10 text-brand-purple border border-brand-purple/20 text-xs font-semibold">
              <Target className="w-3 h-3 mr-1" /> Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
              Why <span className="text-brand-purple">25,000+ Students</span> Trust <span style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>Impact Computers</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              { icon: Shield, title: 'Government Certified', desc: 'Authorized MS-CIT center recognized by MKCL and MSBSVET. Our certificates are valued by employers across Maharashtra for government and private sector jobs.', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10' },
              { icon: Laptop, title: 'Modern Computer Labs', desc: 'State-of-the-art computer labs equipped with the latest software and high-speed internet. Every student gets individual hands-on practice during every session.', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10' },
              { icon: TrendingUp, title: 'Job-Oriented Training', desc: 'Our curriculum is designed with industry input to ensure students gain skills that employers actually need. From Tally to Python, every course leads to real career opportunities.', color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10' },
              { icon: HeartHandshake, title: 'Experienced Faculty', desc: 'Our teachers are not just instructors — they are industry professionals with years of practical experience who provide personalized guidance and mentorship.', color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10' },
              { icon: Clock, title: 'Flexible Batches', desc: 'Morning, afternoon, and evening batches available to suit working professionals, college students, and school students. Learn at your own pace and schedule.', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10' },
              { icon: IndianRupee, title: 'Affordable Fees', desc: 'Quality education at pocket-friendly prices with flexible payment options. We believe financial constraints should never come between a student and their career aspirations.', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' },
            ].map((item) => (
              <motion.div key={item.title} variants={staggerItem} whileHover={{ scale: 1.03, y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="group flex gap-4 p-5 rounded-2xl border-2 border-gray-200 dark:border-white/10 hover:border-brand-purple/40 dark:hover:border-brand-purple/40 hover:shadow-lg bg-white dark:bg-card transition-all duration-300 cursor-default relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/[0.02] to-brand-yellow/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border border-gray-100 dark:border-white/10 ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="relative">
                  <h3 className="font-bold text-foreground text-sm mb-1 group-hover:text-brand-purple dark:group-hover:text-brand-yellow transition-colors">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="text-center mt-8">
            <Link href="/why-us">
              <Button variant="outline" className="border-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white font-semibold transition-all">
                See All Reasons <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════ CONTACT & BRANCHES WITH GOOGLE MAPS ═══════ */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-brand-purple via-purple-700 to-fuchsia-700 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-[10%] w-40 h-40 bg-brand-yellow rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-[10%] w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <Badge className="mb-4 px-3 py-1.5 bg-white/15 text-white border border-white/20 text-xs font-semibold">
              <Phone className="w-3 h-3 mr-1" /> Contact & Branches
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Visit Any of Our <span className="text-brand-yellow">4 Branches</span> in Navi Mumbai
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">Walk in anytime during working hours or call us for instant guidance on courses, fees, and enrollment.</p>
          </motion.div>

          {/* Branch Cards with full addresses */}
          <motion.div {...fadeUp(0.1)} className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { name: 'Koparkhairne — Sector 19', address: 'Near Bus Depot, Sector 19, Koparkhairne, Navi Mumbai — 400709', phone: '9768100649', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.5!2d73.02!3d19.10!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDEzJzEyLjAiTiA3M8KwMDAnMzYuMCJF!5e0!3m2!1sen!2sin!4v3' },
              { name: 'Koparkhairne — Sector 12B', address: 'Sicily Park, Sector 12B, Koparkhairne, Navi Mumbai — 400709', phone: '8454044041', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.5!2d73.02!3d19.10!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDEzJzEyLjAiTiA3M8KwMDAnMzYuMCJF!5e0!3m2!1sen!2sin!4v4' },
              { name: 'Ghansoli — Sector 7', address: 'Near D-Mart, Sector 7, Ghansoli, Navi Mumbai — 400701', phone: '9768100649', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.5!2d73.01!3d19.22!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDEzJzEyLjAiTiA3M8KwMDAnMzYuMCJF!5e0!3m2!1sen!2sin!4v1' },
              { name: 'Ghansoli — Sector 5', address: 'Haware Panchvati, Sector 5, Ghansoli, Navi Mumbai — 400701', phone: '8454044041', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.5!2d73.01!3d19.22!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDEzJzEyLjAiTiA3M8KwMDAnMzYuMCJF!5e0!3m2!1sen!2sin!4v2' },
            ].map((b) => (
              <motion.div key={b.name} whileHover={{ scale: 1.03, y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-white/20 hover:border-brand-yellow/50 hover:bg-white/15 transition-all duration-300 group">
                <div className="h-32 overflow-hidden">
                  <iframe
                    src={b.map}
                    width="100%" height="100%"
                    style={{ border: 0, filter: 'grayscale(30%) brightness(0.9)' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={b.name}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-brand-yellow mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm">{b.name}</p>
                      <p className="text-white/60 text-xs mt-0.5">{b.address}</p>
                      <a href={`tel:${b.phone}`} className="text-brand-yellow text-xs mt-1 inline-flex items-center gap-1 hover:underline">
                        <Phone className="w-3 h-3" /> {b.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:9768100649">
              <Button size="lg" className="w-full sm:w-auto bg-brand-yellow text-brand-purple-deep hover:bg-brand-yellow-light font-bold shadow-xl hover:shadow-2xl border-2 border-brand-yellow-dark/30">
                <Phone className="w-5 h-5 mr-2" /> Call: 9768100649
              </Button>
            </a>
            <a href="https://wa.me/919768100649" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full sm:w-auto bg-white/90 text-brand-purple-deep hover:bg-white font-bold shadow-lg hover:shadow-xl border-2 border-white/60 backdrop-blur-sm">
                <MessageCircle className="w-5 h-5 mr-2 text-green-600" /> WhatsApp Us
              </Button>
            </a>
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto bg-white/90 text-brand-purple-deep hover:bg-white font-bold shadow-lg hover:shadow-xl border-2 border-white/60 backdrop-blur-sm">
                All Details <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════ TIMINGS & CTA ═══════ */}
      <section className="py-12 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} whileHover={{ y: -2 }} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-card dark:to-[#150d20] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-brand-purple/10 dark:border-brand-purple/20 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-xl bg-brand-purple/10 dark:bg-brand-purple/20 flex items-center justify-center flex-shrink-0 border border-brand-purple/10">
                <Clock className="w-7 h-7 text-brand-purple dark:text-brand-yellow" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Institute Timings</h3>
                <p className="text-muted-foreground text-sm">Monday to Saturday: <strong className="text-foreground">7:00 AM - 10:00 PM</strong></p>
                <p className="text-xs text-muted-foreground/70">Sunday: Closed | Walk-ins welcome</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/enquiry">
                <Button className="w-full sm:w-auto bg-brand-yellow text-brand-purple-deep hover:bg-brand-yellow-light font-bold shadow-md hover:shadow-lg border-2 border-brand-yellow-dark/20 transition-all">
                  <GraduationCap className="w-4 h-4 mr-1.5" /> Enroll Now
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="w-full sm:w-auto border-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white font-semibold transition-all">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Course Detail Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold pr-6">{selectedCourse?.name}</DialogTitle>
            {selectedCourse?.subtitle && (
              <DialogDescription>{selectedCourse.subtitle}</DialogDescription>
            )}
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4 py-2">
              {selectedCourse.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {selectedCourse.duration && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-purple/5 border border-brand-purple/10">
                    <Clock className="w-4 h-4 text-brand-purple flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Duration</p>
                      <p className="text-sm font-semibold">{selectedCourse.duration}</p>
                    </div>
                  </div>
                )}
                {selectedCourse.fees && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-yellow/5 border border-brand-yellow/10">
                    <IndianRupee className="w-4 h-4 text-brand-yellow-dark flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Fees</p>
                      <p className="text-sm font-semibold">{selectedCourse.fees}</p>
                    </div>
                  </div>
                )}
                {selectedCourse.certification && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/10">
                    <Award className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Certification</p>
                      <p className="text-sm font-semibold">{selectedCourse.certification}</p>
                    </div>
                  </div>
                )}
              </div>
              {(selectedCourse.benefits || []).length > 0 && (
                <div>
                  <h4 className="font-bold text-sm mb-2">Key Benefits</h4>
                  <ul className="space-y-1.5">
                    {(selectedCourse.benefits || []).slice(0, 6).map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(selectedCourse.syllabus || []).length > 0 && (
                <div>
                  <h4 className="font-bold text-sm mb-2">Syllabus</h4>
                  <ul className="space-y-1">
                    {(selectedCourse.syllabus || []).slice(0, 8).map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-5 h-5 rounded bg-brand-purple/10 text-brand-purple text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Link href={`/courses/${selectedCourse.slug}`} className="flex-1">
                  <Button className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white font-bold text-sm">
                    View Full Details <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/enquiry" onClick={() => setSelectedCourse(null)} className="flex-1">
                  <Button variant="outline" className="w-full font-bold text-sm border-brand-purple/30 text-brand-purple">
                    Enroll Now
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
