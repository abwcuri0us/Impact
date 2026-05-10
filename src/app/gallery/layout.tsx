import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Impact Computers",
  description:
    "View the Impact Computers gallery — campus photos, faculty profiles, student certificates, and training center images from our 4 branches across Ghansoli and Koparkhairne, Navi Mumbai.",
  keywords: [
    "Impact Computers gallery",
    "computer institute photos Ghansoli",
    "computer training center images",
    "computer classes campus Navi Mumbai",
    "faculty photos computer institute",
    "student certificates Ghansoli",
    "computer lab images Koparkhairne",
    "Impact Computers photos",
    "computer institute infrastructure",
    "training center gallery Navi Mumbai",
    "MS-CIT center photos",
    "computer classes interior Ghansoli",
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
