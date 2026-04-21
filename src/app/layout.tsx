import type { Metadata } from 'next'
import { Inter, Press_Start_2P } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Mommy's Angels — Professional Cleaning Services",
  description: 'Book top-rated, fully vetted professional cleaners in under 3 minutes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${pressStart2P.variable}`}>
      <body className="antialiased bg-pixel-bg text-pixel-navy font-sans">
        {children}
      </body>
    </html>
  )
}
