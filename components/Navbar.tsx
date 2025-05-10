'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCartIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { createClient } from '@supabase/supabase-js'

// Supabase client oluştur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItemCount, setCartItemCount] = useState(3)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const fetchLogo = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('logo_url')
        .single()

      if (data?.logo_url) {
        setLogoUrl(data.logo_url)
      }
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUserData(userData)
      }
    }

    fetchLogo()
    checkUser()
  }, [])

  const handleLinkClick = () => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserData(null)
    window.location.href = '/'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/arama?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <nav className="fixed w-full z-50 bg-dark-300 border-b border-dark-100">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center border-0 outline-none focus:outline-none focus-visible:outline-none">
              {logoUrl && (
                <Image
                  src={logoUrl}
                  alt="Lastik Bende Logo"
                  width={140}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              )}
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 items-center justify-start ml-16">
            <div className="flex items-baseline space-x-6">
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
              <Link href="/iletisim" className="text-gray-300 hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none">
                İletişim
              </Link>
            </div>
          </div>

          {/* Search and User Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <form onSubmit={handleSearch}>
                <div className={`flex items-center bg-dark-200 rounded-lg transition-all duration-200 ${isSearchOpen ? 'w-64' : 'w-10'}`}>
                  <button 
                    type={isSearchOpen ? 'submit' : 'button'}
                    onClick={() => !isSearchOpen && setIsSearchOpen(true)}
                    className="p-2 text-gray-300 hover:text-primary"
                  >
                    <MagnifyingGlassIcon className="h-6 w-6" />
                  </button>
                  <input
                    type="text"
                    placeholder="Arama yapın..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    className={`${isSearchOpen ? 'w-full px-2' : 'w-0'} bg-transparent border-none text-gray-300 placeholder-gray-500 focus:outline-none transition-all duration-200`}
                  />
                </div>
              </form>
            </div>
            
            {/* User Menu */}
            <div className="relative group">
              <button 
                className="flex items-center space-x-1 bg-dark-200 hover:bg-dark-100 text-gray-300 hover:text-primary px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <UserIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {userData ? userData.name || 'Hesabım' : 'Hesabım'}
                </span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 w-48 bg-dark-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                   style={{ top: 'calc(100% + 4px)' }}>
                {userData ? (
                  <>
                    <Link href="/kullanici/ayarlar" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-primary hover:bg-dark-100">
                      <Cog6ToothIcon className="h-5 w-5 mr-2" />
                      <span>Ayarlar</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-primary hover:bg-dark-100"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                      <span>Çıkış Yap</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/kullanici/giris" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-primary hover:bg-dark-100">
                      <UserIcon className="h-5 w-5 mr-2" />
                      <span>Giriş Yap</span>
                    </Link>
                    <Link href="/kullanici/kayit" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-primary hover:bg-dark-100">
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                      <span>Kayıt Ol</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Cart */}
            <Link 
              href="/sepet" 
              className="flex items-center space-x-1 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Sepetim</span>
              {cartItemCount > 0 && (
                <span className="ml-1 bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
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
          {/* Search in Mobile */}
          <form onSubmit={handleSearch} className="mb-2">
            <div className="flex items-center bg-dark-300 rounded-lg p-2">
              <button type="submit" className="text-gray-300 hover:text-primary">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              </button>
              <input
                type="text"
                placeholder="Arama yapın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-gray-300 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </form>

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
            href="/iletisim" 
            className="text-gray-300 hover:text-primary block px-3 py-2 text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:outline-none"
            onClick={handleLinkClick}
          >
            İletişim
          </Link>
          
          <div className="border-t border-dark-100 mt-2 pt-2">
            <Link 
              href="/sepet" 
              className="flex items-center justify-between text-gray-300 hover:text-primary px-3 py-2 text-base font-medium"
              onClick={handleLinkClick}
            >
              <div className="flex items-center">
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                <span>Sepetim</span>
              </div>
              {cartItemCount > 0 && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            {userData ? (
              <>
                <Link 
                  href="/kullanici/ayarlar" 
                  className="flex items-center text-gray-300 hover:text-primary px-3 py-2 text-base font-medium"
                  onClick={handleLinkClick}
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-2" />
                  <span>Ayarlar</span>
                </Link>
                <button 
                  onClick={() => {
                    handleLogout()
                    handleLinkClick()
                  }}
                  className="flex items-center w-full text-gray-300 hover:text-primary px-3 py-2 text-base font-medium"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  <span>Çıkış Yap</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/kullanici/giris" 
                  className="flex items-center text-gray-300 hover:text-primary px-3 py-2 text-base font-medium"
                  onClick={handleLinkClick}
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>Giriş Yap</span>
                </Link>
                <Link 
                  href="/kullanici/kayit" 
                  className="flex items-center text-gray-300 hover:text-primary px-3 py-2 text-base font-medium"
                  onClick={handleLinkClick}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  <span>Kayıt Ol</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  )
} 