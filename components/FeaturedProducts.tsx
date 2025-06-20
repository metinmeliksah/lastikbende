'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaShoppingCart } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'

// Supabase client oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Ürün veri tipi tanımla
interface Product {
  urun_id: number;
  stok_id: number;
  model: string;
  marka: string;
  cap_inch: string;
  mevsim: string;
  saglik_durumu: number;
  urun_resmi_0: string;
  stok: number;
  magaza_id: number;
  magaza_isim: string;
  magaza_sehir: string;
  fiyat: number;
  indirimli_fiyat: number;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verileri Supabase'den çek
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // ✅ DÜZELTME 1: Tek sorguda tüm verileri çek (N+1 sorgu problemini çöz)
        const { data: stokData, error: stokError } = await supabase
          .from('stok')
          .select(`
            stok_id,
            urun_id,
            magaza_id,
            stok_adet,
            fiyat,
            indirimli_fiyat,
            saglik_durumu,
            guncellenme_tarihi,
            urundetay!inner (
              model,
              marka,
              cap_inch,
              mevsim,
              urun_resmi_0
            ),
            sellers!inner (
              id,
              isim,
              sehir
            )
          `)
          .order('guncellenme_tarihi', { ascending: false })
          .limit(4);

        if (stokError) {
          console.error('Stok verisi çekilirken hata oluştu:', stokError);
          setError('Ürünler yüklenirken bir hata oluştu.');
          return;
        }
        
        if (!stokData || stokData.length === 0) {
          console.log('Ürün verisi bulunamadı');
          setProducts([]);
          return;
        }

        // ✅ DÜZELTME 2: Veri işleme ve null kontrolleri
        const productData: Product[] = stokData
          .filter(stok => stok.urundetay && stok.sellers) // Null kontrolleri
          .map(stok => ({
            urun_id: stok.urun_id,
            stok_id: stok.stok_id,
            model: (stok.urundetay as any)?.model || "İsimsiz Ürün",
            marka: (stok.urundetay as any)?.marka || "Bilinmiyor",
            cap_inch: (stok.urundetay as any)?.cap_inch || "",
            mevsim: (stok.urundetay as any)?.mevsim || "Belirtilmemiş",
            saglik_durumu: stok.saglik_durumu || 0,
            urun_resmi_0: (stok.urundetay as any)?.urun_resmi_0 || "/images/placeholder-tire.svg",
            stok: stok.stok_adet || 0,
            magaza_id: stok.magaza_id,
            magaza_isim: (stok.sellers as any)?.isim || "Bilinmiyor",
            magaza_sehir: (stok.sellers as any)?.sehir || "Belirtilmemiş",
            fiyat: stok.fiyat || 0,
            indirimli_fiyat: stok.indirimli_fiyat || stok.fiyat || 0
          }));

        setProducts(productData);
      } catch (error) {
        console.error('Öne çıkan ürünler çekilirken hata oluştu:', error);
        setError('Ürünler yüklenirken beklenmeyen bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Sepete ekleme işlemi
  const handleAddToCart = (product: Product) => {
    // TODO: Gerçek sepet entegrasyonu yapılacak
    alert(`${product.model} sepete eklendi.`);
  };

  // Lastik sağlık durumu renklendirmesi
  const getHealthColor = (health: number) => {
    if (health === 100) return 'bg-green-500 text-white';
    if (health >= 70) return 'bg-green-500 text-white';
    if (health >= 40) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <section className="py-16 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Öne Çıkan Ürünler</h2>
          <p className="text-gray-400">En son eklenen lastik modelleri</p>
        </div>

        {loading ? (
          <div className="bg-dark-300 rounded-lg p-6 text-center border border-dark-100">
            <h3 className="text-xl text-gray-200 mb-2">Ürünler Yükleniyor...</h3>
            <p className="text-gray-400">Lütfen bekleyin, ürünler yükleniyor.</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <h3 className="text-xl text-red-400 mb-2">Hata Oluştu</h3>
            <p className="text-red-300">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-dark-300 rounded-lg p-6 text-center border border-dark-100">
            <h3 className="text-xl text-gray-200 mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-400">Şu anda öne çıkan ürün bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <motion.div
                key={`${product.stok_id}-${product.urun_id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-dark-300 rounded-lg overflow-hidden border border-dark-100 transition-transform hover:transform hover:scale-[1.01] flex flex-col h-full"
              >
                <div className="relative">
                  <Link href={`/urun-detay/${product.urun_id}`}>
                    <div className="h-48 bg-gray-700 flex items-center justify-center">
                      <Image
                        src={product.urun_resmi_0}
                        alt={product.model}
                        width={200}
                        height={200}
                        className="object-contain max-w-full max-h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/placeholder-tire.svg";
                        }}
                      />
                    </div>
                  </Link>
                  <div className={`absolute top-2 left-2 ${getHealthColor(product.saglik_durumu)} px-2 py-1 rounded text-xs`}>
                    {product.saglik_durumu === 100 ? 'Sıfır' : `%${product.saglik_durumu}`}
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/urun-detay/${product.urun_id}`}>
                      <h3 className="text-lg font-medium text-white hover:text-primary transition-colors">
                        {product.model}
                      </h3>
                    </Link>
                    <span className="bg-primary px-2 py-1 rounded text-xs text-white">
                      {product.marka}
                    </span>
                  </div>
                  
                  <div className="mb-2 text-sm text-gray-400 h-6">
                    {product.cap_inch} inç | {product.mevsim}
                  </div>
                  
                  <div className="mb-3 h-14">
                    <div className="text-gray-300 text-sm truncate">
                      {product.magaza_isim}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {product.magaza_sehir}
                    </div>
                  </div>
                  
                  <div className="flex items-baseline mb-3">
                    {Number(product.indirimli_fiyat) !== Number(product.fiyat) ? (
                      <>
                        <span className="text-xl font-bold text-white mr-2">
                          {product.indirimli_fiyat}₺
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {product.fiyat}₺
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-white">
                        {product.indirimli_fiyat}₺
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${product.stok > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {product.stok > 0 ? 'Stokta' : 'Tükendi'}
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          href={`/urun-detay/${product.urun_id}`}
                          className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm transition-colors"
                        >
                          Detaylar
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center ${product.stok <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={product.stok <= 0}
                        >
                          <FaShoppingCart className="mr-1" />
                          <span>Sepete Ekle</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
} 