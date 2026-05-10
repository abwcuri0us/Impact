'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function CountUp({
  end,
  start = 0,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(start);
  const hasAnimatedRef = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);

  const animate = useCallback(() => {
    if (hasAnimatedRef.current) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(end);
      hasAnimatedRef.current = true;
      return;
    }

    hasAnimatedRef.current = true;
    const startTime = performance.now();
    const range = end - start;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      const current = start + range * eased;

      setDisplayValue(current);

      if (progressRatio < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, [end, start, duration]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  // Also try animating after a short delay in case IntersectionObserver misses it
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAnimatedRef.current && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          animate();
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [animate]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
