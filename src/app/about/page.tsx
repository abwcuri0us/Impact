'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Award, Shield, Users, TrendingUp, Target, Eye, Lightbulb,
  BookOpen, GraduationCap, Heart, Compass, ChevronRight, Star, Quote
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import FadeIn from '@/components/shared/FadeIn';
import CountUp from '@/components/shared/CountUp';
import SectionHeading from '@/components/shared/SectionHeading';
import PageTransition from '@/components/PageTransition';
import TextReveal from '@/components/TextReveal';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('introduction');

  const tabs = [
    { id: 'introduction', label: 'Introduction', icon: BookOpen },
    { id: 'aim', label: 'Aim & Objective', icon: Target },
    { id: 'vision', label: 'Vision & Mission', icon: Eye },
    { id: 'founder', label: 'Our Founder', icon: Heart },
  ];

  /* Sync tab from URL hash (e.g. /about#founder) */
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && tabs.some(t => t.id === hash)) {
      setActiveTab(hash);
      // Clear hash so it doesn't interfere on next visit
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const stagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      {/* Page Header */}
      <section className="relative gradient-hero py-12 md:py-16 lg:py-20 overflow-hidden">
        {/* Morphing blobs */}
        <div className="absolute top-10 right-[10%] w-56 h-56 bg-brand-yellow/10 animate-morph" />
        <div className="absolute bottom-10 left-[10%] w-72 h-72 bg-brand-purple-light/10 animate-morph" style={{ animationDelay: '-4s' }} />

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-80 h-80 bg-brand-yellow rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-brand-purple-light rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Badge className="mb-4 px-4 py-1.5 bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 text-sm font-semibold">
              <Award className="w-4 h-4 mr-1.5" />
              About Us
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              <TextReveal text="Trusted Computer Education" className="text-white" delay={0.05} />
              <span className="text-brand-yellow">
                {' '}
                <TextReveal text="Since 1997" delay={0.15} />
              </span>
            </h1>
            <p className="text-white/80 text-sm sm:text-lg max-w-2xl mx-auto">
              <TextReveal text="Building careers through quality computer education with 4 branches across Ghansoli and Koparkhairne, Navi Mumbai." delay={0.1} />
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="relative -mt-8 z-10 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { number: 25, suffix: 'K+', label: 'Students Trained', icon: Users },
                { number: 4, suffix: '', label: 'Branches', icon: Compass },
                { number: 25, suffix: '+', label: 'Years Experience', icon: Award },
                { number: 95, suffix: '%', label: 'Success Rate', icon: TrendingUp },
              ].map((stat) => (
                <motion.div key={stat.label} variants={item}>
                  <Card className="border-0 shadow-lg text-center bg-white dark:bg-card hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-4 md:p-6">
                      <stat.icon className="w-6 h-6 text-brand-purple dark:text-brand-yellow mx-auto mb-2" />
                      <p className="text-2xl md:text-3xl font-extrabold text-brand-purple dark:text-brand-yellow"><CountUp end={stat.number} suffix={stat.suffix} duration={2000} /></p>
                      <p className="text-muted-foreground dark:text-white/70 text-xs md:text-sm mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* Tab Navigation */}
      <PageTransition>
        <section className="bg-white dark:bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12 border-b border-brand-purple/10 pb-4">
                {tabs.map((tab, idx) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl text-xs sm:text-sm md:text-base font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30 scale-105'
                        : 'bg-brand-purple/5 text-brand-purple hover:bg-brand-purple/10 hover:scale-[1.02]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </FadeIn>

            {/* Tab Content — with AnimatePresence for fast transitions */}
            <div id={activeTab} className="pb-16 md:pb-24 scroll-mt-36">
              {activeTab === 'introduction' && (
                <motion.div
                  key="introduction"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                      <motion.div variants={item}>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-6">
                          <span className="text-foreground">Introduction to </span>
                          <span className="text-brand-purple dark:text-brand-yellow" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>Impact Computers</span>
                        </h2>
                        <p className="text-foreground/80 dark:text-white/80 text-base md:text-lg mb-4 leading-relaxed">
                          Impact Computers has been a pioneer in computer education for over 25 years. Founded in 1997 by Mr. Sharad Shinde, we started with a simple yet powerful mission: to make quality computer education accessible to everyone in Navi Mumbai. What began as a small computer training center in Ghansoli has now grown into one of the most trusted names in computer education with 4 branches across Ghansoli and Koparkhairne.
                        </p>
                        <p className="text-foreground/80 dark:text-white/80 text-base md:text-lg mb-4 leading-relaxed">
                          As a government-authorized MS-CIT training center recognized by Maharashtra Knowledge Corporation Limited (MKCL), we offer certified courses that are recognized across Maharashtra. Our courses are designed not just to teach you software, but to make you job-ready and confident in today&apos;s digital world. From school students to working professionals, from housewives to senior citizens, we have trained over 25,000 students who are now successfully employed in various industries.
                        </p>
                        <p className="text-foreground/80 dark:text-white/80 text-base md:text-lg leading-relaxed">
                          We believe in practical, hands-on training with real computers, live projects, and personalized attention. Our experienced faculty makes complex topics simple, and our small batch sizes ensure that every student gets the attention they deserve. At Impact Computers, we don&apos;t just teach computers — we build careers and shape futures.
                        </p>
                      </motion.div>
                      <motion.div variants={item}>
                        <div className="space-y-4">
                          {[
                            { icon: Shield, text: 'Government Authorized MS-CIT Center', desc: 'Officially recognized by MKCL, Maharashtra' },
                            { icon: Users, text: '25,000+ Students Trained', desc: 'Trusted by thousands across Navi Mumbai' },
                            { icon: Award, text: 'Certified Courses', desc: 'Recognized certification across Maharashtra' },
                            { icon: TrendingUp, text: '95%+ Success Rate', desc: 'Consistent exam results over 25 years' },
                            { icon: GraduationCap, text: 'Job-Oriented Training', desc: 'Practical skills for real-world employment' },
                            { icon: Compass, text: '4 Branches', desc: 'Ghansoli (Sector 7 & 5) + Koparkhairne (Sector 19 & 12B)' },
                          ].map((feature, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06, duration: 0.3 }}
                            >
                              <div className="flex items-start gap-3 p-3 md:p-4 rounded-xl bg-brand-purple/5 dark:bg-brand-purple/10 border border-brand-purple/10 dark:border-brand-purple/20 hover:border-brand-purple/30 hover:shadow-md transition-all duration-200">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-purple to-brand-purple-dark flex items-center justify-center flex-shrink-0">
                                  <feature.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <span className="text-sm font-bold text-foreground block">{feature.text}</span>
                                  <span className="text-xs text-foreground/60 dark:text-white/60">{feature.desc}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'aim' && (
                <motion.div
                  key="aim"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Aim */}
                      <motion.div variants={item} className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-br from-brand-purple/10 to-brand-yellow/10 rounded-3xl blur-xl" />
                        <Card className="relative border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                          <div className="bg-gradient-to-r from-brand-purple to-brand-purple-dark p-5 md:p-6 text-white">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                              <Target className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-extrabold">Our Aim</h3>
                          </div>
                          <CardContent className="p-6">
                            <ul className="space-y-3">
                              {[
                                'To provide high-quality, practical, and affordable computer education to every student who walks through our doors, regardless of their background or prior experience.',
                                'To bridge the digital divide by making computer literacy accessible to all sections of society, including students, housewives, working professionals, and senior citizens.',
                                'To empower youth with industry-relevant computer skills that lead to meaningful employment and self-reliance in the modern digital economy.',
                                'To maintain the highest standards of teaching and infrastructure across all our branches, ensuring every student receives the same quality of education.',
                              ].map((text, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.08, duration: 0.3 }}
                                  className="flex items-start gap-2.5"
                                >
                                  <ChevronRight className="w-5 h-5 text-brand-purple dark:text-brand-yellow mt-0.5 flex-shrink-0" />
                                  <p className="text-foreground/80 dark:text-white/80 text-sm leading-relaxed">{text}</p>
                                </motion.li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Objectives */}
                      <motion.div variants={item} className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-br from-brand-yellow/10 to-brand-purple/10 rounded-3xl blur-xl" />
                        <Card className="relative border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                          <div className="bg-gradient-to-r from-brand-yellow-dark to-brand-yellow p-5 md:p-6 text-brand-purple-deep">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/30 flex items-center justify-center mb-3">
                              <Lightbulb className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-extrabold">Our Objectives</h3>
                          </div>
                          <CardContent className="p-6">
                            <ul className="space-y-3">
                              {[
                                'To deliver 100% practical training with hands-on experience on the latest computers and updated software, ensuring students are job-ready from day one.',
                                'To provide government-certified courses (MS-CIT, Tally, Advanced Excel, CAO, CMS) that carry real value in the job market and are recognized statewide.',
                                'To offer personalized attention through small batch sizes, where every student gets individual guidance, doubt-solving, and mentorship from experienced faculty.',
                                'To continuously evolve our curriculum with the latest technology trends including AI awareness, programming, and advanced analytics to keep students future-ready.',
                                'To provide free career counseling and placement support, guiding students toward the right career path based on their skills and interests.',
                              ].map((text, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.08, duration: 0.3 }}
                                  className="flex items-start gap-2.5"
                                >
                                  <ChevronRight className="w-5 h-5 text-brand-yellow-dark mt-0.5 flex-shrink-0" />
                                  <p className="text-foreground/80 dark:text-white/80 text-sm leading-relaxed">{text}</p>
                                </motion.li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'vision' && (
                <motion.div
                  key="vision"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Vision */}
                      <motion.div variants={item}>
                        <Card className="border-0 shadow-xl overflow-hidden h-full hover:shadow-2xl transition-shadow duration-300">
                          <div className="bg-gradient-to-br from-brand-purple via-brand-purple-dark to-brand-purple-deep p-6 md:p-8 text-white text-center min-h-[160px] md:min-h-[200px] flex flex-col items-center justify-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-yellow/20 flex items-center justify-center mb-4 animate-float-slow">
                              <Eye className="w-10 h-10 text-brand-yellow" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-extrabold">Our Vision</h3>
                          </div>
                          <CardContent className="p-6 md:p-8">
                            <p className="text-foreground/80 dark:text-white/80 text-base md:text-lg leading-relaxed">
                              To be the most trusted and leading computer education institute in Navi Mumbai, recognized for transforming lives through technology education. We envision a future where every individual, regardless of age or background, is digitally literate and empowered to thrive in the modern world. Our vision extends beyond just teaching software — we aspire to create a community of confident, skilled, and job-ready individuals who can contribute meaningfully to the digital economy of India.
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Mission */}
                      <motion.div variants={item}>
                        <Card className="border-0 shadow-xl overflow-hidden h-full hover:shadow-2xl transition-shadow duration-300">
                          <div className="bg-gradient-to-br from-brand-yellow-dark via-brand-yellow to-brand-yellow-light p-6 md:p-8 text-brand-purple-deep text-center min-h-[160px] md:min-h-[200px] flex flex-col items-center justify-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-purple-deep/10 flex items-center justify-center mb-4 animate-float-reverse">
                              <Compass className="w-10 h-10 text-brand-purple-deep" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-extrabold">Our Mission</h3>
                          </div>
                          <CardContent className="p-6 md:p-8">
                            <ul className="space-y-3">
                              {[
                                'Deliver industry-relevant computer education through certified courses with 100% practical approach and real-world projects.',
                                'Create an inclusive learning environment where students feel motivated, supported, and confident to achieve their career goals.',
                                'Integrate emerging technologies like AI, data analytics, and programming into our curriculum to keep students ahead of industry trends.',
                                'Maintain excellence across all 4 branches with consistent quality standards, experienced faculty, and modern infrastructure.',
                                'Build strong relationships with the community and local businesses to facilitate job placements and career opportunities for our students.',
                              ].map((text, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.06, duration: 0.3 }}
                                  className="flex items-start gap-2.5"
                                >
                                  <Star className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-0.5" />
                                  <p className="text-foreground/80 dark:text-white/80 text-sm leading-relaxed">{text}</p>
                                </motion.li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'founder' && (
                <motion.div
                  key="founder"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
                      {/* Founder Photo */}
                      <motion.div variants={item} className="md:col-span-2 flex justify-center">
                        <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-br from-brand-purple/20 to-brand-yellow/20 rounded-3xl blur-xl animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
                          <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-500/80 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                            <Image
                              src="/founder-sharad-shinde.png"
                              alt="Mr. Sharad Shinde - Founder, Impact Computers"
                              fill
                              sizes="288px"
                              className="object-cover object-top"
                              loading="lazy"
                            />
                          </div>
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                            className="absolute -bottom-3 -right-3 bg-brand-yellow text-brand-purple-deep px-4 py-1.5 rounded-xl shadow-lg"
                          >
                            <span className="text-xs font-extrabold">Founder</span>
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Founder Details */}
                      <motion.div variants={item} className="md:col-span-3">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground mb-2">
                          Mr. Sharad Shinde
                        </h2>
                        <p className="text-brand-purple dark:text-brand-yellow font-semibold text-sm md:text-base mb-6">
                          Founder &amp; Director, <span style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>Impact Computers</span>
                        </p>

                        <p className="text-foreground/80 dark:text-white/80 text-base md:text-lg mb-4 leading-relaxed">
                          Mr. Sharad Shinde is the visionary founder of Impact Computers, who started this institute in 1997 with a dream to make quality computer education accessible to every individual in Navi Mumbai. With over 25 years of unwavering dedication to education, he has built Impact Computers from a single small classroom into one of the most trusted computer training institutes with 4 branches across Ghansoli and Koparkhairne.
                        </p>
                        <p className="text-foreground/80 dark:text-white/80 text-base md:text-lg mb-6 leading-relaxed">
                          His passion for teaching and commitment to student success has transformed the lives of over 25,000 students. Many of his students have gone on to secure prestigious positions in government offices, private companies, and multinational corporations. Mr. Shinde believes that the right education at the right time can change anyone&apos;s life, and he has dedicated his entire career to making this belief a reality for thousands of families in Navi Mumbai.
                        </p>

                        {/* Founder's Quote */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.15 }}
                          className="relative bg-gradient-to-r from-brand-purple/5 to-brand-yellow/5 dark:from-brand-purple/10 dark:to-brand-yellow/10 rounded-2xl p-5 md:p-6 border border-brand-purple/10 dark:border-brand-purple/20"
                        >
                          <Quote className="w-8 h-8 text-brand-purple/30 dark:text-brand-yellow/30 absolute top-3 left-3" />
                          <p className="text-brand-purple dark:text-brand-yellow font-bold text-base sm:text-lg md:text-xl italic leading-relaxed pl-6">
                            &ldquo;We may not make student&apos;s future, but we can make students for the future !!!&rdquo;
                          </p>
                          <p className="text-foreground/60 dark:text-white/60 text-sm mt-3 pl-6">
                            — Mr. Sharad Shinde, Founder
                          </p>
                        </motion.div>

                        {/* Achievements */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                          {[
                            { number: 25, suffix: '+', label: 'Years of Dedication' },
                            { number: 25, suffix: 'K+', label: 'Lives Transformed' },
                            { number: 4, suffix: '', label: 'Branches Established' },
                          ].map((ach, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
                            >
                              <div className="text-center p-3 rounded-xl bg-brand-purple/5 dark:bg-brand-purple/10 hover:shadow-md transition-shadow duration-200">
                                <p className="text-xl sm:text-2xl font-extrabold text-brand-purple dark:text-brand-yellow"><CountUp end={ach.number} suffix={ach.suffix} duration={1800} /></p>
                                <p className="text-[10px] md:text-xs text-foreground/60 dark:text-white/60">{ach.label}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </PageTransition>
    </div>
  );
}
