'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Örnek ürün verileri
const products = [
  {
    id: 1,
    name: 'Yaz Lastiği 205/55 R16',
    price: '2.499 TL',
    image: '/products/tyre1.jpg',
    category: 'Yaz Lastikleri',
    brand: 'Michelin',
  },
  {
    id: 2,
    name: 'Kış Lastiği 215/65 R17',
    price: '3.299 TL',
    image: '/products/tyre2.jpg',
    category: 'Kış Lastikleri',
    brand: 'Goodyear',
  },
  {
    id: 3,
    name: 'Jant 17" Alüminyum',
    price: '4.999 TL',
    image: '/products/wheel1.jpg',
    category: 'Jantlar',
    brand: 'BBS',
  },
  {
    id: 4,
    name: 'Jant 18" Alüminyum',
    price: '5.999 TL',
    image: '/products/wheel2.jpg',
    category: 'Jantlar',
    brand: 'OZ Racing',
  },
  {
    id: 5,
    name: 'Yaz Lastiği 225/45 R18',
    price: '3.999 TL',
    image: '/products/tyre3.jpg',
    category: 'Yaz Lastikleri',
    brand: 'Pirelli',
  },
  {
    id: 6,
    name: 'Kış Lastiği 235/55 R19',
    price: '4.499 TL',
    image: '/products/tyre4.jpg',
    category: 'Kış Lastikleri',
    brand: 'Continental',
  },
  {
    id: 7,
    name: 'Jant 19" Alüminyum',
    price: '6.999 TL',
    image: '/products/wheel3.jpg',
    category: 'Jantlar',
    brand: 'Enkei',
  },
  {
    id: 8,
    name: 'Yaz Lastiği 195/65 R15',
    price: '2.199 TL',
    image: '/products/tyre5.jpg',
    category: 'Yaz Lastikleri',
    brand: 'Bridgestone',
  },
  {
    id: 9,
    name: 'Jant 16" Alüminyum',
    price: '4.499 TL',
    image: '/products/wheel4.jpg',
    category: 'Jantlar',
    brand: 'Rota',
  },
  {
    id: 10,
    name: 'Kış Lastiği 205/55 R16',
    price: '2.899 TL',
    image: '/products/tyre6.jpg',
    category: 'Kış Lastikleri',
    brand: 'Michelin',
  },
  {
    id: 11,
    name: 'Yaz Lastiği 215/60 R17',
    price: '3.599 TL',
    image: '/products/tyre7.jpg',
    category: 'Yaz Lastikleri',
    brand: 'Goodyear',
  },
  {
    id: 12,
    name: 'Jant 18" Alüminyum',
    price: '5.499 TL',
    image: '/products/wheel5.jpg',
    category: 'Jantlar',
    brand: 'BBS',
  },
  {
    id: 13,
    name: 'Kış Lastiği 225/50 R17',
    price: '3.899 TL',
    image: '/products/tyre8.jpg',
    category: 'Kış Lastikleri',
    brand: 'Pirelli',
  },
  {
    id: 14,
    name: 'Yaz Lastiği 235/45 R18',
    price: '4.299 TL',
    image: '/products/tyre9.jpg',
    category: 'Yaz Lastikleri',
    brand: 'Continental',
  },
  {
    id: 15,
    name: 'Jant 17" Alüminyum',
    price: '4.799 TL',
    image: '/products/wheel6.jpg',
    category: 'Jantlar',
    brand: 'Enkei',
  },
  {
    id: 16,
    name: 'Kış Lastiği 195/65 R15',
    price: '2.399 TL',
    image: '/products/tyre10.jpg',
    category: 'Kış Lastikleri',
    brand: 'Bridgestone',
  },
  {
    id: 17,
    name: 'Jant 19" Alüminyum',
    price: '6.499 TL',
    image: '/products/wheel7.jpg',
    category: 'Jantlar',
    brand: 'Rota',
  },
  {
    id: 18,
    name: 'Yaz Lastiği 225/55 R17',
    price: '3.799 TL',
    image: '/products/tyre11.jpg',
    category: 'Yaz Lastikleri',
    brand: 'Michelin',
  },
  {
    id: 19,
    name: 'Kış Lastiği 235/55 R18',
    price: '4.199 TL',
    image: '/products/tyre12.jpg',
    category: 'Kış Lastikleri',
    brand: 'Goodyear',
  },
  {
    id: 20,
    name: 'Jant 20" Alüminyum',
    price: '7.999 TL',
    image: '/products/wheel8.jpg',
    category: 'Jantlar',
    brand: 'BBS',
  },
  {
    id: 21,
    name: 'Yaz Lastiği 245/40 R19',
    price: '4.999 TL',
    image: '/products/tyre13.jpg',
    category: 'Yaz Lastikleri',
    brand: 'Pirelli',
  },
  {
    id: 22,
    name: 'Kış Lastiği 255/45 R19',
    price: '5.299 TL',
    image: '/products/tyre14.jpg',
    category: 'Kış Lastikleri',
    brand: 'Continental',
  },
  {
    id: 23,
    name: 'Jant 18" Alüminyum',
    price: '5.299 TL',
    image: '/products/wheel9.jpg',
    category: 'Jantlar',
    brand: 'Enkei',
  },
  {
    id: 24,
    name: 'Yaz Lastiği 265/35 R20',
    price: '5.499 TL',
    image: '/products/tyre15.jpg',
    category: 'Yaz Lastikleri',
    brand: 'Bridgestone',
  },
  {
    id: 25,
    name: 'Kış Lastiği 275/40 R20',
    price: '5.799 TL',
    image: '/products/tyre16.jpg',
    category: 'Kış Lastikleri',
    brand: 'Michelin',
  },
  {
    id: 26,
    name: 'Jant 21" Alüminyum',
    price: '8.999 TL',
    image: '/products/wheel10.jpg',
    category: 'Jantlar',
    brand: 'Rota',
  },
  {
    id: 27,
    name: 'Yaz Lastiği 285/30 R21',
    price: '6.299 TL',
    image: '/products/tyre17.jpg',
    category: 'Yaz Lastikleri',
    brand: 'Goodyear',
  }
];

const categories = ['Tümü', 'Yaz Lastikleri', 'Kış Lastikleri', 'Jantlar'];
const brands = ['Tümü', 'Michelin', 'Goodyear', 'BBS', 'OZ Racing', 'Pirelli', 'Continental', 'Bridgestone', 'Enkei', 'Rota'];

export default function UrunlerPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedBrand, setSelectedBrand] = useState('Tümü');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'Tümü' && product.category !== selectedCategory) return false;
    if (selectedBrand !== 'Tümü' && product.brand !== selectedBrand) return false;
    return true;
  });

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Sayfa numaralarını oluştur
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-dark-400 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Ürünlerimiz</h1>
        
        {/* Filtreler */}
        <div className="bg-dark-300 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Marka</label>
              <div className="flex flex-wrap gap-2">
                {brands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => {
                      setSelectedBrand(brand);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedBrand === brand
                        ? 'bg-primary text-white'
                        : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ürün Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-dark-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-gray-400 mb-2">{product.brand}</p>
                <p className="text-primary text-xl font-bold">{product.price}</p>
                <button className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-red-600 transition-colors">
                  Sepete Ekle
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sayfalama */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? 'bg-dark-200 text-gray-500 cursor-not-allowed'
                : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
            }`}
          >
            Önceki
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-4 py-2 rounded-md ${
                currentPage === number
                  ? 'bg-primary text-white'
                  : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? 'bg-dark-200 text-gray-500 cursor-not-allowed'
                : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
            }`}
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
} 