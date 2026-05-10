'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Monitor, Briefcase, Users, UserCheck } from 'lucide-react';
import FadeIn from '@/components/shared/FadeIn';
import SectionHeading from '@/components/shared/SectionHeading';

export default function WhyUsPage() {
  const whyUsFeatures = useMemo(() => [
    {
      icon: Shield,
      title: 'Government Authorized',
      description: 'Official MS-CIT training center authorized by Maharashtra Knowledge Corporation Limited (MKCL). Your certification carries real value.',
    },
    {
      icon: Clock,
      title: '25+ Years of Trust',
      description: 'Serving Ghansoli and Navi Mumbai since 1997. Over two decades of successfully training thousands of students in computer education.',
    },
    {
      icon: Monitor,
      title: 'Practical Training',
      description: 'Hands-on learning with real computers, live projects, and practical exams. We believe in doing, not just watching lectures.',
    },
    {
      icon: Briefcase,
      title: 'Job-Oriented Courses',
      description: 'Every course is designed to make you employable. Our students work in top companies, government offices, and run their own businesses.',
    },
    {
      icon: Users,
      title: 'Small Batch Sizes',
      description: 'Personal attention with limited students per batch. Get your doubts cleared instantly and learn at your own comfortable pace.',
    },
    {
      icon: UserCheck,
      title: 'Expert Faculty',
      description: 'Experienced and certified trainers who make complex topics simple. Our teachers are passionate about student success.',
    },
  ], []);

  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      <section className="py-10 md:py-16 lg:py-24 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Why Choose Us"
            title="Why Students Trust Impact Computers"
            subtitle="With over 25 years of excellence, here's what makes us the preferred choice for computer education across Ghansoli and Koparkhairne."
          />

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {whyUsFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group relative p-6 rounded-2xl border border-brand-purple/10 dark:border-brand-purple/20 hover:border-brand-purple/30 bg-gradient-to-br from-white to-purple-50/30 dark:from-card dark:to-purple-900/30 hover:from-purple-50/50 hover:to-brand-yellow/5 transition-all duration-300 hover:shadow-lg h-full"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-purple-dark flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
