'use client';
import { useRef, useCallback, useEffect, type MouseEvent } from 'react';

interface TiltConfig {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  glare?: boolean;
  maxGlare?: number;
}

export function use3DTilt(config: TiltConfig = {}) {
  const {
    maxTilt = 15,
    perspective = 1000,
    scale = 1.0,
    speed = 400,
    glare = true,
    maxGlare = 0.3,
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const currentTransform = useRef({ rotateX: 0, rotateY: 0 });

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    currentTransform.current = { rotateX, rotateY };

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      if (!inner) return;
      inner.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      inner.style.transition = `transform 0.08s ease-out`;

      if (glare) {
        const glareEl = container.querySelector('[data-tilt-glare]') as HTMLElement;
        if (glareEl) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glareEl.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${maxGlare}), transparent 60%)`;
          glareEl.style.opacity = '1';
        }
      }
    });
  }, [maxTilt, perspective, scale, glare, maxGlare]);

  const handleMouseLeave = useCallback(() => {
    const inner = innerRef.current;
    const container = containerRef.current;
    if (!inner || !container) return;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    inner.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    inner.style.transition = `transform 0.4s ease-out`;

    if (glare) {
      const glareEl = container.querySelector('[data-tilt-glare]') as HTMLElement;
      if (glareEl) glareEl.style.opacity = '0';
    }
  }, [perspective, glare]);

  return { ref: containerRef, innerRef, handleMouseMove, handleMouseLeave };
}
