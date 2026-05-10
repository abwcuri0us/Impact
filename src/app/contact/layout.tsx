import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Impact Computers",
  description:
    "Contact Impact Computers — 4 branches in Ghansoli (Sector 7 & 5) and Koparkhairne (Sector 19 & 12B), Navi Mumbai. Call us or visit for admissions, course details, and free career counseling.",
  keywords: [
    "contact Impact Computers",
    "computer classes near me",
    "computer institute Ghansoli contact",
    "computer classes Koparkhairne address",
    "computer training Navi Mumbai phone",
    "Impact Computers phone number",
    "computer classes Sector 7 Ghansoli",
    "computer classes Sector 19 Koparkhairne",
    "MS-CIT center contact Ghansoli",
    "computer institute near D-Mart Ghansoli",
    "admission enquiry computer classes",
    "computer training center address Navi Mumbai",
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
