'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Play, Pause, Maximize, Minimize, Grid3X3, RotateCcw,
} from 'lucide-react';

interface LightboxImage {
  src: string;
  alt?: string;
  title?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function ImageLightbox({
  images,
  open,
  onClose,
  initialIndex = 0,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const img = images[currentIndex];

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setTranslate({ x: 0, y: 0 });
      setIsSlideshow(false);
      setShowThumbnails(false);
    }
  }, [open, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          navigatePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateNext();
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'g':
          e.preventDefault();
          setShowThumbnails((s) => !s);
          break;
        case 's':
          e.preventDefault();
          setIsSlideshow((s) => !s);
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoom((z) => Math.min(z + 0.25, 5));
          break;
        case '-':
          e.preventDefault();
          setZoom((z) => Math.max(z - 0.25, 0.5));
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Slideshow timer
  useEffect(() => {
    if (!isSlideshow || !open) return;
    const timer = setInterval(() => navigateNext(), 3000);
    return () => clearInterval(timer);
  }, [isSlideshow, open]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const navigatePrev = useCallback(() => {
    resetZoom();
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const navigateNext = useCallback(() => {
    resetZoom();
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!img) return;
    const link = document.createElement('a');
    link.href = img.src;
    link.download = img.title || 'image';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [img]);

  const handleClose = useCallback(() => {
    setIsSlideshow(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onClose();
  }, [onClose]);

  // Mouse drag for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(5, z - e.deltaY * 0.001)));
  }, []);

  // Touch handling for swipe + pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStartRef.current && zoom <= 1) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) > 50 || Math.abs(dy) > 50) {
        if (Math.abs(dx) > Math.abs(dy)) {
          dx > 0 ? navigateNext() : navigatePrev();
        }
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  if (!open || !img) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[99999] bg-black/95 flex flex-col"
        ref={containerRef}
        onClick={handleClose}
      >
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-black/50 flex-shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <span className="text-white/70 text-xs font-medium min-w-[60px]">
              {currentIndex + 1} / {images.length}
            </span>
            {img.title && (
              <span className="text-white/90 text-sm font-medium truncate max-w-[200px] sm:max-w-[400px]">
                — {img.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 5))}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            {zoom !== 1 && (
              <button
                onClick={resetZoom}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Reset Zoom (0)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <div className="w-px h-5 bg-white/20 mx-1" />
            <button
              onClick={() => setIsSlideshow((s) => !s)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isSlideshow ? 'bg-brand-yellow text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              title="Slideshow (S)"
            >
              {isSlideshow ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowThumbnails((s) => !s)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${showThumbnails ? 'bg-brand-purple text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              title="Grid View (G)"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors ml-1"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={navigatePrev}
              className="absolute left-2 sm:left-4 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
              title="Previous (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image Container */}
          <div
            className="flex items-center justify-center overflow-hidden cursor-grab select-none"
            style={{ width: '100%', height: '100%' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.img
              key={img.src}
              src={img.src}
              alt={img.alt || img.title || ''}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                scale: zoom,
                x: translate.x,
                y: translate.y,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={navigateNext}
              className="absolute right-2 sm:right-4 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
              title="Next (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Zoom indicator */}
          {zoom !== 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
              {Math.round(zoom * 100)}%
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        <AnimatePresence>
          {showThumbnails && images.length > 1 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 80, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-black/80 overflow-hidden flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-1.5 h-full overflow-x-auto px-3 py-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.3) transparent' }}>
                {images.map((image, index) => (
                  <button
                    key={image.src}
                    onClick={() => {
                      setCurrentIndex(index);
                      resetZoom();
                    }}
                    className={`relative flex-shrink-0 h-full rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? 'border-brand-yellow shadow-lg shadow-brand-yellow/30'
                        : 'border-transparent hover:border-white/40'
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.title || `Photo ${index + 1}`}
                      className="h-full w-auto object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
