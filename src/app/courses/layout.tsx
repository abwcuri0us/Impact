import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Impact Computers",
  description:
    "Explore 13+ job-oriented computer courses at Impact Computers. Government-certified programs in MS-CIT, Tally, Advanced Excel, Python, C/C++, DTP, and more across Navi Mumbai.",
  keywords: [
    "computer courses Ghansoli",
    "MS-CIT course Ghansoli",
    "Tally course Navi Mumbai",
    "Advanced Excel course Koparkhairne",
    "Python course Ghansoli",
    "C programming course Navi Mumbai",
    "DTP course Ghansoli",
    "government certified computer courses",
    "job-oriented computer courses",
    "computer classes Ghansoli",
    "computer diploma courses Navi Mumbai",
    "CAO course Ghansoli",
    "CMS course Koparkhairne",
    "computer training programs",
    "short-term computer courses",
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
