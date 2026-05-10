'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FadeIn from '@/components/shared/FadeIn';

interface CourseOption {
  value: string;
  label: string;
}

export default function EnquiryPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', course: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [courses, setCourses] = useState<CourseOption[]>([]);

  // Fetch available courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const options = data.map((c: { title: string; slug: string }) => ({
              value: c.title,
              label: c.title,
            }));
            setCourses(options);
          }
        }
      } catch {
        // Use default courses
      }
    };
    fetchCourses();
  }, []);

  const courseOptions: CourseOption[] = courses.length > 0
    ? courses
    : [
        { value: 'MS-CIT (Government Certified)', label: 'MS-CIT (Government Certified)' },
        { value: 'Advanced Tally Prime', label: 'Advanced Tally Prime' },
        { value: 'Advanced Excel', label: 'Advanced Excel' },
        { value: 'Python & MySQL', label: 'Python & MySQL' },
        { value: 'DTP (DeskTop Publishing)', label: 'DTP (DeskTop Publishing)' },
        { value: 'Computer Hardware & Networking', label: 'Computer Hardware & Networking' },
        { value: 'CAO (Computer Accountancy)', label: 'CAO (Computer Accountancy)' },
        { value: 'Web Designing', label: 'Web Designing' },
        { value: 'C/C++ Programming', label: 'C/C++ Programming' },
        { value: 'Other / Not Sure', label: 'Other / Not Sure' },
      ];

  const handleSubmit = useCallback(async (e: React.FormEvent, source: 'website' | 'whatsapp') => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    if (!formData.name.trim() || !formData.phone.trim()) {
      setSubmitError('Please enter your name and phone number.');
      setSubmitting(false);
      return;
    }

    // Validate phone
    const phoneClean = (formData.phone || '').replace(/[\s\-\+\(\)]/g, '');
    if (phoneClean.length < 10) {
      setSubmitError('Please enter a valid phone number.');
      setSubmitting(false);
      return;
    }

    // Validate email if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setSubmitError('Please enter a valid email address.');
        setSubmitting(false);
        return;
      }
    }

    try {
      // Save to database
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim(),
          course: formData.course || null,
          message: formData.message.trim() || null,
          source,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit enquiry');
      }
    } catch (err) {
      console.error('DB save failed:', err);
      if (source === 'website') {
        // For website-only submission, show error if DB save fails
        setSubmitError('Failed to submit enquiry. Please try again or send via WhatsApp.');
        setSubmitting(false);
        return;
      }
      // For WhatsApp, continue even if DB save fails
    }

    // Only open WhatsApp if source is whatsapp
    if (source === 'whatsapp') {
      const message = `Hello Impact Computers! I'm interested in enrolling.\n\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email || 'N/A'}\nCourse: ${formData.course || 'Not specified'}\nMessage: ${formData.message || 'No message'}`;
      const whatsappUrl = `https://wa.me/919768100649?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }

    setFormSubmitted(true);
    setSubmitting(false);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', email: '', phone: '', course: '', message: '' });
    }, 4000);
  }, [formData]);

  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      <section className="py-10 md:py-16 lg:py-24 bg-gradient-to-b from-brand-purple/5 to-white dark:from-card dark:to-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: Strong CTA */}
            <FadeIn direction="left">
              <div className="sticky top-28">
                <motion.div
                  animate={{ x: [0, -3, 3, -2, 2, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                >
                  <Badge className="mb-4 px-4 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 border-0 text-sm font-semibold">
                    Limited Seats Available
                  </Badge>
                </motion.div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-6 text-foreground leading-tight">
                  Don&apos;t Fall for Fake Courses &mdash;{' '}
                  <span className="gradient-purple-text">Choose Certified Training</span>
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg mb-6 leading-relaxed">
                  Many institutes promise jobs but deliver nothing. Impact Computers is a government-authorized center with 25+ years of proven track record. Your certificate means something here.
                </p>
                <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
                  New batches starting soon. Secure your seat now and take the first step towards a successful career in computers. Walk in for a free demo class today!
                </p>

                <motion.div
                  className="space-y-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.1 } },
                  }}
                >
                  {[
                    'Free Career Counseling Session',
                    'Free Demo Class Before Enrollment',
                    'Flexible Batch Timings (Morning/Evening)',
                    'Easy EMI Payment Options Available',
                  ].map((text) => (
                    <motion.div
                      key={text}
                      className="flex items-center gap-3"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
                      }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-foreground font-medium">{text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </FadeIn>

            {/* Right: Enquiry Form */}
            <FadeIn direction="right" delay={0.2}>
              <Card className="border-0 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-brand-purple to-brand-purple-dark p-6 text-white">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Quick Enquiry Form
                  </h3>
                  <p className="text-white/70 text-sm mt-1">Fill in your details and we&apos;ll call you back within 24 hours</p>
                </div>
                <CardContent className="p-6 md:p-8">
                  {formSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="text-xl font-bold text-foreground mb-2">Thank You, {formData.name}!</h4>
                      <p className="text-muted-foreground">Your enquiry has been submitted successfully. Our team will contact you within 24 hours.</p>
                    </div>
                  ) : (
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(e, 'website'); }}>
                      <div>
                        <Label className="block text-sm font-semibold text-foreground mb-1.5">Full Name *</Label>
                        <Input
                          required
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 border-brand-purple/20 focus:border-brand-purple"
                          autoComplete="name"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="block text-sm font-semibold text-foreground mb-1.5">Phone Number *</Label>
                          <Input
                            required
                            type="tel"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-12 border-brand-purple/20 focus:border-brand-purple"
                            autoComplete="tel"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-semibold text-foreground mb-1.5">Email (Optional)</Label>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-12 border-brand-purple/20 focus:border-brand-purple"
                            autoComplete="email"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="block text-sm font-semibold text-foreground mb-1.5">Course Interested In *</Label>
                        <select
                          required
                          value={formData.course}
                          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                          className="w-full h-12 rounded-md border border-brand-purple/20 bg-background px-3 py-2 text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
                        >
                          <option value="">Select a course</option>
                          {courseOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="block text-sm font-semibold text-foreground mb-1.5">Message (Optional)</Label>
                        <Textarea
                          placeholder="Any specific questions or requirements?"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="border-brand-purple/20 focus:border-brand-purple min-h-[80px]"
                        />
                      </div>

                      {submitError && (
                        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg px-3 py-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {submitError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                          type="button"
                          disabled={submitting}
                          onClick={(e) => handleSubmit(e, 'whatsapp')}
                          className="h-12 bg-green-500 hover:bg-green-600 text-white font-bold text-base transition-all shadow-lg hover:shadow-xl"
                        >
                          {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <MessageCircle className="w-5 h-5 mr-2" />
                              Send via WhatsApp
                            </>
                          )}
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          onClick={(e) => handleSubmit(e, 'website')}
                          className="h-12 bg-brand-purple hover:bg-brand-purple-dark text-white font-bold text-base transition-all shadow-lg hover:shadow-xl"
                        >
                          {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <BookOpen className="w-5 h-5 mr-2" />
                              Submit Enquiry
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        By submitting, you agree to be contacted by our team regarding course information.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
