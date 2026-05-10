import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Impact Computers",
  description:
    "Explore AI-powered learning at Impact Computers. Learn ChatGPT integration, AI tools, and future-ready skills with hands-on training at our Navi Mumbai centers in Ghansoli and Koparkhairne.",
  keywords: [
    "AI courses Ghansoli",
    "ChatGPT training Navi Mumbai",
    "AI learning computer classes",
    "artificial intelligence course Koparkhairne",
    "AI tools training Ghansoli",
    "ChatGPT course Navi Mumbai",
    "future-ready skills computer",
    "AI-powered learning Navi Mumbai",
    "machine learning basics Ghansoli",
    "AI certification course",
    "computer classes AI training",
    "AI skills for students Ghansoli",
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
