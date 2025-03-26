import React from 'react'
import Hero from '@/components/Hero'
import FeaturedProducts from '@/components/FeaturedProducts'
import Categories from '@/components/Categories'
import Services from '@/components/Services'

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-400">
      <Hero />
      <Services />
      <FeaturedProducts />
      <Categories />
    </main>
  )
} 