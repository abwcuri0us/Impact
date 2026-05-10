'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Award, ChevronRight, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from '@/components/shared/FadeIn';

interface FacultyMember {
  id: string;
  name: string;
  role: string;
  designation: string;
  branch: string;
  photoUrl: string;
  bio: string;
  expertise: string;
  experience: string;
  isFounder: boolean;
}

const gradients = [
  'from-brand-purple to-brand-purple-deep',
  'from-brand-yellow-dark to-brand-yellow',
  'from-brand-purple-light to-brand-purple',
  'from-brand-yellow to-brand-yellow-dark',
  'from-brand-purple-dark to-brand-purple-deep',
  'from-brand-purple to-brand-purple-dark',
];

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFaculty = useCallback(async () => {
    try {
      const res = await fetch('/api/faculty');
      if (res.ok) {
        const data = await res.json();
        setFaculty(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      {/* Page Header */}
      <section className="relative gradient-hero py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-80 h-80 bg-brand-yellow rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Link href="/gallery" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Gallery
            </Link>
            <br />
            <Badge className="mb-3 px-4 py-1.5 bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 text-sm font-semibold">
              <Users className="w-4 h-4 mr-1.5" />
              Faculty Members
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
              Our Expert{' '}
              <span className="text-brand-yellow">Faculty</span>
            </h1>
            <p className="text-white/80 text-base max-w-2xl mx-auto">
              Meet our experienced and certified trainers who are passionate about student success.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Faculty Grid */}
      <section className="bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-2xl" />
              ))}
            </div>
          ) : faculty.length === 0 ? (
            <FadeIn>
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No faculty members available yet.</p>
              </div>
            </FadeIn>
          ) : (
            <FadeIn>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <AnimatePresence>
                  {faculty.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white dark:bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-brand-purple/10 dark:border-brand-purple/20 overflow-hidden"
                    >
                      <div className={`bg-gradient-to-r ${gradients[index % gradients.length]} p-6 text-center relative`}>
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-white dark:bg-card rounded-t-2xl" style={{ transform: 'translateY(50%)' }} />
                        <div className="w-24 h-32 rounded-2xl bg-white/20 border-[3px] border-yellow-500/70 shadow-[0_0_12px_rgba(234,179,8,0.25)] mx-auto flex items-center justify-center overflow-hidden relative">
                          {member.photoUrl ? (
                            <Image src={member.photoUrl} alt={member.name} fill sizes="96px" className="rounded-2xl object-cover object-center" />
                          ) : (
                            <span className="text-2xl font-extrabold text-white">
                              {member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="pt-8 px-5 pb-5 text-center">
                        <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                        <p className="text-brand-purple text-sm font-semibold mt-0.5">{member.role || member.designation}</p>
                        {member.branch && (
                          <p className="text-xs text-muted-foreground mt-1">{member.branch}</p>
                        )}
                        {(member.expertise || member.bio) && (
                          <div className="mt-3 pt-3 border-t border-brand-purple/10">
                            <p className="text-xs text-muted-foreground">{member.expertise || member.bio}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.3} className="mt-10 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Want to join our team? We are always looking for passionate educators.
            </p>
            <a href="https://wa.me/919768100649?text=Hi%2C%20I%20am%20interested%20in%20teaching%20at%20Impact%20Computers" target="_blank" rel="noopener noreferrer">
              <Button className="bg-brand-purple text-white hover:bg-brand-purple-dark font-bold transition-all">
                Contact Us <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
