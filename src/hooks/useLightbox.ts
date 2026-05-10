"use client";

import { useState, useCallback } from "react";

interface UseLightboxOptions {
  /** Total number of images in the gallery (for wrap-around navigation) */
  totalCount?: number;
}

interface UseLightboxReturn {
  isOpen: boolean;
  currentIndex: number;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  goToNext: () => void;
  goToPrev: () => void;
  goToIndex: (index: number) => void;
}

export function useLightbox(options?: UseLightboxOptions): UseLightboxReturn {
  const { totalCount = 0 } = options ?? {};

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      if (totalCount > 0) {
        // Clamp to valid range, wrapping around
        const wrapped = ((index % totalCount) + totalCount) % totalCount;
        setCurrentIndex(wrapped);
      } else {
        setCurrentIndex(Math.max(0, index));
      }
    },
    [totalCount],
  );

  const goToNext = useCallback(() => {
    goToIndex(currentIndex + 1);
  }, [currentIndex, goToIndex]);

  const goToPrev = useCallback(() => {
    goToIndex(currentIndex - 1);
  }, [currentIndex, goToIndex]);

  return {
    isOpen,
    currentIndex,
    openLightbox,
    closeLightbox,
    goToNext,
    goToPrev,
    goToIndex,
  };
}
