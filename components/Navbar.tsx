'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCartIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { createClient } from '@supabase/supabase-js'
import { useCart } from '@/app/contexts/CartContext'

// Supabase client oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL veya Anon Key eksik. Lütfen .env.local dosyasını kontrol edin.')
}

const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseAnonKey || 'your-anon-key'
)

export default function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // CartContext'i kullan
  const { sepetUrunler } = useCart();
  const cartItemCount = sepetUrunler?.length || 0;

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
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Kullanıcı oturum açmış, profil bilgilerini al
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', session.user.id)
            .single()
          
          if (error) {
            console.error('Profil bilgileri alınamadı:', error)
          }
          
          const userData = {
            name: profileData?.first_name || '',
            surname: profileData?.last_name || '',
            email: session.user.email || ''
          }
          
          setUserData(userData)
        } else {
          setUserData(null)
        }
      } catch (error) {
        console.error('Kullanıcı kontrolü hatası:', error)
        setUserData(null)
      } finally {
        setLoading(false)
      }
    }

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserData(null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' && session) {
        await checkUser()
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await checkUser()
      }
    })

    fetchLogo()
    checkUser()

    // Cleanup subscription
    return () => subscription.unsubscribe()
  }, [])

  const handleLinkClick = () => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUserData(null)
      // Sayfayı yenile ve ana sayfaya yönlendir
      window.location.href = '/'
    } catch (error) {
      console.error('Çıkış hatası:', error)
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/arama?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  // Kullanıcı adını formatla
  const getUserDisplayName = () => {
    if (!userData) return 'Hesabım'
    
    if (userData.name && userData.surname) {
      return `${userData.name} ${userData.surname}`
    } else if (userData.name) {
      return userData.name
    } else if (userData.email) {
      return userData.email.split('@')[0]
    }
    
    return 'Hesabım'
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
                <span className="text-sm font-medium max-w-32 truncate">
                  {loading ? 'Yükleniyor...' : getUserDisplayName()}
                </span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 w-48 bg-dark-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                   style={{ top: 'calc(100% + 4px)' }}>
                {!loading && userData ? (
                  <>
                    <div className="px-4 py-2 border-b border-dark-100">
                      <p className="text-sm text-gray-300 truncate">{userData.email}</p>
                    </div>
                    <Link href="/kullanici" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-primary hover:bg-dark-100">
                      <UserIcon className="h-5 w-5 mr-2" />
                      <span>Hesabım</span>
                    </Link>
                    <Link href="/kullanici" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-primary hover:bg-dark-100">
                      <Cog6ToothIcon className="h-5 w-5 mr-2" />
                      <span>Hesap Ayarları</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-dark-100"
                      disabled={loading}
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                      <span>{loading ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}</span>
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
              className="flex items-center space-x-1 bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} bg-dark-300 border-t border-dark-100`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
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
            
            {/* Mobile User Menu */}
            {!loading && userData ? (
              <>
                <div className="px-3 py-2 border-b border-dark-100">
                  <p className="text-sm text-gray-400">Hoş geldin,</p>
                  <p className="text-sm text-gray-300 font-medium truncate">{getUserDisplayName()}</p>
                </div>
                <Link href="/kullanici" className="flex items-center px-3 py-2 text-base font-medium text-gray-300 hover:text-primary" onClick={handleLinkClick}>
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>Hesabım</span>
                </Link>
                <button 
                  onClick={async () => { 
                    handleLinkClick(); 
                    await handleLogout(); 
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-300 hover:text-red-400"
                  disabled={loading}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  <span>{loading ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/kullanici/giris" className="flex items-center px-3 py-2 text-base font-medium text-gray-300 hover:text-primary" onClick={handleLinkClick}>
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>Giriş Yap</span>
                </Link>
                <Link href="/kullanici/kayit" className="flex items-center px-3 py-2 text-base font-medium text-gray-300 hover:text-primary" onClick={handleLinkClick}>
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