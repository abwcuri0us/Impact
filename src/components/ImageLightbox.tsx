"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Maximize,
  X,
  ChevronLeft,
  ChevronRight,
  Minimize,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LightboxImage {
  src: string;
  alt?: string;
  title?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;
const CONTROLS_HIDE_DELAY = 3000; // ms
const SWIPE_THRESHOLD = 50; // px

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  /* ---- zoom / pan state ---- */
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  /* ---- swipe state ---- */
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeEndX = useRef<number | null>(null);
  const isSwiping = useRef(false);

  /* ---- controls visibility ---- */
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- fullscreen ---- */
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ---- derived ---- */
  const currentImage = images[currentIndex] as LightboxImage | undefined;
  const total = images.length;
  const isZoomed = zoom > MIN_ZOOM;

  /* ================================================================ */
  /*  Adjusting state during render (React 19 pattern)                  */
  /*  https://react.dev/learn/you-might-not-need-an-effect              */
  /* ================================================================ */

  // Track previous props to reset view when image index changes
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (prevIndex !== currentIndex) {
    setPrevIndex(currentIndex);
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
  }

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setControlsVisible(true);
      setZoom(MIN_ZOOM);
      setPan({ x: 0, y: 0 });
    }
  }

  /* ================================================================ */
  /*  Helpers                                                          */
  /* ================================================================ */

  const resetView = useCallback(() => {
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, +(prev + ZOOM_STEP).toFixed(1)));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const next = +(prev - ZOOM_STEP).toFixed(1);
      if (next <= MIN_ZOOM) {
        setPan({ x: 0, y: 0 });
        return MIN_ZOOM;
      }
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    resetView();
  }, [resetView]);

  const navigate = useCallback(
    (dir: "prev" | "next") => {
      if (!onNavigate || isZoomed) return;
      const next =
        dir === "next"
          ? (currentIndex + 1) % total
          : (currentIndex - 1 + total) % total;
      resetView();
      onNavigate(next);
    },
    [onNavigate, currentIndex, total, isZoomed, resetView],
  );

  const handleDownload = useCallback(async () => {
    if (!currentImage) return;
    try {
      const response = await fetch(currentImage.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentImage.title ?? currentImage.alt ?? "image";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open image in new tab
      window.open(currentImage.src, "_blank");
    }
  }, [currentImage]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported or denied
    }
  }, []);

  /* ================================================================ */
  /*  Effects (subscriptions only – no synchronous setState)            */
  /* ================================================================ */

  // Listen for fullscreen changes (external subscription)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  /* ================================================================ */
  /*  Keyboard                                                         */
  /* ================================================================ */

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          navigate("prev");
          break;
        case "ArrowRight":
          navigate("next");
          break;
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0":
          e.preventDefault();
          handleResetZoom();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, navigate, handleZoomIn, handleZoomOut, handleResetZoom]);

  /* ================================================================ */
  /*  Pointer (mouse + pen) drag for pan                               */
  /* ================================================================ */

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isZoomed) return;
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [isZoomed, pan],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({
        x: dragStart.current.panX + dx,
        y: dragStart.current.panY + dy,
      });
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /* ================================================================ */
  /*  Touch swipe for navigation                                       */
  /* ================================================================ */

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (isZoomed) return;
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      swipeEndX.current = null;
      isSwiping.current = false;
    },
    [isZoomed],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (isZoomed || touchStartX.current === null) return;
      const touch = e.touches[0];
      swipeEndX.current = touch.clientX;
      const dy = touch.clientY - (touchStartY.current ?? 0);

      if (!isSwiping.current) {
        const dx = touch.clientX - touchStartX.current;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
          isSwiping.current = true;
        }
      }

      if (isSwiping.current) {
        e.preventDefault(); // Prevent scroll during swipe
      }
    },
    [isZoomed],
  );

  const handleTouchEnd = useCallback(() => {
    if (isZoomed || touchStartX.current === null || swipeEndX.current === null) {
      touchStartX.current = null;
      swipeEndX.current = null;
      return;
    }

    if (isSwiping.current) {
      const dx = swipeEndX.current - touchStartX.current;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        navigate(dx > 0 ? "prev" : "next");
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    swipeEndX.current = null;
    isSwiping.current = false;
  }, [isZoomed, navigate]);

  /* ================================================================ */
  /*  Click backdrop to close                                          */
  /* ================================================================ */

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          onClick={handleBackdropClick}
          onMouseMove={showControls}
          onTouchStart={showControls}
        >
          {/* ---- Image container ---- */}
          <motion.div
            className="relative flex items-center justify-center w-full h-full overflow-hidden"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div
              className={cn(
                "relative flex items-center justify-center max-w-full max-h-full p-4 sm:p-8",
                isZoomed && isDragging ? "cursor-grabbing" : isZoomed ? "cursor-grab" : "cursor-default",
              )}
              style={{
                touchAction: isZoomed ? "none" : "pan-y",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={currentImage.src}
                alt={currentImage.alt ?? currentImage.title ?? ""}
                className="max-w-full max-h-full object-contain rounded-sm pointer-events-none"
                draggable={false}
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transition: isDragging ? "none" : "transform 0.2s ease-out",
                  userSelect: "none",
                  WebkitUserDrag: "none",
                }}
              />
            </div>
          </motion.div>

          {/* ---- Controls overlay ---- */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: controlsVisible ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ---- Close button ---- */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="pointer-events-auto absolute top-3 right-3 sm:top-5 sm:right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            {/* ---- Image counter ---- */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm tabular-nums">
              {currentIndex + 1} / {total}
            </div>

            {/* ---- Previous button ---- */}
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("prev");
                }}
                disabled={isZoomed}
                className={cn(
                  "pointer-events-auto absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                  isZoomed && "opacity-30 pointer-events-none",
                )}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* ---- Next button ---- */}
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("next");
                }}
                disabled={isZoomed}
                className={cn(
                  "pointer-events-auto absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                  isZoomed && "opacity-30 pointer-events-none",
                )}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* ---- Bottom bar: title + action buttons ---- */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center gap-3 pb-4 sm:pb-6 pointer-events-none">
              {/* Title */}
              {(currentImage.title || currentImage.alt) && (
                <div className="pointer-events-auto max-w-[80%] truncate rounded-lg bg-white/10 px-4 py-2 text-center text-sm sm:text-base text-white backdrop-blur-sm">
                  {currentImage.title || currentImage.alt}
                </div>
              )}

              {/* Action buttons */}
              <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 p-1.5 backdrop-blur-sm">
                {/* Zoom out */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                  disabled={zoom <= MIN_ZOOM}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                    zoom <= MIN_ZOOM && "opacity-30",
                  )}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>

                {/* Zoom indicator */}
                <span className="min-w-[3rem] text-center text-xs font-medium text-white/80 tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>

                {/* Zoom in */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                  disabled={zoom >= MAX_ZOOM}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                    zoom >= MAX_ZOOM && "opacity-30",
                  )}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>

                {/* Divider */}
                <div className="mx-1 h-5 w-px bg-white/20" />

                {/* Reset zoom */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetZoom();
                  }}
                  disabled={zoom === MIN_ZOOM && pan.x === 0 && pan.y === 0}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                    zoom === MIN_ZOOM && pan.x === 0 && pan.y === 0 && "opacity-30",
                  )}
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Divider */}
                <div className="mx-1 h-5 w-px bg-white/20" />

                {/* Download */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="Download image"
                >
                  <Download className="h-4 w-4" />
                </button>

                {/* Fullscreen */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
