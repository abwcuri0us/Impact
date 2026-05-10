import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Impact Computers",
  description:
    "Learn about Impact Computers — 27+ years of trusted computer education in Navi Mumbai. Founded by Mr. Sharad Shinde, we have trained 25,000+ students with government-authorized certifications.",
  keywords: [
    "about Impact Computers",
    "computer institute Ghansoli",
    "computer training Navi Mumbai",
    "Sharad Shinde computer classes",
    "government authorized computer institute",
    "best computer classes Ghansoli",
    "computer education since 1997",
    "25000 students trained",
    "trusted computer institute Navi Mumbai",
    "computer training history Ghansoli",
    "Koparkhairne computer institute",
    "Impact Computers founder",
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
