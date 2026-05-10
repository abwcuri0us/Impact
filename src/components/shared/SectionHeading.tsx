'use client';

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import FadeIn from './FadeIn';

const SectionHeading = memo(function SectionHeading({ badge, title, subtitle, light = false }: {
  badge: React.ReactNode;
  title: string;
  subtitle: string;
  light?: boolean;
}) {
  return (
    <FadeIn className="text-center mb-12 md:mb-16">
      <Badge className="mb-4 px-4 py-1.5 text-sm font-semibold bg-brand-yellow text-brand-purple-deep hover:bg-brand-yellow-light border-0">
        {badge}
      </Badge>
      <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 leading-tight ${light ? 'text-white' : 'text-foreground'}`}>
        {title}
      </h2>
      <p className={`text-sm sm:text-base md:text-xl max-w-2xl mx-auto px-2 ${light ? 'text-white/80' : 'text-muted-foreground'}`}>
        {subtitle}
      </p>
    </FadeIn>
  );
});

export default SectionHeading;
