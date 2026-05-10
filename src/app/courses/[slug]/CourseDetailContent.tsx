'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Clock, CheckCircle, Star, ArrowLeft, BookOpen, Award,
  IndianRupee, GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import FadeIn from '@/components/shared/FadeIn';

interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  iconUrl?: string;
  duration: string;
  fees: string;
  description: string;
  overview: string;
  syllabus: string[];
  benefits: string[];
  color: string;
  popular: boolean;
  certification: string;
  examDetails?: string;
}

export default function CourseDetailContent() {
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Try API first (supports slug lookup)
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data: Course[] = await res.json();
          const found = data.find((c) => c.slug === slug);
          if (found) {
            setCourse(found);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fall through to static data
      }

      // Fallback: try static import
      try {
        const { courses } = await import('@/data/courses');
        const found = courses.find((c: Course) => c.slug === slug);
        if (found) setCourse(found);
      } catch {
        // ignore
      }
      setLoading(false);
    };
    if (slug) fetchCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-[136px] lg:pt-[160px] min-h-screen bg-white dark:bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Skeleton className="h-12 w-3/4 mb-4 rounded-xl" />
          <Skeleton className="h-6 w-1/2 mb-8 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="pt-[136px] lg:pt-[160px] min-h-screen flex items-center justify-center bg-white dark:bg-background">
        <FadeIn className="text-center px-4">
          <BookOpen className="w-20 h-20 text-brand-purple/30 mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Course Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The course you are looking for does not exist or may have been removed.
          </p>
          <Link href="/courses">
            <Button className="bg-brand-purple text-white hover:bg-brand-purple-dark font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Courses
            </Button>
          </Link>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-[136px] lg:pt-[160px]">
      {/* Page Header */}
      <section className="relative gradient-hero py-10 md:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-80 h-80 bg-brand-yellow rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-brand-purple-light rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Courses
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="px-4 py-1.5 bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 text-sm font-semibold">
                {course.iconUrl ? (
                  <Image src={course.iconUrl} alt={course.subtitle} width={16} height={16} className="w-4 h-4 mr-1.5 rounded-sm object-contain" />
                ) : (
                  <GraduationCap className="w-4 h-4 mr-1.5" />
                )}
                {course.subtitle}
              </Badge>
              {course.popular && (
                <Badge className="px-4 py-1.5 bg-brand-yellow text-brand-purple-deep font-bold shadow-md">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              {course.title}
            </h1>
            <p className="text-white/80 text-lg max-w-3xl leading-relaxed">
              {course.description}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-brand-yellow/10 dark:bg-brand-yellow/5 border-b border-brand-yellow/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <FadeIn delay={0.1}>
            <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-10 items-center">
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 dark:bg-brand-purple/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand-purple" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Duration</p>
                  <p className="text-sm font-bold text-foreground">{course.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 dark:bg-brand-purple/20 flex items-center justify-center flex-shrink-0">
                  <IndianRupee className="w-5 h-5 text-brand-purple" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Fees</p>
                  <p className="text-sm font-bold text-foreground truncate">{course.fees}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 dark:bg-brand-purple/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-brand-purple" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Certification</p>
                  <p className="text-sm font-bold text-foreground truncate">{course.certification}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white dark:bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Overview */}
          <FadeIn>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-brand-purple" />
                <h2 className="text-2xl font-extrabold text-foreground">Course Overview</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-base">{course.overview}</p>
            </div>
          </FadeIn>

          {/* Syllabus */}
          {(course.syllabus || []).length > 0 && (
            <FadeIn delay={0.1}>
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="w-6 h-6 text-brand-purple" />
                  <h2 className="text-2xl font-extrabold text-foreground">Syllabus</h2>
                </div>
                <Card className="border border-border dark:bg-card">
                  <CardContent className="p-6">
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {course.syllabus!.map((topic, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 dark:bg-brand-purple/5 hover:bg-muted dark:hover:bg-brand-purple/10 transition-colors">
                          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-brand-purple text-white text-xs font-bold flex items-center justify-center mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm text-foreground leading-relaxed">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          )}

          {/* Benefits */}
          {(course.benefits || []).length > 0 && (
            <FadeIn delay={0.2}>
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-extrabold text-foreground">Key Benefits</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.benefits!.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Fees & Exam Details */}
          <FadeIn delay={0.3}>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <IndianRupee className="w-6 h-6 text-brand-purple" />
                <h2 className="text-2xl font-extrabold text-foreground">Fees & Examination</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border border-border dark:bg-card">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-brand-yellow-dark" />
                      Course Fees
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{course.fees}</p>
                  </CardContent>
                </Card>
                {course.examDetails && (
                  <Card className="border border-border dark:bg-card">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-brand-purple" />
                        Exam Details
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{course.examDetails}</p>
                    </CardContent>
                  </Card>
                )}
                <Card className="border border-border dark:bg-card">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-brand-yellow-dark" />
                      Certification
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{course.certification}</p>
                  </CardContent>
                </Card>
                <Card className="border border-border dark:bg-card">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-brand-purple" />
                      Duration
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{course.duration}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={0.4} className="text-center">
            <div className={`bg-gradient-to-r ${course.color} rounded-2xl p-6 sm:p-8 md:p-12 shadow-xl`}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-3">
                Ready to Start Learning?
              </h2>
              <p className="text-white/80 mb-6 sm:mb-8 max-w-lg mx-auto">
                Enroll today and take the first step towards a successful career in computers and technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/enquiry">
                  <Button
                    size="lg"
                    className="bg-white text-brand-purple-deep hover:bg-white/90 font-bold shadow-lg transition-all hover:translate-y-[-1px]"
                  >
                    Enroll Now
                    <Star className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/50 text-white hover:bg-white/10 font-bold transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    View All Courses
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
