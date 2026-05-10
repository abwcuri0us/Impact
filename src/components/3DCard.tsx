'use client';

import React from 'react';
import { use3DTilt } from '@/hooks/use-3d-tilt';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  tiltConfig?: {
    maxTilt?: number;
    perspective?: number;
    scale?: number;
    glare?: boolean;
  };
}

export default function Card3D({ children, className = '', tiltConfig }: Card3DProps) {
  const { ref, innerRef, handleMouseMove, handleMouseLeave } = use3DTilt(tiltConfig);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      <div
        ref={innerRef}
        style={{ transformStyle: 'preserve-3d' }}
        className="will-change-transform"
      >
        {children}
      </div>
      <div
        data-tilt-glare
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300 z-10"
      />
    </div>
  );
}
