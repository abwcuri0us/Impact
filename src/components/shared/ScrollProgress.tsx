'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const smoothProgress = useSpring(0, { damping: 30, stiffness: 200, mass: 0.5 });

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const rawProgress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
        setProgress(rawProgress);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Update spring target
  useEffect(() => {
    smoothProgress.set(progress);
  }, [progress, smoothProgress]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[9999] origin-left"
      style={{
        scaleX: smoothProgress,
        background: 'linear-gradient(90deg, #7C3AED 0%, #A78BFA 50%, #F59E0B 100%)',
      }}
    />
  );
}
