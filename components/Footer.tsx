'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-dark-300 text-gray-300">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="px-4 sm:px-0">
            <h3 className="text-xl font-bold text-white mb-4">Lastik Bende</h3>
            <p className="text-gray-400 mb-4">
              Akıllı lastik analizi ve kaliteli lastik satışında Türkiye'nin güvenilir adresi.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary focus:outline-none focus-visible:outline-none">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary focus:outline-none focus-visible:outline-none">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary focus:outline-none focus-visible:outline-none">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-semibold text-white mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/hakkimizda" className="hover:text-primary focus:outline-none focus-visible:outline-none">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/lastikler" className="hover:text-primary focus:outline-none focus-visible:outline-none">
                  Lastikler
                </Link>
              </li>
              <li>
                <Link href="/analiz" className="hover:text-primary focus:outline-none focus-visible:outline-none">
                  Analiz Et
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-primary focus:outline-none focus-visible:outline-none">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-semibold text-white mb-4">İletişim</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <i className="fas fa-map-marker-alt mr-2"></i>
                İstanbul, Türkiye
              </li>
              <li>
                <i className="fas fa-phone mr-2"></i>
                +90 (555) 123 45 67
              </li>
              <li>
                <i className="fas fa-envelope mr-2"></i>
                info@lastikbende.com
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-semibold text-white mb-4">Bülten</h3>
            <p className="text-gray-400 mb-4">
              Kampanya ve yeniliklerden haberdar olmak için bültenimize abone olun.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 bg-dark-200 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-red-600 transition-colors focus:outline-none focus-visible:outline-none"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-dark-100">
          <div className="flex flex-col md:flex-row justify-between items-center px-4 sm:px-0">
            <p className="text-gray-400 text-sm">
              © 2025 Lastik Bende. Tüm hakları saklıdır.
            </p>
            <div className="mt-4 md:mt-0">
              <Link href="/gizlilik" className="text-gray-400 hover:text-primary text-sm mx-3 focus:outline-none focus-visible:outline-none">
                Gizlilik Politikası
              </Link>
              <Link href="/kosullar" className="text-gray-400 hover:text-primary text-sm mx-3 focus:outline-none focus-visible:outline-none">
                Kullanım Koşulları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}