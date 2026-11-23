import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Swaraj-Auto (स्वराज-ऑटो): Unified Sovereign Welfare Engine',
  description:
    'Swaraj-Auto (स्वराज-ऑटो): Unified Sovereign Welfare Exclusion & Due-Process Engine hosted inside RSDC atop Jan Aadhaar 2.0, RajSewaDwar, and Project SMART.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        {children}
      </body>
    </html>
  )
}
