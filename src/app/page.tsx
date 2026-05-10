import type { Metadata } from 'next';
import HomePageContent from './HomePageContent';

export const metadata: Metadata = {
  title: 'Impact Computers | Government Certified MS-CIT Training Center in Navi Mumbai',
  description:
    'Government-certified computer training institute in Navi Mumbai since 1997. MS-CIT, Tally, Advanced Excel, Python & AI courses. 4 branches in Ghansoli & Koparkhairne. 25,000+ students trained. Job-oriented training with hands-on practical sessions.',
  keywords: [
    'MS-CIT in Navi Mumbai',
    'computer classes Ghansoli',
    'computer classes Koparkhairne',
    'Tally course Navi Mumbai',
    'Advance Excel course',
    'government certified computer courses',
    'Impact Computers',
    'computer training institute',
    'job-oriented computer courses',
    'AI courses Navi Mumbai',
  ],
  openGraph: {
    title: 'Impact Computers | Government Certified MS-CIT Training Center in Navi Mumbai',
    description:
      'Join Maharashtra\'s trusted computer training institute with 4 branches. MS-CIT, Tally, Advanced Excel & AI courses. 25+ years of excellence.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function HomePage() {
  return <HomePageContent />;
}
