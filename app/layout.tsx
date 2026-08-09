import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pathways | Career Development Portal',
  description: 'Personal career development, subject planning and counselling pathways for students.'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
