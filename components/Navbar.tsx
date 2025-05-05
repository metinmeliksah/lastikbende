'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCartIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="fixed w-full z-50 bg-dark-300 border-b border-dark-100">
      <div className="w-full max-w-7xl mx-auto px-0">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 px-4">
            <Link href="/" className="text-2xl font-bold text-primary border-0 outline-none focus:outline-none focus-visible:outline-none">
              Lastik Bende
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-300 hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none">
                Ana Sayfa
              </Link>
              <Link href="/urunler" className="text-gray-300 hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none">
                Lastikler
              </Link>
              <Link href="/analiz" className="text-gray-300 hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none">
                Analiz Et
              </Link>
              <Link href="/hakkimizda" className="text-gray-300 hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none">
                Hakkımızda
              </Link>
            </div>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center px-4">
            <button className="text-gray-300 hover:text-primary p-2 outline-none border-0 transition-colors duration-200 focus:outline-none focus-visible:outline-none">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <Link href="/sepet" className="text-gray-300 hover:text-primary p-2 outline-none border-0 transition-colors duration-200 focus:outline-none focus-visible:outline-none">
              <ShoppingCartIcon className="h-6 w-6" />
            </Link>
            <Link href="/kullanici/giris" className="text-gray-300 hover:text-primary p-2 outline-none border-0 transition-colors duration-200 focus:outline-none focus-visible:outline-none">
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden px-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-primary p-2 outline-none border-0 transition-colors duration-200 focus:outline-none focus-visible:outline-none"
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
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} bg-dark-200 w-full`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1">
          <Link 
            href="/" 
            className="text-gray-300 hover:text-primary block px-3 py-2 text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none"
            onClick={handleLinkClick}
          >
            Ana Sayfa
          </Link>
          <Link 
            href="/urunler" 
            className="text-gray-300 hover:text-primary block px-3 py-2 text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none"
            onClick={handleLinkClick}
          >
            Lastikler
          </Link>
          <Link 
            href="/analiz" 
            className="text-gray-300 hover:text-primary block px-3 py-2 text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none"
            onClick={handleLinkClick}
          >
            Analiz Et
          </Link>
          <Link 
            href="/hakkimizda" 
            className="text-gray-300 hover:text-primary block px-3 py-2 text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none"
            onClick={handleLinkClick}
          >
            Hakkımızda
          </Link>
          <Link 
            href="/giris" 
            className="text-gray-300 hover:text-primary block px-3 py-2 text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none"
            onClick={handleLinkClick}
          >
            Giriş Yap
          </Link>
        </div>
      </motion.div>
    </nav>
  )
} 