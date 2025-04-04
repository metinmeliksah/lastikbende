import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import '@fortawesome/fontawesome-free/css/all.min.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lastik Bende - Akıllı Lastik Analizi ve Kaliteli Lastik Satışı',
  description: 'Akıllı lastik analizi ve kaliteli lastik satışında Türkiye\'nin güvenilir adresi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-dark-400 text-gray-100`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
} 