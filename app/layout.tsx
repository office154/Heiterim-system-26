import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'מערכת ניהול משימות',
  description: 'מערכת לניהול פרויקטים ומשימות',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
