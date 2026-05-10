'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, ChevronRight, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from '@/components/shared/FadeIn';
import ImageLightbox from '@/components/shared/ImageLightbox';

interface Certificate {
  id: string;
  title: string;
  section: string;
  imageUrl: string;
  description: string;
  sortOrder: number;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fetchCertificates = useCallback(async () => {
    try {
      const res = await fetch('/api/certificates');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
        const secs = new Set<string>();
        data.forEach((c: Certificate) => { if (c.section) secs.add(c.section); });
        setSections(Array.from(secs).sort());
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const filteredCerts = activeSection === 'all' ? certificates : certificates.filter((c) => c.section === activeSection);

  // Map filtered certificates to ImageLightbox format
  const lightboxImages = filteredCerts
    .filter((c) => c.imageUrl)
    .map((c) => ({
      src: c.imageUrl,
      alt: c.title,
      title: c.title,
    }));

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
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
              <Award className="w-4 h-4 mr-1.5" />
              Certificates
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
              Certificates &{' '}
              <span className="text-brand-yellow">Achievements</span>
            </h1>
            <p className="text-white/80 text-base max-w-2xl mx-auto">
              Our students receive government-recognized certifications and achieve outstanding results.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Certificates Grid */}
      <section className="bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-2xl" />
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
                      All ({certificates.length})
                    </button>
                    {sections.map((sec) => (
                      <button key={sec} onClick={() => setActiveSection(sec)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSection === sec ? 'bg-brand-purple text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                        {sec} ({certificates.filter((c) => c.section === sec).length})
                      </button>
                    ))}
                  </div>
                </FadeIn>
              )}

              {filteredCerts.length === 0 ? (
                <FadeIn>
                  <div className="text-center py-16">
                    <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No certificates available yet.</p>
                  </div>
                </FadeIn>
              ) : (
                <FadeIn>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                    <AnimatePresence mode="popLayout">
                      {filteredCerts.map((cert, index) => (
                        <motion.div
                          key={cert.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.03 }}
                          className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-brand-purple/10 dark:border-brand-purple/20 cursor-pointer"
                          onClick={() => {
                            if (cert.imageUrl) {
                              // Find index within filtered certs that have images
                              const imageIndex = filteredCerts
                                .slice(0, index + 1)
                                .filter((c) => c.imageUrl).length - 1;
                              openLightbox(Math.max(0, imageIndex));
                            }
                          }}
                        >
                          {cert.imageUrl ? (
                            <div className="aspect-[4/3] overflow-hidden relative">
                              <Image src={cert.imageUrl} alt={cert.title} fill sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                            </div>
                          ) : (
                            <div className="aspect-[4/3] bg-gradient-to-r from-brand-purple to-brand-purple-dark flex items-center justify-center">
                              <Award className="w-12 h-12 text-white/30" />
                            </div>
                          )}
                          <div className="pt-4 px-4 pb-4">
                            <h3 className="text-sm font-bold text-foreground">{cert.title}</h3>
                            {cert.description && (
                              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{cert.description}</p>
                            )}
                            {cert.section && cert.section !== 'General' && (
                              <Badge className="mt-2 text-[10px] bg-brand-purple/10 text-brand-purple border-brand-purple/20">{cert.section}</Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              )}

              <FadeIn delay={0.3} className="mt-10 text-center">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-brand-purple/5 border border-brand-purple/10">
                  <Award className="w-8 h-8 text-brand-purple" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">Government Recognized Certificates</p>
                    <p className="text-xs text-muted-foreground">All our courses offer valid certifications recognized across Maharashtra</p>
                  </div>
                </div>
              </FadeIn>
            </>
          )}
        </div>
      </section>

      {/* Shared ImageLightbox */}
      <ImageLightbox
        images={lightboxImages}
        open={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        initialIndex={selectedImageIndex}
      />
    </div>
  );
}
