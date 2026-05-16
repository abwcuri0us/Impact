'use client';

import { MapPin, Clock, Phone, MessageCircle, Building2, Navigation, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// Badge removed - no ratings needed
import FadeIn from '@/components/shared/FadeIn';
import SectionHeading from '@/components/shared/SectionHeading';

interface Branch {
  name: string;
  subtitle: string;
  color: string;
  address: string;
  phone: string;
  email?: string;
  mapSrc: string;
  mapTitle: string;
  directionsUrl: string;
}

export default function ContactPage() {
  const branches: Branch[] = [
    {
      name: 'Koparkhairne Branch',
      subtitle: 'Sector 19 • Near Bus Depot',
      color: 'from-brand-purple-light to-brand-purple',

      address: 'Sai Prasad 2, 1st Floor, Plot No. 222/A, In Front of Koparkhairne Bus Depot, Sector 19, Koparkhairne, Navi Mumbai, Maharashtra 400709',
      phone: '9819741456',
      email: 'impactcomp97@gmail.com',
      mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.39!2d73.015!3d19.214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sSai+Prasad+Koparkhairne+Bus+Depot!2sImpact+Computer+Training+Institute!5e0!3m2!1sen!2sin!4v1',
      mapTitle: 'Koparkhairne Branch 1 - Sector 19',
      directionsUrl: 'https://www.google.com/maps/dir//Sai+Prasad+2+Plot+222+Sector+19+Koparkhairne+400709',
    },
    {
      name: 'Koparkhairne Branch 2',
      subtitle: 'Sector 12B • Sicily Park',
      color: 'from-brand-purple-dark to-brand-purple-deep',

      address: 'Shop No. 01, Sicily Park, Front of Corporation Bank, Plot No. 54, Sector 12B, Kopar Khairane, Navi Mumbai, Maharashtra 400709',
      phone: '9987025098',
      email: 'impactbon@gmail.com',
      mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.2!2d73.012!3d19.207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sSicily+Park+Kopar+Khairane!2sImpact+Computer+Academy!5e0!3m2!1sen!2sin!4v1',
      mapTitle: 'Koparkhairne Branch 2 - Sicily Park',
      directionsUrl: 'https://www.google.com/maps/dir//Sicily+Park+Plot+54+Sector+12B+Kopar+Khairane+400709',
    },
    {
      name: 'Ghansoli Branch',
      subtitle: 'Sector 7 • Near D-Mart',
      color: 'from-brand-purple to-brand-purple-dark',

      address: 'Shop No. 9, Arihant Riddhi Siddhi CHS, Plot No. 24, Near D-Mart, Sector 7, Ghansoli, Navi Mumbai, Maharashtra 400701',
      phone: '9768100649',
      email: 'impactgh9911@gmail.com',
      mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.896!2d73.0225!3d19.2238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7bde55c91aaaa%3A0x5c7c7f5e4e6a3e2b!2sImpact%20Computers%2C%20Ghansoli!5e0!3m2!1sen!2sin!4v1',
      mapTitle: 'Ghansoli Branch 1 - Near D-Mart',
      directionsUrl: 'https://www.google.com/maps/dir//Shop+No.9+Arihant+Riddhi+Siddhi+CHS+Ghansoli+400701',
    },
    {
      name: 'Ghansoli Branch 2',
      subtitle: 'Sector 5 • Near Police Station',
      color: 'from-brand-yellow-dark to-brand-yellow',

      address: 'Shop No. 122, 1st Floor, Haware Panchvati Plaza, Near Police Station, Beside Daily Bazar, Sector 5, Ghansoli, Navi Mumbai, Maharashtra 400701',
      phone: '8454044041',
      email: 'impactgh9911@gmail.com',
      mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.71!2d73.0195!3d19.2185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sHaware+Panchvati+Plaza+Ghansoli!2sImpact+Computers+Ghansoli!5e0!3m2!1sen!2sin!4v1',
      mapTitle: 'Ghansoli Branch 2 - Haware Panchvati Plaza',
      directionsUrl: 'https://www.google.com/maps/dir//Haware+Panchvati+Plaza+Sector+5+Ghansoli+400701',
    },
  ];

  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      <section className="py-10 md:py-16 lg:py-24 bg-white dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Our Branches"
            title="4 Branches Across Navi Mumbai"
            subtitle="Visit any of our branches for free career counseling. All branches offer the same certified courses with expert faculty."
          />

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {branches.map((branch, index) => (
              <FadeIn key={branch.name} delay={index * 0.1}>
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full bg-white dark:bg-card">
                  <div className={`bg-gradient-to-r ${branch.color} p-4 flex items-center gap-3`}>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">{branch.name}</h3>
                      <p className="text-white/70 text-xs">{branch.subtitle}</p>
                    </div>

                  </div>
                  <CardContent className="p-5">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-brand-purple mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {branch.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-brand-purple flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">Mon - Sat: 7:00 AM - 10:00 PM</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-brand-purple flex-shrink-0" />
                        <a href={`tel:${branch.phone}`} className="text-sm text-brand-purple font-semibold hover:underline">{branch.phone}</a>
                      </div>
                      {branch.email && (
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-brand-purple flex-shrink-0" />
                          <a href={`mailto:${branch.email}`} className="text-sm text-brand-purple font-semibold hover:underline break-all">{branch.email}</a>
                        </div>
                      )}
                    </div>
                    <div className="rounded-xl overflow-hidden border border-brand-purple/10 h-[160px]">
                      <iframe
                        src={branch.mapSrc}
                        width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade" title={branch.mapTitle}
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <a href={`tel:${branch.phone}`} className="flex-1">
                        <Button size="sm" className="w-full bg-brand-purple text-white hover:bg-brand-purple-dark text-xs font-bold">
                          <Phone className="w-3.5 h-3.5 mr-1" /> Call
                        </Button>
                      </a>
                      <a href={branch.directionsUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button size="sm" variant="outline" className="w-full border-brand-purple text-brand-purple hover:bg-brand-purple/5 text-xs font-bold">
                          <Navigation className="w-3.5 h-3.5 mr-1" /> Directions
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          {/* Social Media & Quick Contact */}
          <FadeIn delay={0.4} className="mt-8 md:mt-10">
            <div className="rounded-2xl bg-gradient-to-r from-brand-purple/5 to-brand-yellow/5 border border-brand-purple/10 p-6 sm:p-8">
              <h3 className="font-bold text-foreground text-lg mb-4 text-center">Connect With Us on Social Media</h3>
              <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                <a
                  href="https://www.instagram.com/impact_computergh007?igsh=cHpjMmxkZDlheGk1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram
                </a>
                <a
                  href="https://whatsapp.com/channel/0029Vb7WiBMF6smsKbRvlQ30"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Channel
                </a>
                <a
                  href="https://www.facebook.com/share/1EBaow79e7/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </a>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href="tel:9768100649">
                  <Button className="bg-brand-purple text-white hover:bg-brand-purple-dark font-bold">
                    <Phone className="w-4 h-4 mr-2" />Call: 9768100649
                  </Button>
                </a>
                <a href="https://wa.me/919768100649?text=Hi%2C%20I%20want%20to%20know%20about%20your%20computer%20courses" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-green-500 text-white hover:bg-green-600 font-bold">
                    <MessageCircle className="w-4 h-4 mr-2" />WhatsApp Us
                  </Button>
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
