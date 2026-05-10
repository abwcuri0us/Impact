'use client';

import { motion } from 'framer-motion';
import { Monitor, BookOpen, GlassWater, Presentation } from 'lucide-react';
import FadeIn from '@/components/shared/FadeIn';
import SectionHeading from '@/components/shared/SectionHeading';

export default function FacilitiesPage() {
  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      <section className="py-10 md:py-16 lg:py-24 bg-gradient-to-b from-white to-brand-yellow/5 dark:from-background dark:to-brand-yellow/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Our Facilities"
            title="Modern Facilities for Better Learning"
            subtitle="Every branch is equipped with modern infrastructure to ensure a comfortable and effective learning experience for all our students."
          />

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {[
              {
                icon: Monitor,
                title: 'Latest Computers',
                description: 'All our branches are equipped with the latest computers with updated software, high-speed internet, and modern peripherals. Every student gets their own dedicated system during practical sessions for hands-on learning.',
              },
              {
                icon: Presentation,
                title: 'Projector & Smart Classes',
                description: 'Our classrooms feature high-quality projectors and smart display boards for interactive teaching. Faculty use presentations, live demos, and video tutorials to make complex topics easy to understand.',
              },
              {
                icon: BookOpen,
                title: 'Whiteboard Teaching',
                description: 'Traditional whiteboard teaching combined with modern methods ensures that concepts are explained step-by-step. Our instructors believe in writing out every formula and concept for better retention.',
              },
              {
                icon: GlassWater,
                title: 'Cold Drinking Water',
                description: 'Purified cold drinking water is available at all our branches through advanced RO water purifiers. We ensure a comfortable learning environment where students can stay hydrated and focused throughout their sessions.',
              },
            ].map((facility) => (
              <motion.div
                key={facility.title}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                }}
              >
                <div className="group text-center p-6 md:p-8 rounded-2xl bg-white dark:bg-card border border-brand-purple/10 dark:border-brand-purple/20 hover:border-brand-yellow/40 hover:shadow-xl transition-all duration-300 h-full">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-purple-dark flex items-center justify-center mx-auto mb-5 shadow-lg"
                    whileHover={{ scale: 1.15, rotate: 6, y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <facility.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{facility.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{facility.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
