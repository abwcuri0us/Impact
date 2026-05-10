'use client';

import Link from 'next/link';
import {
  Camera, Award, Users, Video,
  ArrowRight, MapPin
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FadeIn from '@/components/shared/FadeIn';

const gallerySections = [
  {
    href: '/gallery/photos',
    icon: Camera,
    title: 'Photos',
    desc: 'Explore our modern classrooms, computer labs, training sessions, and institute infrastructure across all 4 branches.',
    color: 'from-brand-purple to-brand-purple-dark',
  },
  {
    href: '/gallery/certificates',
    icon: Award,
    title: 'Certificates',
    desc: 'View the government-recognized certificates awarded to our students including MS-CIT, Tally, Advanced Excel, and more.',
    color: 'from-brand-yellow-dark to-brand-yellow',
  },
  {
    href: '/gallery/faculty',
    icon: Users,
    title: 'Faculty Members',
    desc: 'Meet our experienced and certified trainers who make complex topics simple and guide students toward success.',
    color: 'from-brand-purple-light to-brand-purple',
  },
  {
    href: '/gallery/videos',
    icon: Video,
    title: 'Videos',
    desc: 'Watch institute tours, student success stories, course demos, and event highlights from Impact Computers.',
    color: 'from-brand-yellow to-brand-yellow-dark',
  },
];

export default function GalleryPage() {
  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      {/* Page Header */}
      <section className="relative gradient-hero py-12 md:py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-80 h-80 bg-brand-yellow rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-brand-purple-light rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Badge className="mb-4 px-4 py-1.5 bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 text-sm font-semibold">
              <Camera className="w-4 h-4 mr-1.5" />
              Gallery
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              A Glimpse of{' '}
              <span className="text-brand-yellow" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>Impact Computers</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Take a virtual tour of our modern training centers, meet our expert faculty, and see our students&apos; achievements.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Gallery Sections Grid */}
      <section className="bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {gallerySections.map((section, index) => (
              <FadeIn key={section.href} delay={index * 0.1}>
                <Link href={section.href} className="group block">
                  <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-brand-purple/10 dark:border-brand-purple/20 bg-white dark:bg-card h-full">
                    {/* Top Gradient Bar */}
                    <div className={`bg-gradient-to-r ${section.color} h-2`} />
                    
                    <div className="p-6 md:p-8">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <section.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl md:text-2xl font-extrabold text-foreground group-hover:text-brand-purple transition-colors">
                              {section.title}
                            </h2>
                          </div>
                          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                            {section.desc}
                          </p>
                          <div className="flex items-center gap-2 text-brand-purple font-semibold text-sm group-hover:gap-3 transition-all">
                            <span>Explore {section.title}</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          {/* Visit CTA */}
          <FadeIn delay={0.4} className="mt-10 md:mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-brand-purple/5 border border-brand-purple/10">
              <MapPin className="w-6 h-6 text-brand-purple flex-shrink-0" />
              <div className="text-center sm:text-left">
                <p className="font-bold text-foreground text-sm">Visit Our Branches</p>
                <p className="text-xs text-muted-foreground">See our world-class facilities in person at any of our 4 branches</p>
              </div>
              <Link href="/contact" className="bg-brand-purple text-white hover:bg-brand-purple-dark px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex-shrink-0">
                View Locations
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
