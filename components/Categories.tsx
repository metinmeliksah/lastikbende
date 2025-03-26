'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const categories = [
  {
    id: 1,
    name: 'Yaz Lastikleri',
    image: '/categories/summer-tyres.jpg',
    description: 'Yüksek performanslı yaz lastikleri',
    link: '/lastikler/yaz',
  },
  {
    id: 2,
    name: 'Kış Lastikleri',
    image: '/categories/winter-tyres.jpg',
    description: 'Güvenli kış sürüşü için özel lastikler',
    link: '/lastikler/kis',
  },
  {
    id: 3,
    name: 'Spor Jantlar',
    image: '/categories/sport-wheels.jpg',
    description: 'Performans ve stil bir arada',
    link: '/jantlar/spor',
  },
  {
    id: 4,
    name: 'Klasik Jantlar',
    image: '/categories/classic-wheels.jpg',
    description: 'Zamansız tasarımlar',
    link: '/jantlar/klasik',
  },
]

export default function Categories() {
  return (
    <section className="py-16 bg-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Kategoriler</h2>
          <p className="text-gray-400">İhtiyacınıza uygun ürünleri keşfedin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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