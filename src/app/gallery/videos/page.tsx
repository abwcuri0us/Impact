'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Video as VideoIcon, Play, ArrowLeft, Youtube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from '@/components/shared/FadeIn';
import VideoPlayer from '@/components/VideoPlayer';
import type { VideoItem as VideoPlayerItem } from '@/components/VideoPlayer';

interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  videoUrl: string;
  videoId: string;
  section: string;
  description: string;
  sortOrder: number;
}

function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  // Reset selected video index when section changes
  useEffect(() => { setSelectedVideoIndex(0); }, [activeSection]);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Close player on ESC key
  useEffect(() => {
    if (!isPlayerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPlayerOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlayerOpen]);

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
        const secs = new Set<string>();
        data.forEach((v: VideoItem) => { if (v.section) secs.add(v.section); });
        setSections(Array.from(secs).sort());
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const filteredVideos = activeSection === 'all' ? videos : videos.filter((v) => v.section === activeSection);

  // Map filtered videos to VideoPlayer format
  const playerVideos: VideoPlayerItem[] = filteredVideos.map((v) => ({
    id: v.id,
    title: v.title,
    youtubeUrl: v.youtubeUrl || undefined,
    videoUrl: v.videoUrl || undefined,
    videoId: v.videoId || undefined,
  }));

  const openPlayer = (index: number) => {
    setSelectedVideoIndex(index);
    setIsPlayerOpen(true);
  };

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
              <VideoIcon className="w-4 h-4 mr-1.5" />
              Videos
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
              Video{' '}
              <span className="text-brand-yellow">Gallery</span>
            </h1>
            <p className="text-white/80 text-base max-w-2xl mx-auto">
              Watch our institute tour, student testimonials, classroom sessions, and special events.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Video Grid */}
      <section className="bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
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
                        activeSection === 'all' ? 'bg-brand-purple text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      All ({videos.length})
                    </button>
                    {sections.map((sec) => (
                      <button key={sec} onClick={() => setActiveSection(sec)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSection === sec ? 'bg-brand-purple text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                        {sec} ({videos.filter((v) => v.section === sec).length})
                      </button>
                    ))}
                  </div>
                </FadeIn>
              )}

              {filteredVideos.length === 0 ? (
                <FadeIn>
                  <div className="text-center py-16">
                    <VideoIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No videos available yet.</p>
                  </div>
                </FadeIn>
              ) : (
                <FadeIn>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    <AnimatePresence mode="popLayout">
                      {filteredVideos.map((video, index) => (
                        <motion.div
                          key={video.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          className="group bg-white dark:bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-brand-purple/10 dark:border-brand-purple/20 overflow-hidden"
                        >
                          <div className="relative aspect-video bg-muted overflow-hidden">
                            <Image
                              src={video.videoId ? getThumbnailUrl(video.videoId) : '/logo-impact-transparent.png'}
                              alt={video.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              loading="lazy"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button
                                onClick={() => openPlayer(index)}
                                className="w-16 h-16 rounded-full bg-brand-purple flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300"
                              >
                                <Play className="w-7 h-7 text-white ml-1" />
                              </button>
                            </div>
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-red-500 text-white text-xs font-bold border-0 gap-1">
                                <Youtube className="w-3 h-3" />Video
                              </Badge>
                            </div>
                            {video.section && video.section !== 'General' && (
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-brand-purple/90 text-white text-[10px] border-0">{video.section}</Badge>
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-brand-purple transition-colors line-clamp-2">{video.title}</h3>
                            {video.description && (
                              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{video.description}</p>
                            )}
                            <div className="mt-3">
                              <button
                                onClick={() => openPlayer(index)}
                                className="inline-flex items-center gap-1.5 text-sm text-brand-purple font-semibold hover:underline"
                              >
                                Watch Now <Play className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              )}

              <FadeIn delay={0.3} className="mt-10">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-brand-purple/5 to-brand-yellow/5 border border-brand-purple/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <VideoIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">Watch More on Instagram</h4>
                      <a href="https://instagram.com/impactcomputersghansoli" target="_blank" rel="noopener noreferrer" className="text-brand-purple font-semibold text-sm hover:underline">
                        @impactcomputersghansoli
                      </a>
                    </div>
                  </div>
                  <div className="hidden md:block w-px h-10 bg-brand-purple/20" />
                  <a href="https://wa.me/919768100649?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Impact%20Computers" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-brand-purple text-white hover:bg-brand-purple-dark font-bold">Contact Us for More Info</Button>
                  </a>
                </div>
              </FadeIn>
            </>
          )}
        </div>
      </section>

      {/* Video Player (fullscreen lightbox) */}
      {isPlayerOpen && (
        <VideoPlayer
          videos={playerVideos}
          startIndex={selectedVideoIndex}
          onClose={() => setIsPlayerOpen(false)}
        />
      )}
    </div>
  );
}
