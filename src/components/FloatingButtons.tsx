'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, ArrowUp } from 'lucide-react';

export default function FloatingButtons() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 500);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);

  return (
    <>
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919768100649?text=Hi%2C%20I%20want%20to%20know%20about%20your%20computer%20courses"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 md:w-16 md:h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl whatsapp-pulse transition-all duration-300 group floating-safe-bottom"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-white" />
        <span className="absolute right-full mr-3 bg-white text-foreground text-sm font-semibold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
          Chat with us!
        </span>
      </a>

      {/* Call Button (Mobile) */}
      <a
        href="tel:9768100649"
        className="fixed bottom-4 right-[72px] sm:bottom-6 sm:right-24 z-50 w-14 h-14 md:w-16 md:h-16 bg-brand-purple hover:bg-brand-purple-dark rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 lg:hidden floating-safe-bottom"
        aria-label="Call Now"
      >
        <Phone className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </a>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-12 h-12 bg-brand-yellow hover:bg-brand-yellow-light rounded-full flex items-center justify-center shadow-lg transition-all duration-300 floating-safe-bottom"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 text-brand-purple-deep" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
