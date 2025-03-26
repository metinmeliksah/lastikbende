'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'

const products = [
  {
    id: 1,
    name: 'Bridgestone Potenza Sport',
    price: '₺4.999',
    image: '/products/tyre1.jpg',
    tag: 'YENİ',
  },
  {
    id: 2,
    name: 'Continental SportContact 7',
    price: '₺5.499',
    image: '/products/tyre2.jpg',
    tag: 'POPÜLER',
  },
  {
    id: 3,
    name: 'BBS CH-R II Jant',
    price: '₺12.999',
    image: '/products/wheel1.jpg',
    tag: 'PREMIUM',
  },
  {
    id: 4,
    name: 'OZ Racing Superturismo',
    price: '₺9.999',
    image: '/products/wheel2.jpg',
    tag: 'İNDİRİM',
  },
]

export default function FeaturedProducts() {
  return (
    <section className="py-16 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Öne Çıkan Ürünler</h2>
          <p className="text-gray-400">En çok tercih edilen lastik ve jant modelleri</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-dark-300 rounded-lg overflow-hidden group"
            >
              <div className="relative h-64">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.tag && (
                  <span className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.tag}
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-primary font-bold mb-4">{product.price}</p>
                <button className="w-full bg-dark-200 hover:bg-primary text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
                  <ShoppingCartIcon className="h-5 w-5" />
                  Sepete Ekle
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 