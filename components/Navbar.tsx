'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCartIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed w-full z-50 bg-dark-300 border-b border-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              Lastik Bende
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Ana Sayfa
              </Link>
              <Link href="/lastikler" className="text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Lastikler
              </Link>
              <Link href="/analiz" className="text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Analiz Et
              </Link>
              <Link href="/hakkimizda" className="text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Hakkımızda
              </Link>
              <Link href="/iletisim" className="text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                İletişim
              </Link>
            </div>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center">
            <button className="text-gray-300 hover:text-primary p-2">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <Link href="/sepet" className="text-gray-300 hover:text-primary p-2">
              <ShoppingCartIcon className="h-6 w-6" />
            </Link>
            <Link href="/giris" className="text-gray-300 hover:text-primary p-2">
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-primary p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: isMenuOpen ? 1 : 0, y: isMenuOpen ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} bg-dark-200`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
            Ana Sayfa
          </Link>
          <Link href="/lastikler" className="text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
            Lastikler
          </Link>
          <Link href="/analiz" className="text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
            Analiz Et
          </Link>
          <Link href="/hakkimizda" className="text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
            Hakkımızda
          </Link>
          <Link href="/iletisim" className="text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
            İletişim
          </Link>
          <Link href="/giris" className="text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
            Giriş Yap
          </Link>
        </div>
      </motion.div>
    </nav>
  )
} 