'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import FadeIn from '@/components/shared/FadeIn';
import SectionHeading from '@/components/shared/SectionHeading';

export default function TestimonialsPage() {
  const testimonials = useMemo(() => [
    {
      name: 'Priya Sharma',
      role: 'MS-CIT Student',
      text: 'Impact Computers changed my career completely! After completing MS-CIT, I got a government job. The practical training approach here is amazing. The teachers are so patient and supportive.',
      rating: 5,
    },
    {
      name: 'Rajesh Patil',
      role: 'Tally Student',
      text: 'I was a beginner with zero accounting knowledge. After the Advanced Tally course, I am now working as an accountant in a reputed firm. Best decision of my life to join Impact Computers.',
      rating: 5,
    },
    {
      name: 'Sneha Kulkarni',
      role: 'Advanced Excel Student',
      text: 'The Advanced Excel course helped me automate my daily tasks at office. My efficiency improved by 10x! The practical examples and real-world projects were incredibly useful.',
      rating: 5,
    },
    {
      name: 'Amit Deshmukh',
      role: 'CAO Student',
      text: 'I enrolled in CAO course after my B.Com graduation. The comprehensive training in Tally, Excel, and accounting helped me crack my first interview. Thank you Impact Computers!',
      rating: 5,
    },
  ], []);

  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      <section className="py-10 md:py-16 lg:py-24 bg-gradient-to-b from-white to-brand-yellow/5 dark:from-[#0f0a1a] dark:to-brand-yellow/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Student Success Stories"
            title="What Our Students Say"
            subtitle="Real stories from real students who transformed their careers through our training programs."
          />

          <motion.div
            className="grid md:grid-cols-2 gap-6 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                }}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Card className="border border-brand-purple/10 dark:border-brand-purple/20 hover:border-brand-purple/20 hover:shadow-lg transition-all duration-300 h-full">
                    <CardContent className="p-6 md:p-8">
                      {/* Stars */}
                      <motion.div
                        className="flex gap-1 mb-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <motion.span
                            key={i}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.35 + i * 0.05, type: 'spring', stiffness: 300, damping: 15 }}
                          >
                            <Star className="w-5 h-5 fill-brand-yellow text-brand-yellow" />
                          </motion.span>
                        ))}
                      </motion.div>

                      {/* Quote */}
                      <p className="text-foreground/80 text-base leading-relaxed mb-6 italic">
                        &ldquo;{testimonial.text}&rdquo;
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3 pt-4 border-t border-brand-purple/10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-purple-dark flex items-center justify-center text-white font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
