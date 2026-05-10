import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Impact Computers",
  description:
    "Discover why Impact Computers is Navi Mumbai's top choice — government-certified training, modern computer labs, job-oriented curriculum, experienced faculty, and flexible batch timings in Ghansoli & Koparkhairne.",
  keywords: [
    "why choose Impact Computers",
    "best computer institute Ghansoli",
    "government certified training Navi Mumbai",
    "modern computer labs Ghansoli",
    "job-oriented computer training",
    "experienced faculty computer classes",
    "flexible batch timings computer",
    "computer institute Koparkhairne",
    "top computer classes Navi Mumbai",
    "computer education advantages",
    "quality computer training Ghansoli",
    "certified computer courses Navi Mumbai",
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
