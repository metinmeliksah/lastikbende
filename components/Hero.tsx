'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleAnalysisClick = async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    // Kısa bir gecikme ile yönlendirme yap
    setTimeout(() => {
      router.push('/analiz');
    }, 300);
  };

  return (
    <>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-dark-300">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt="Hero Background"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              ARACINI
              <br />
              <span className="text-primary">HAREKETLI TUT</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Aracınız için akıllı lastik analizi ve kaliteli lastik satış hizmetleri. Profesyonel ekibimizle 
              size en uygun çözümleri sunuyoruz.
            </p>
            <motion.button
              onClick={handleAnalysisClick}
              whileHover={!isTransitioning ? { scale: 1.05 } : {}}
              whileTap={!isTransitioning ? { scale: 0.95 } : {}}
              className={`
                bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium 
                transition-all duration-300 focus:outline-none focus-visible:outline-none
                ${isTransitioning 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-red-600 hover:shadow-lg'
                }
              `}
              disabled={isTransitioning}
            >
              {isTransitioning ? 'Yönlendiriliyor...' : 'Hemen Analiz Et'}
            </motion.button>
          </motion.div>

          {/* Diagonal Line */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent transform -skew-x-12" />
        </div>
      </section>
    </>

  )
} 