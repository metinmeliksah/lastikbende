'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProductSpecs {
  "Ebat": string;
  "Yük İndeksi": string;
  "Hız Sembolü": string;
  "Dış Gürültü": string;
  "Yakıt Verimliliği": string;
  "Islak Tutuş": string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  brand: string;
  category: string;
  specs: ProductSpecs;
}

// Örnek ürün verileri
const products: Product[] = [
  {
    id: 1,
    name: "Michelin Primacy 4",
    price: "2500",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Michelin+Primacy+4",
    brand: "Michelin",
    category: "Lastik",
    specs: {
      "Ebat": "205/55 R16",
      "Yük İndeksi": "91",
      "Hız Sembolü": "V",
      "Dış Gürültü": "71 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 2,
    name: "Goodyear EfficientGrip",
    price: "2200",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Goodyear+EfficientGrip",
    brand: "Goodyear",
    category: "Lastik",
    specs: {
      "Ebat": "215/65 R17",
      "Yük İndeksi": "99",
      "Hız Sembolü": "H",
      "Dış Gürültü": "70 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 3,
    name: "Continental PremiumContact",
    price: "2300",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Continental+PremiumContact",
    brand: "Continental",
    category: "Lastik",
    specs: {
      "Ebat": "225/45 R18",
      "Yük İndeksi": "95",
      "Hız Sembolü": "W",
      "Dış Gürültü": "69 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 4,
    name: "Pirelli Cinturato",
    price: "2400",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Pirelli+Cinturato",
    brand: "Pirelli",
    category: "Lastik",
    specs: {
      "Ebat": "235/55 R19",
      "Yük İndeksi": "101",
      "Hız Sembolü": "V",
      "Dış Gürültü": "70 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 5,
    name: "Bridgestone Turanza",
    price: "2100",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Bridgestone+Turanza",
    brand: "Bridgestone",
    category: "Lastik",
    specs: {
      "Ebat": "245/40 R20",
      "Yük İndeksi": "99",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "71 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 6,
    name: "Dunlop Sport",
    price: "2000",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Dunlop+Sport",
    brand: "Dunlop",
    category: "Lastik",
    specs: {
      "Ebat": "255/35 R21",
      "Yük İndeksi": "98",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "72 dB",
      "Yakıt Verimliliği": "C",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 7,
    name: "Hankook Ventus",
    price: "1900",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Hankook+Ventus",
    brand: "Hankook",
    category: "Lastik",
    specs: {
      "Ebat": "265/30 R22",
      "Yük İndeksi": "97",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "73 dB",
      "Yakıt Verimliliği": "C",
      "Islak Tutuş": "B"
    }
  },
  {
    id: 8,
    name: "Yokohama Advan",
    price: "2600",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Yokohama+Advan",
    brand: "Yokohama",
    category: "Lastik",
    specs: {
      "Ebat": "275/25 R23",
      "Yük İndeksi": "96",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "74 dB",
      "Yakıt Verimliliği": "C",
      "Islak Tutuş": "B"
    }
  },
  {
    id: 9,
    name: 'Jant 19" Alüminyum',
    price: '6.999 TL',
    image: '/products/wheel3.jpg',
    brand: 'Enkei',
    category: 'Jant',
    specs: {
      "Ebat": "19\"",
      "Yük İndeksi": "99",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "71 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 10,
    name: 'Yaz Lastiği 265/35 R20',
    price: '5.499 TL',
    image: '/products/tyre7.jpg',
    brand: 'Bridgestone',
    category: 'Lastik',
    specs: {
      "Ebat": "265/35 R20",
      "Yük İndeksi": "99",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "70 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 11,
    name: 'Kış Lastiği 275/40 R20',
    price: '5.799 TL',
    image: '/products/tyre8.jpg',
    brand: 'Michelin',
    category: 'Lastik',
    specs: {
      "Ebat": "275/40 R20",
      "Yük İndeksi": "105",
      "Hız Sembolü": "W",
      "Dış Gürültü": "74 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 12,
    name: 'Jant 20" Alüminyum',
    price: '7.999 TL',
    image: '/products/wheel4.jpg',
    brand: 'BBS',
    category: 'Jant',
    specs: {
      "Ebat": "20\"",
      "Yük İndeksi": "105",
      "Hız Sembolü": "W",
      "Dış Gürültü": "72 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 13,
    name: 'Yaz Lastiği 285/30 R21',
    price: '6.299 TL',
    image: '/products/tyre9.jpg',
    brand: 'Goodyear',
    category: 'Lastik',
    specs: {
      "Ebat": "285/30 R21",
      "Yük İndeksi": "109",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "69 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 14,
    name: 'Jant 21" Alüminyum',
    price: '8.999 TL',
    image: '/products/wheel5.jpg',
    brand: 'Rota',
    category: 'Jant',
    specs: {
      "Ebat": "21\"",
      "Yük İndeksi": "109",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "73 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  }
];

interface SearchFilters {
  brand: string;
  size: string;
  minPrice: string;
  maxPrice: string;
  loadIndex: string;
  speedIndex: string;
}

export default function UrunlerPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    brand: '',
    size: '',
    minPrice: '',
    maxPrice: '',
    loadIndex: '',
    speedIndex: ''
  });

  const productsPerPage = 9;

  const filteredProducts = products.filter(product => {
    if (searchFilters.brand && product.brand !== searchFilters.brand) return false;
    if (searchFilters.size && product.specs["Ebat"] !== searchFilters.size) return false;
    if (searchFilters.minPrice && parseFloat(product.price) < parseFloat(searchFilters.minPrice)) return false;
    if (searchFilters.maxPrice && parseFloat(product.price) > parseFloat(searchFilters.maxPrice)) return false;
    if (searchFilters.loadIndex && product.specs["Yük İndeksi"] !== searchFilters.loadIndex) return false;
    if (searchFilters.speedIndex && product.specs["Hız Sembolü"] !== searchFilters.speedIndex) return false;
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
      {/* Arama Butonu */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className={`fixed right-4 top-1/2 transform -translate-y-1/2 bg-primary text-white p-3 rounded-l-lg shadow-lg hover:bg-red-600 transition-all duration-300 z-50 ${
          isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <MagnifyingGlassIcon className="h-6 w-6" />
      </button>

      {/* Arama Paneli */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-80 bg-dark-300 p-6 shadow-xl z-40"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Filtrele</h2>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="bg-primary text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Marka Filtresi */}
              <div>
                <label className="block text-gray-300 mb-2">Marka</label>
                <select
                  value={searchFilters.brand}
                  onChange={(e) => setSearchFilters({ ...searchFilters, brand: e.target.value })}
                  className="w-full bg-dark-200 text-white rounded-md p-2"
                >
                  <option value="">Tüm Markalar</option>
                  {Array.from(new Set(products.map(p => p.brand))).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Lastik Ölçüsü */}
              <div>
                <label className="block text-gray-300 mb-2">Lastik Ölçüsü</label>
                <select
                  value={searchFilters.size}
                  onChange={(e) => setSearchFilters({ ...searchFilters, size: e.target.value })}
                  className="w-full bg-dark-200 text-white rounded-md p-2"
                >
                  <option value="">Tüm Ölçüler</option>
                  {Array.from(new Set(products.map(p => p.specs["Ebat"]))).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Fiyat Aralığı */}
              <div>
                <label className="block text-gray-300 mb-2">Fiyat Aralığı</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={searchFilters.minPrice}
                    onChange={(e) => setSearchFilters({ ...searchFilters, minPrice: e.target.value })}
                    className="w-1/2 bg-dark-200 text-white rounded-md p-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={searchFilters.maxPrice}
                    onChange={(e) => setSearchFilters({ ...searchFilters, maxPrice: e.target.value })}
                    className="w-1/2 bg-dark-200 text-white rounded-md p-2"
                  />
                </div>
              </div>

              {/* Yük İndeksi */}
              <div>
                <label className="block text-gray-300 mb-2">Yük İndeksi</label>
                <select
                  value={searchFilters.loadIndex}
                  onChange={(e) => setSearchFilters({ ...searchFilters, loadIndex: e.target.value })}
                  className="w-full bg-dark-200 text-white rounded-md p-2"
                >
                  <option value="">Tüm Yük İndeksleri</option>
                  {Array.from(new Set(products.map(p => p.specs["Yük İndeksi"]))).map(loadIndex => (
                    <option key={loadIndex} value={loadIndex}>{loadIndex}</option>
                  ))}
                </select>
              </div>

              {/* Hız İndeksi */}
              <div>
                <label className="block text-gray-300 mb-2">Hız İndeksi</label>
                <select
                  value={searchFilters.speedIndex}
                  onChange={(e) => setSearchFilters({ ...searchFilters, speedIndex: e.target.value })}
                  className="w-full bg-dark-200 text-white rounded-md p-2"
                >
                  <option value="">Tüm Hız İndeksleri</option>
                  {Array.from(new Set(products.map(p => p.specs["Hız Sembolü"]))).map(speedIndex => (
                    <option key={speedIndex} value={speedIndex}>{speedIndex}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ürün Listesi Container */}
      <div 
        className={`container mx-auto px-4 py-8 transition-all duration-300 ${
          isSearchOpen ? 'pr-80' : ''
        }`}
      >
        <h1 className="text-3xl font-bold text-white mb-8">Ürünlerimiz</h1>

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
              <div className="relative h-48 bg-gray-800">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg'; // Varsayılan resim
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-gray-400 mb-2">{product.brand}</p>
                <p className="text-primary text-xl font-bold mb-4">{product.price}</p>
                
                {/* Ürün Özellikleri */}
                <div className="text-sm text-gray-400 space-y-1">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>

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