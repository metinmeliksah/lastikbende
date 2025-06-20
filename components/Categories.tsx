'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const categories = [
  {
    id: 1,
    name: 'Yaz Lastikleri',
    image: '/images/categories/summer-tyres.svg',
    description: 'Yüksek performanslı yaz lastikleri',
    link: '/urunler?mevsim=Yaz',
  },
  {
    id: 2,
    name: 'Kış Lastikleri',
    image: '/images/categories/winter-tyres.svg',
    description: 'Güvenli kış sürüşü için özel lastikler',
    link: '/urunler?mevsim=Kış',
  },
  {
    id: 3,
    name: '4 Mevsim Lastikleri',
    image: '/images/categories/all-season-tyres.svg',
    description: 'Her mevsim kullanılabilen çok yönlü lastikler',
    link: '/urunler?mevsim=4 Mevsim',
  },
]

export default function Categories() {
  return (
    <section className="py-16 bg-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Kategoriler</h2>
          <p className="text-gray-400">İhtiyacınıza uygun lastikleri keşfedin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <Link href={category.link} className="block">
                <div className="relative h-80 rounded-lg overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-category.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                    <p className="text-gray-300 text-sm">{category.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 