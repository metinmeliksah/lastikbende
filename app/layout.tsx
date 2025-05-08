'use client';

import React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { CartProvider } from './contexts/CartContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

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
        <CartProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  )
} 