'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Palmtree, ArrowLeft, LayoutGrid, Play, Pause, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from '@/components/shared/FadeIn';
import ImageLightbox from '@/components/ImageLightbox';
import { useLightbox } from '@/hooks/useLightbox';

interface Photo {
  id: string;
  title: string;
  caption: string;
  section: string;
  imageUrl: string;
  sortOrder: number;
}

type LayoutMode = 'grid' | 'slideshow';

const SECTION = 'Picnic / Industrial Visits';

export default function PicnicIndustrialVisitsPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const slideshowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lightbox = useLightbox();

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch(`/api/gallery?section=${encodeURIComponent(SECTION)}`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
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

  // Build lightbox images array
  const lightboxImages = photos.map((p) => ({
    src: p.imageUrl,
    alt: p.title || p.caption || 'Picnic / Industrial Visit photo',
    title: p.title || p.caption || '',
  }));

  // Slideshow controls
  useEffect(() => {
    if (isSlideshowPlaying && layoutMode === 'slideshow' && photos.length > 1) {
      slideshowTimerRef.current = setInterval(() => {
        setSlideshowIndex((prev) => (prev + 1) % photos.length);
      }, 4000);
    } else {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
    }
    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [isSlideshowPlaying, layoutMode, photos.length]);

  const currentSlideshowPhoto = photos[slideshowIndex];

  return (
    <div className="pt-32 md:pt-36">
      {/* Page Header */}
      <section className="relative gradient-hero py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-80 h-80 bg-emerald-400 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-teal-400 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Link href="/gallery" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Gallery
            </Link>
            <div className="text-center mb-4">
              <Badge className="mb-3 px-4 py-1.5 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-sm font-semibold">
                <Palmtree className="w-4 h-4 mr-1.5" />
                Picnic & Industrial Visits
              </Badge>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
                Fun Beyond the{' '}
                <span className="text-emerald-300">Classroom</span>
              </h1>
            </div>
            <p className="text-white/80 text-base max-w-2xl mx-auto text-center">
              From exciting picnics to insightful industrial visits, we believe in learning through real-world experiences and building lasting memories together.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Photo Grid / Slideshow */}
      <section className="bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 md:h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Layout Toggle */}
              <FadeIn className="mb-8">
                <div className="flex items-center justify-end gap-1 bg-muted rounded-lg p-1 w-fit ml-auto">
                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      layoutMode === 'grid' ? 'bg-white text-brand-purple shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Grid
                  </button>
                  <button
                    onClick={() => setLayoutMode('slideshow')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      layoutMode === 'slideshow' ? 'bg-white text-brand-purple shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    Slideshow
                  </button>
                </div>
              </FadeIn>

              {photos.length === 0 ? (
                <FadeIn>
                  <div className="text-center py-16">
                    <Palmtree className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No photos available yet.</p>
                  </div>
                </FadeIn>
              ) : layoutMode === 'grid' ? (
                /* GRID LAYOUT */
                <FadeIn>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                    <AnimatePresence mode="popLayout">
                      {photos.map((photo, index) => (
                        <motion.div
                          key={photo.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.03 }}
                          className={`group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                          onClick={() => lightbox.openLightbox(index)}
                        >
                          <img
                            src={photo.imageUrl}
                            alt={photo.title || photo.caption || 'Picnic / Industrial Visit'}
                            loading="lazy"
                            decoding="async"
                            className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${index === 0 ? 'h-48 md:h-full min-h-[300px]' : 'h-48 md:h-64'}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-purple-deep/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <p className="text-white text-sm font-semibold truncate">{photo.title || photo.caption || ''}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              ) : (
                /* SLIDESHOW LAYOUT */
                <FadeIn>
                  <div className="relative w-full max-w-4xl mx-auto">
                    {/* Main Slideshow Image */}
                    <div className="relative aspect-video md:aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl bg-muted">
                      <AnimatePresence mode="wait">
                        {currentSlideshowPhoto && (
                          <motion.img
                            key={currentSlideshowPhoto.id}
                            src={currentSlideshowPhoto.imageUrl}
                            alt={currentSlideshowPhoto.title || currentSlideshowPhoto.caption || 'Gallery photo'}
                            className="w-full h-full object-contain"
                            initial={{ opacity: 0, scale: 1.02 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => lightbox.openLightbox(slideshowIndex)}
                          />
                        )}
                      </AnimatePresence>

                      {/* Play/Pause overlay */}
                      <button
                        onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                        aria-label={isSlideshowPlaying ? 'Pause slideshow' : 'Play slideshow'}
                      >
                        {isSlideshowPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>

                      {/* Prev/Next buttons */}
                      {photos.length > 1 && (
                        <>
                          <button
                            onClick={() => { setSlideshowIndex((prev) => (prev - 1 + photos.length) % photos.length); }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                            aria-label="Previous"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => { setSlideshowIndex((prev) => (prev + 1) % photos.length); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                            aria-label="Next"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white text-sm font-semibold truncate">
                          {currentSlideshowPhoto?.title || currentSlideshowPhoto?.caption || ''}
                        </p>
                      </div>
                    </div>

                    {/* Thumbnail strip */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          onClick={() => { setSlideshowIndex(index); setIsSlideshowPlaying(false); }}
                          className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === slideshowIndex ? 'border-emerald-500 shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={photo.imageUrl} alt={photo.title || ''} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    {/* Counter */}
                    <p className="text-center text-sm text-muted-foreground mt-3">
                      {slideshowIndex + 1} of {photos.length}
                    </p>
                  </div>
                </FadeIn>
              )}

              <FadeIn delay={0.3} className="mt-10 text-center">
                <Link href="/contact">
                  <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold transition-all">
                    <MapPin className="w-4 h-4 mr-2" />
                    Visit Our Branches
                  </Button>
                </Link>
              </FadeIn>
            </>
          )}
        </div>
      </section>

      {/* ImageLightbox */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightbox.currentIndex}
        isOpen={lightbox.isOpen}
        onClose={lightbox.closeLightbox}
        onNavigate={lightbox.goToIndex}
      />
    </div>
  );
}
