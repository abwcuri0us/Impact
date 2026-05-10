'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Client error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="mb-6">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="36" stroke="#7C3AED" strokeWidth="2" strokeDasharray="6 4" />
          <text x="40" y="48" textAnchor="middle" fontSize="28" fill="#7C3AED" fontFamily="Georgia, serif">!</text>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
        Oops! Something went wrong
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md text-sm">
        We encountered an unexpected error. Please try refreshing the page.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl bg-brand-purple text-white font-bold text-sm hover:bg-brand-purple-dark transition-colors shadow-md"
        >
          Try Again
        </button>
        <a
          href="/"
          className="px-6 py-2.5 rounded-xl border-2 border-brand-purple text-brand-purple font-bold text-sm hover:bg-brand-purple hover:text-white transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
