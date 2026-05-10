import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Impact Computers",
  description:
    "Read success stories and reviews from students trained at Impact Computers. Real feedback on our job-oriented computer courses, faculty, and career placements in Navi Mumbai.",
  keywords: [
    "Impact Computers reviews",
    "student testimonials Ghansoli",
    "computer classes reviews Navi Mumbai",
    "computer institute feedback",
    "success stories computer students",
    "Impact Computers student reviews",
    "computer training reviews Koparkhairne",
    "MS-CIT course reviews",
    "Tally course student feedback",
    "best computer institute reviews",
    "computer classes ratings Ghansoli",
    "student experience computer training Navi Mumbai",
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
