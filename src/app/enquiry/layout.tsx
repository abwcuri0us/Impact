import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Impact Computers",
  description:
    "Enquire now at Impact Computers — fill our enquiry form for admissions, free demo class, career counseling, or WhatsApp enquiry. Join Navi Mumbai's trusted computer training institute today.",
  keywords: [
    "computer class enquiry Ghansoli",
    "admission enquiry Navi Mumbai",
    "free demo class computer",
    "computer course enquiry form",
    "career counseling computer",
    "WhatsApp enquiry computer classes",
    "join computer classes Ghansoli",
    "computer institute admission",
    "enquire MS-CIT course",
    "computer training enquiry Koparkhairne",
    "book free demo computer class",
    "computer course registration Navi Mumbai",
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
