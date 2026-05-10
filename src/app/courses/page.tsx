'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Clock, CheckCircle, Star, ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import FadeIn from '@/components/shared/FadeIn';
import SectionHeading from '@/components/shared/SectionHeading';
import PageTransition from '@/components/PageTransition';

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
  isActive: boolean;
}

const fallbackCourses: Course[] = [];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(fallbackCourses);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      <PageTransition>
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-purple-50/50 dark:from-background dark:to-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Our Courses"
              title="Job-Oriented Courses Designed for Your Success"
              subtitle="Each course comes with government certification, practical training, and placement support to help you build a successful career."
            />

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 w-full rounded-2xl" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No courses available yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {courses.map((course, index) => (
                  <FadeIn key={course.id} delay={index * 0.05}>
                    <Card
                      className={`relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 group h-full dark:bg-card flex flex-col ${
                        course.popular ? 'ring-2 ring-brand-yellow' : ''
                      }`}
                    >
                      {/* Popular Badge */}
                      {course.popular && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-brand-yellow text-brand-purple-deep font-bold shadow-md">
                            <Star className="w-3 h-3 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      {/* Card Header */}
                      <div className={`bg-gradient-to-r ${course.color} p-6 pb-8 relative`}>
                        <div
                          className="absolute bottom-0 left-0 right-0 h-8 bg-white dark:bg-card rounded-t-3xl"
                          style={{ transform: 'translateY(50%)' }}
                        />
                        <div className="relative z-10">
                          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 overflow-hidden p-1.5 relative">
                            {course.iconUrl ? (
                              <Image src={course.iconUrl} alt={course.title} fill sizes="56px" className="object-contain" />
                            ) : (
                              <GraduationCap className="w-7 h-7 text-white" />
                            )}
                          </div>
                          <h3
                            className="text-lg font-extrabold text-white leading-tight cursor-pointer hover:underline underline-offset-2"
                            onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); }}
                          >
                            {course.title}
                          </h3>
                          <p className="text-white/80 text-sm mt-1">{course.subtitle}</p>
                        </div>
                      </div>

                      <CardContent className="pt-6 pb-6 px-6 flex flex-col flex-1">
                        <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                          {course.description}
                        </p>

                        {/* Duration */}
                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-brand-purple">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>Duration: {course.duration}</span>
                        </div>

                        {/* Fees */}
                        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-brand-yellow-dark">
                          <span className="truncate">{course.fees}</span>
                        </div>

                        {/* Benefits (show first 4) */}
                        <ul className="space-y-2 mb-6 flex-1">
                          {(course.benefits || []).slice(0, 4).map((benefit, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-sm text-foreground"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="line-clamp-1">{benefit}</span>
                            </li>
                          ))}
                          {(course.benefits || []).length > 4 && (
                            <li className="text-xs text-muted-foreground ml-6">
                              +{(course.benefits || []).length - 4} more benefits
                            </li>
                          )}
                        </ul>

                        {/* Buttons */}
                        <div className="flex flex-col gap-2">
                          <Link href={`/courses/${course.slug}`}>
                            <Button
                              className={`w-full font-bold transition-all ${
                                course.popular
                                  ? 'bg-brand-yellow text-brand-purple-deep hover:bg-brand-yellow-light'
                                  : 'bg-brand-purple text-white hover:bg-brand-purple-dark'
                              }`}
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                          <Link href="/enquiry">
                            <Button
                              variant="outline"
                              className="w-full font-bold border-brand-purple/30 text-brand-purple hover:bg-brand-purple/5 transition-all"
                            >
                              Enroll Now
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Course Detail Dialog */}
        <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
          <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold pr-6">{selectedCourse?.title}</DialogTitle>
              {selectedCourse?.subtitle && (
                <DialogDescription>{selectedCourse.subtitle}</DialogDescription>
              )}
            </DialogHeader>
            {selectedCourse && (
              <div className="space-y-4 py-2">
                {(selectedCourse.description || selectedCourse.overview) && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.description || selectedCourse.overview}</p>
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
                      <span className="w-4 h-4 text-brand-yellow-dark flex-shrink-0 text-sm font-bold">₹</span>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Fees</p>
                        <p className="text-sm font-semibold">{selectedCourse.fees}</p>
                      </div>
                    </div>
                  )}
                  {selectedCourse.certification && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/10">
                      <GraduationCap className="w-4 h-4 text-green-600 flex-shrink-0" />
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
                {selectedCourse.examDetails && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10">
                    <p className="text-[10px] text-muted-foreground">Exam Details</p>
                    <p className="text-sm font-semibold">{selectedCourse.examDetails}</p>
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
      </PageTransition>
    </div>
  );
}
