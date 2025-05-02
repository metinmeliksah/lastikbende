import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import '@fortawesome/fontawesome-free/css/all.min.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lastik Demo - Premium Lastik ve Jant Mağazası',
  description: 'En kaliteli lastik ve jantlar için doğru adres',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body 
        className={`${inter.className} bg-dark-400 text-gray-100`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
} 