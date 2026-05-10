import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Faculty Dashboard | Impact Computers',
  robots: { index: false, follow: false },
}

export default function FacultyRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
