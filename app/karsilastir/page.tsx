'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaShoppingCart, FaHome, FaChevronLeft } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import { useCart } from '@/contexts/CartContext';

// Supabase client oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Ürün veri tipi tanımla
interface Product {
  urun_id: number;
  model: string;
  marka: string;
  cap_inch: string;
  mevsim: string;
  saglik_durumu: number;
  genislik_mm: string;
  profil: string;
  yapi: string;
  yuk_endeksi: string;
  hiz_endeksi: string;
  urun_resmi_0: string;
  stok: number;
  fiyat: number;
  indirimli_fiyat: number;
  magaza_isim: string;
  magaza_sehir: string;
}

export default function KarsilastirPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      // URL'den ürün ID'lerini al
      const ids = searchParams.get('ids');
      
      if (!ids) {
        setError('Karşılaştırılacak ürün bulunamadı.');
        setLoading(false);
        return;
      }
      
      const idArray = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
      if (idArray.length < 2) {
        setError('Karşılaştırma yapmak için en az 2 ürün seçmelisiniz.');
        setLoading(false);
        return;
      }
      
      try {
        // Seçilen ürünlerin bilgilerini çek
        const productPromises = idArray.map(async (id) => {
          // Ürün bilgilerini çek
          const { data: urunData, error: urunError } = await supabase
            .from('urundetay')
            .select('*')
            .eq('urun_id', id)
            .single();
          
          if (urunError || !urunData) {
            console.error(`Ürün ID ${id} bulunamadı:`, urunError);
            return null;
          }
          
          // Stok bilgisini çek
          const { data: stokData, error: stokError } = await supabase
            .from('stok')
            .select('*')
            .eq('urun_id', id)
            .limit(1);
            
          if (stokError || !stokData || stokData.length === 0) {
            console.error(`Stok bilgisi ID ${id} bulunamadı:`, stokError);
            return null;
          }
          
          const stok = stokData[0];
          
          // Mağaza bilgisini çek
          const { data: magazaData, error: magazaError } = await supabase
            .from('sellers')
            .select('isim, sehir')
            .eq('id', stok.magaza_id)
            .single();
            
          if (magazaError || !magazaData) {
            console.error(`Mağaza bilgisi ID ${stok.magaza_id} bulunamadı:`, magazaError);
            return null;
          }
          
          // Tüm bilgileri birleştir
          return {
            urun_id: urunData.urun_id,
            model: urunData.model,
            marka: urunData.marka,
            cap_inch: urunData.cap_inch,
            mevsim: urunData.mevsim,
            saglik_durumu: stok.saglik_durumu,
            genislik_mm: urunData.genislik_mm,
            profil: urunData.profil,
            yapi: urunData.yapi,
            yuk_endeksi: urunData.yuk_endeksi,
            hiz_endeksi: urunData.hiz_endeksi,
            urun_resmi_0: urunData.urun_resmi_0,
            stok: stok.stok_adet,
            fiyat: stok.fiyat,
            indirimli_fiyat: stok.indirimli_fiyat || stok.fiyat,
            magaza_isim: magazaData.isim,
            magaza_sehir: magazaData.sehir
          };
        });
        
        const productResults = await Promise.all(productPromises);
        const validProducts = productResults.filter(product => product !== null) as Product[];
        
        if (validProducts.length < 2) {
          setError('Karşılaştırma için yeterli ürün bulunamadı. Lütfen en az 2 ürün seçin.');
          setProducts([]);
        } else {
          setProducts(validProducts);
        }
      } catch (err) {
        console.error('Ürünler çekilirken hata oluştu:', err);
        setError('Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchParams]);

  // Sağlık durumu renklendirmesi
  const getHealthColor = (health: number) => {
    if (health === 100) return 'bg-green-500 text-white'; // Sıfır için yeşil
    if (health >= 70) return 'bg-green-500 text-white'; // İyi durum için yeşil
    if (health >= 40) return 'bg-yellow-500 text-white'; // Orta durum için sarı
    return 'bg-red-500 text-white'; // Kötü durum için kırmızı
  };

  // Sepete ekleme işlemi
  const handleAddToCart = (product: Product) => {
    addToCart(
      {
        id: product.urun_id,
        model: product.model,
        genislik_mm: Number(product.genislik_mm),
        profil: Number(product.profil),
        cap_inch: Number(product.cap_inch),
        urun_resmi_0: product.urun_resmi_0
      },
      {
        id: product.magaza_id,
        name: product.magaza_isim,
        city: product.magaza_sehir
      },
      1
    );
  };

  return (
    <div className="min-h-screen pt-20 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Ürün Karşılaştırma</h1>
          <div className="flex space-x-4">
            <Link href="/urunler" className="flex items-center text-gray-300 hover:text-primary">
              <FaChevronLeft className="mr-1" />
              Ürünlere Dön
            </Link>
            <Link href="/" className="flex items-center text-gray-300 hover:text-primary">
              <FaHome className="mr-1" />
              Ana Sayfa
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-dark-300 rounded-lg p-6 text-center border border-dark-100">
            <h3 className="text-xl text-gray-200 mb-2">Ürünler Yükleniyor...</h3>
            <p className="text-gray-400">
              Lütfen bekleyin, karşılaştırma için ürünler yükleniyor.
            </p>
          </div>
        ) : error ? (
          <div className="bg-dark-300 rounded-lg p-6 text-center border border-dark-100">
            <h3 className="text-xl text-gray-200 mb-2">Hata</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Link 
              href="/urunler" 
              className="inline-block bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
            >
              Ürünlere Dön
            </Link>
          </div>
        ) : (
          <div className="bg-dark-300 rounded-lg border border-dark-100 overflow-hidden">
            <div className="min-w-max">
              <table className="w-full">
                <thead className="bg-dark-200">
                  <tr>
                    <th className="p-4 text-left text-white font-semibold w-1/5">Özellik</th>
                    {products.map(product => (
                      <th key={product.urun_id} className="p-4 text-center text-white font-semibold">
                        <div className="flex flex-col items-center">
                          <div className="relative h-40 w-40 mx-auto mb-4">
                            <Image
                              src={product.urun_resmi_0 || '/placeholder-tire.jpg'}
                              alt={product.model}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <Link href={`/urun-detay/${product.urun_id}`} className="text-lg hover:text-primary mb-1">
                            {product.model}
                          </Link>
                          <span className="text-sm bg-primary px-2 py-1 rounded text-white mb-2">
                            {product.marka}
                          </span>
                          <span className={`text-xs ${getHealthColor(product.saglik_durumu)} px-2 py-1 rounded`}>
                            {product.saglik_durumu === 100 ? 'Sıfır' : `%${product.saglik_durumu}`}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  <tr className="bg-dark-300 hover:bg-dark-400">
                    <td className="p-4 text-gray-300 font-medium">Fiyat</td>
                    {products.map(product => (
                      <td key={`${product.urun_id}-price`} className="p-4 text-center">
                        {product.indirimli_fiyat !== product.fiyat ? (
                          <div>
                            <span className="text-lg font-bold text-white block">
                              {product.indirimli_fiyat}₺
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {product.fiyat}₺
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-white">
                            {product.fiyat}₺
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-dark-300 hover:bg-dark-400">
                    <td className="p-4 text-gray-300 font-medium">Mağaza</td>
                    {products.map(product => (
                      <td key={`${product.urun_id}-store`} className="p-4 text-center">
                        <div className="text-white">{product.magaza_isim}</div>
                        <div className="text-gray-400 text-sm">{product.magaza_sehir}</div>
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-dark-300 hover:bg-dark-400">
                    <td className="p-4 text-gray-300 font-medium">Stok Durumu</td>
                    {products.map(product => (
                      <td key={`${product.urun_id}-stock`} className="p-4 text-center">
                        <span className={`text-sm ${product.stok > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {product.stok > 0 ? `${product.stok} Adet Stokta` : 'Tükendi'}
                        </span>
                      </td>
                    ))}
                  </tr>
 
                  <tr className="bg-dark-300 hover:bg-dark-400">
                    <td className="p-4 text-gray-300 font-medium">Boyut</td>
                    {products.map(product => (
                      <td key={`${product.urun_id}-size`} className="p-4 text-center text-white">
                        {product.genislik_mm}/{product.profil} R{product.cap_inch}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-dark-300 hover:bg-dark-400">
                    <td className="p-4 text-gray-300 font-medium">Mevsim</td>
                    {products.map(product => (
                      <td key={`${product.urun_id}-season`} className="p-4 text-center text-white">
                        {product.mevsim}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-dark-300 hover:bg-dark-400">
                    <td className="p-4 text-gray-300 font-medium">Yapı</td>
                    {products.map(product => (
                      <td key={`${product.urun_id}-construction`} className="p-4 text-center text-white">
                        {product.yapi}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-dark-300 hover:bg-dark-400">
                    <td className="p-4 text-gray-300 font-medium">Yük Endeksi</td>
                    {products.map(product => (
                      <td key={`${product.urun_id}-load`} className="p-4 text-center text-white">
                        {product.yuk_endeksi}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-dark-300 hover:bg-dark-400">
                    <td className="p-4 text-gray-300 font-medium">Hız Endeksi</td>
                    {products.map(product => (
                      <td key={`${product.urun_id}-speed`} className="p-4 text-center text-white">
                        {product.hiz_endeksi}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-dark-300 hover:bg-dark-400">
                    <td className="p-4 text-gray-300 font-medium">İşlemler</td>
                    {products.map(product => (
                      <td key={`${product.urun_id}-actions`} className="p-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <Link
                            href={`/urun-detay/${product.urun_id}`}
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
                          >
                            Detaylar
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors flex items-center ${product.stok <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={product.stok <= 0}
                          >
                            <FaShoppingCart className="mr-2" />
                            <span>Sepete Ekle</span>
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 