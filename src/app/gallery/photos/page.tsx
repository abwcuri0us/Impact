'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, MapPin, ArrowLeft, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from '@/components/shared/FadeIn';
import ImageLightbox from '@/components/shared/ImageLightbox';

interface Photo {
  id: string;
  title: string;
  caption: string;
  section: string;
  imageUrl: string;
  sortOrder: number;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
        const secs = new Set<string>();
        data.forEach((p: Photo) => { if (p.section) secs.add(p.section); });
        setSections(Array.from(secs).sort());
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const filteredPhotos = activeSection === 'all' ? photos : photos.filter((p) => p.section === activeSection);

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
              <Camera className="w-4 h-4 mr-1.5" />
              Photos
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
              Our Classrooms &{' '}
              <span className="text-brand-yellow">Training Centers</span>
            </h1>
            <p className="text-white/80 text-base max-w-2xl mx-auto">
              Every branch is designed to provide a comfortable and professional learning environment with modern infrastructure.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-48 md:h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Section Tabs */}
              {sections.length > 0 && (
                <FadeIn className="mb-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveSection('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeSection === 'all'
                          ? 'bg-brand-purple text-white shadow-md'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      All ({photos.length})
                    </button>
                    {sections.map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setActiveSection(sec)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          activeSection === sec
                            ? 'bg-brand-purple text-white shadow-md'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {sec} ({photos.filter((p) => p.section === sec).length})
                      </button>
                    ))}
                  </div>
                </FadeIn>
              )}

              {filteredPhotos.length === 0 ? (
                <FadeIn>
                  <div className="text-center py-16">
                    <Camera className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No photos available yet.</p>
                  </div>
                </FadeIn>
              ) : (
                <FadeIn>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                    <AnimatePresence mode="popLayout">
                      {filteredPhotos.map((photo, index) => (
                        <motion.div
                          key={photo.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.03 }}
                          className={`group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                          onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                        >
                          <div className={`relative overflow-hidden ${index === 0 ? 'h-48 md:h-full min-h-[300px]' : 'h-48 md:h-64'}`}>
                            <Image
                              src={photo.imageUrl}
                              alt={photo.title || photo.caption || 'Gallery photo'}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              loading="lazy"
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-purple-deep/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                              <p className="text-white text-sm font-semibold truncate">{photo.title || photo.caption || ''}</p>
                              {photo.section && (
                                <Badge className="mt-1 text-[10px] bg-white/20 text-white border-0">{photo.section}</Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              )}

              <FadeIn delay={0.3} className="mt-10 text-center">
                <Link href="/contact">
                  <Button variant="outline" className="border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white font-bold transition-all">
                    <MapPin className="w-4 h-4 mr-2" />
                    Visit Our Branches to See in Person
                  </Button>
                </Link>
              </FadeIn>
            </>
          )}
        </div>
      </section>

      {/* Full Image Lightbox */}
      <ImageLightbox
        images={filteredPhotos.map((p) => ({ src: p.imageUrl, alt: p.title || p.caption, title: p.title || p.caption }))}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
    </div>
  );
}
