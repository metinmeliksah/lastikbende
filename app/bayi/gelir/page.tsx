'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useBayi } from '../../contexts/BayiContext';
import { 
  CircleDollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Calendar,
  BarChart3
} from 'lucide-react';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface GelirData {
  toplamGelir: number;
  aylikGelir: number;
  gunlukGelir: number;
  tamamlananSiparis: number;
  aylikSiparis: number;
  gunlukSiparis: number;
}

interface GrafikVeri {
  tarih: string;
  gelir: number;
}

export default function GelirPage() {
  const { bayiData, loading: bayiLoading } = useBayi();
  const [gelirData, setGelirData] = useState<GelirData>({
    toplamGelir: 0,
    aylikGelir: 0,
    gunlukGelir: 0,
    tamamlananSiparis: 0,
    aylikSiparis: 0,
    gunlukSiparis: 0
  });
  const [grafikVerileri, setGrafikVerileri] = useState<GrafikVeri[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bayiLoading && bayiData?.bayi_id) {
      fetchGelirVerileri(bayiData.bayi_id);
      fetchGrafikVerileri(bayiData.bayi_id);
    }
  }, [bayiLoading, bayiData]);

  const fetchGelirVerileri = async (bayiId: number) => {
    try {
      const { data: siparisler, error } = await supabase
        .from('siparis')
        .select('*')
        .eq('magaza_id', bayiId);

      if (error) throw error;

      const bugun = new Date();
      const bugunBaslangic = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
      const ayBaslangic = new Date(bugun.getFullYear(), bugun.getMonth(), 1);

      const gelirHesapla = siparisler.reduce((acc: GelirData, siparis: any) => {
        const siparisTarihi = new Date(siparis.created_at);
        const siparisTutari = siparis.genel_toplam || 0;

        if (siparis.durum === 'siparis_tamamlandi') {
          acc.toplamGelir += siparisTutari;
          acc.tamamlananSiparis += 1;

          if (siparisTarihi >= ayBaslangic) {
            acc.aylikGelir += siparisTutari;
            acc.aylikSiparis += 1;
          }

          if (siparisTarihi >= bugunBaslangic) {
            acc.gunlukGelir += siparisTutari;
            acc.gunlukSiparis += 1;
          }
        }

        return acc;
      }, {
        toplamGelir: 0,
        aylikGelir: 0,
        gunlukGelir: 0,
        tamamlananSiparis: 0,
        aylikSiparis: 0,
        gunlukSiparis: 0
      });

      setGelirData(gelirHesapla);
    } catch (error) {
      console.error('Gelir verileri yüklenirken hata:', error);
    }
  };

  const fetchGrafikVerileri = async (bayiId: number) => {
    try {
      const { data: siparisler, error } = await supabase
        .from('siparis')
        .select('created_at, genel_toplam')
        .eq('magaza_id', bayiId)
        .eq('durum', 'siparis_tamamlandi')
        .gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString())
        .lte('created_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const veriler = siparisler.reduce((acc: { [key: string]: GrafikVeri }, siparis) => {
        const tarih = new Date(siparis.created_at);
        const ay = `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, '0')}`;

        if (!acc[ay]) {
          acc[ay] = { tarih: ay, gelir: 0 };
        }

        acc[ay].gelir += siparis.genel_toplam || 0;

        return acc;
      }, {});

      const sonVeriler = Object.values(veriler);
      setGrafikVerileri(sonVeriler);
    } catch (error) {
      console.error('Grafik verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatParaBirimi = (tutar: number) => {
    return tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺';
  };

  const formatTarih = (tarih: string) => {
    const [yil, ay] = tarih.split('-');
    const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${aylar[parseInt(ay) - 1]} ${yil}`;
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gelir Takibi</h1>
      </div>

      {/* Gelir Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Toplam Gelir */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <CircleDollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xl font-bold text-purple-600">{formatParaBirimi(gelirData.toplamGelir)}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Toplam Gelir</h3>
          <p className="text-xs text-gray-400 mt-1">{gelirData.tamamlananSiparis} Tamamlanan Sipariş</p>
        </div>

        {/* Aylık Gelir */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-blue-600">{formatParaBirimi(gelirData.aylikGelir)}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Aylık Gelir</h3>
          <p className="text-xs text-gray-400 mt-1">{gelirData.aylikSiparis} Sipariş Bu Ay</p>
        </div>

        {/* Günlük Gelir */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xl font-bold text-green-600">{formatParaBirimi(gelirData.gunlukGelir)}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Günlük Gelir</h3>
          <p className="text-xs text-gray-400 mt-1">{gelirData.gunlukSiparis} Sipariş Bugün</p>
        </div>
      </div>

      {/* Grafik Bölümü */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Aylık Gelir Analizi</h2>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-[600px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="relative h-[600px]">
              {/* Sağ Barem - Gelir */}
              <div className="absolute right-0 top-0 bottom-16 w-40 flex flex-col justify-between text-sm text-gray-500">
                {[...Array(6)].map((_, i) => {
                  const maxGelir = Math.max(...grafikVerileri.map(v => v.gelir));
                  const value = Math.round((maxGelir / 5) * (5 - i));
                  const topPosition = (i * 520) / 5;
                  return (
                    <div key={i} className="absolute right-0 flex items-center" style={{ top: `${topPosition}px` }}>
                      <div className="w-2 border-t border-gray-200"></div>
                      <span className="ml-2">{formatParaBirimi(value)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Grafik */}
              <div className="mr-40 ml-8 h-full">
                <div className="h-[520px] flex items-end">
                  <div className="flex-1 flex items-end justify-between relative">
                    {grafikVerileri.map((veri, index) => (
                      <div key={index} className="group relative flex items-end">
                        {/* Gelir çubuğu */}
                        <div className="relative">
                          <div
                            className="w-16 bg-purple-500 rounded-t transition-all duration-300"
                            style={{
                              height: `${(veri.gelir / Math.max(...grafikVerileri.map(v => v.gelir))) * 520}px`,
                              minHeight: '2px'
                            }}
                          ></div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-sm rounded py-2 px-3 absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                            {formatParaBirimi(veri.gelir)}
                          </div>
                        </div>

                        {/* Tarih etiketi */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 whitespace-nowrap">
                          {formatTarih(veri.tarih)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-600">Gelir</span>
            </div>
          </div>
        </div>
      </div>

      {/* Yükleniyor Durumu */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Gelir verileri yükleniyor...</p>
        </div>
      )}
    </div>
  );
} 