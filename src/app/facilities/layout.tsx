import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Impact Computers",
  description:
    "Impact Computers offers modern facilities — air-conditioned computer labs, high-speed internet, latest software, and comfortable classrooms across 4 branches in Ghansoli and Koparkhairne, Navi Mumbai.",
  keywords: [
    "computer lab facilities Ghansoli",
    "AC computer classes Navi Mumbai",
    "modern computer labs Koparkhairne",
    "high-speed internet computer institute",
    "computer training infrastructure",
    "computer classroom facilities",
    "best computer lab Navi Mumbai",
    "computer institute facilities Ghansoli",
    "latest software computer training",
    "comfortable computer classes",
    "computer institute infrastructure Koparkhairne",
    "well-equipped computer labs",
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
