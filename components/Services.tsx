'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TruckIcon, WrenchIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline'

const services = [
  {
    icon: TruckIcon,
    title: 'Ücretsiz Kargo',
    description: 'Tüm Türkiye\'ye ücretsiz kargo imkanı',
  },
  {
    icon: WrenchIcon,
    title: 'Profesyonel Montaj',
    description: 'Uzman ekibimizle profesyonel montaj hizmeti',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Garanti',
    description: '2 yıl garanti ve değişim imkanı',
  },
  {
    icon: ClockIcon,
    title: '7/24 Destek',
    description: 'Kesintisiz müşteri desteği',
  },
]

export default function Services() {
  return (
    <section className="py-16 bg-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6 bg-dark-200 rounded-lg hover:bg-dark-100 transition-colors"
            >
              <service.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
              <p className="text-gray-400">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 