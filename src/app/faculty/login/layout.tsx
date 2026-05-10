import type { Metadata } from 'next'
import FacultyLoginPage from './page'

export const metadata: Metadata = {
  title: 'Faculty Login | Impact Computers',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
