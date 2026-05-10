'use client';

import { useRef, memo } from 'react';
import { motion, useInView } from 'framer-motion';

const directionMap = {
  up: { y: 30, x: 0, scale: 1 },
  down: { y: -30, x: 0, scale: 1 },
  left: { y: 0, x: 30, scale: 1 },
  right: { y: 0, x: -30, scale: 1 },
  'zoom-in': { y: 0, x: 0, scale: 0.9 },
} as const;

type Direction = keyof typeof directionMap;

const FadeIn = memo(function FadeIn({ children, delay = 0, direction = 'up', className = '' }: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const finalState = { opacity: 1, y: 0, x: 0, scale: 1 };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={isInView ? finalState : undefined}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

export default FadeIn;
