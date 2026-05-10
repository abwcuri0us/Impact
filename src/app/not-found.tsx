'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-lg mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* 404 Number */}
        <div className="mb-6">
          <motion.span
            className="text-8xl sm:text-9xl font-black gradient-purple-text leading-none inline-block"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            404
          </motion.span>
        </div>

        {/* Message */}
        <motion.h1
          className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          Page Not Found
        </motion.h1>
        <motion.p
          className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          Sorry, the page you are looking for doesn&apos;t exist or has been moved. Let us help you find what you need.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Link href="/">
            <Button size="lg" className="gap-2 bg-brand-purple hover:bg-brand-purple-dark font-semibold w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Go to Homepage
            </Button>
          </Link>
          <Link href="/courses">
            <Button size="lg" variant="outline" className="gap-2 border-brand-purple text-brand-purple hover:bg-brand-purple/5 font-semibold w-full sm:w-auto">
              <Search className="w-4 h-4" />
              Browse Courses
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              Contact Us
            </Button>
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          {[
            { label: 'About Us', href: '/about' },
            { label: 'Courses', href: '/courses' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'Enquiry', href: '/enquiry' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-brand-purple transition-colors py-2 px-3 rounded-lg hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
