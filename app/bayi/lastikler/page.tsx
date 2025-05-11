'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { EyeIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Lastik {
  urun_id: number;
  marka: string;
  model: string;
  genislik_mm: number;
  profil: number;
  yapi: string;
  cap_inch: number;
  yuk_endeksi: string;
  hiz_endeksi: string;
  mevsim: string;
  aciklama: string | null;
  urun_resmi_0: string | null;
  urun_resmi_1: string | null;
  urun_resmi_2: string | null;
  urun_resmi_3: string | null;
}

export default function LastiklerPage() {
  const [lastikler, setLastikler] = useState<Lastik[]>([]);
  const [loading, setLoading] = useState(true);
  const [detayModal, setDetayModal] = useState(false);
  const [secilenLastik, setSecilenLastik] = useState<Lastik | null>(null);

  useEffect(() => {
    fetchLastikler();
  }, []);

  const fetchLastikler = async () => {
    try {
      const { data, error } = await supabase
        .from('urundetay')
        .select('*')
        .order('urun_id', { ascending: true });

      if (error) throw error;
      setLastikler(data || []);
    } catch (error) {
      console.error('Lastikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEbat = (lastik: Lastik) => {
    return `${lastik.genislik_mm}/${lastik.profil}${lastik.yapi}${lastik.cap_inch}`;
  };

  const handleDetay = (lastik: Lastik) => {
    setSecilenLastik(lastik);
    setDetayModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lastikler</h1>
        <Link
          href="/bayi/lastik-ekle"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Yeni Lastik</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marka</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ebat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yük Endeksi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hız Endeksi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mevsim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : lastikler.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Henüz lastik eklenmemiş.
                  </td>
                </tr>
              ) : (
                lastikler.map((lastik) => (
                  <tr key={lastik.urun_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lastik.urun_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lastik.marka}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lastik.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatEbat(lastik)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lastik.yuk_endeksi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lastik.hiz_endeksi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        lastik.mevsim === 'Yaz' 
                          ? 'bg-green-100 text-green-700' 
                          : lastik.mevsim === 'Kış' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                      }`}>
                        {lastik.mevsim}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleDetay(lastik)}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Detaylar
                      </button>
                      <Link
                        href={`/bayi/stok-ekle/${lastik.urun_id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Stok Ekle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detay Modal */}
      {detayModal && secilenLastik && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Lastik Detayları</h2>
              <button
                onClick={() => setDetayModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="block text-sm text-gray-500">Marka</span>
                <span className="text-gray-900">{secilenLastik.marka}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Model</span>
                <span className="text-gray-900">{secilenLastik.model}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Ebat</span>
                <span className="text-gray-900">{formatEbat(secilenLastik)}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Mevsim</span>
                <span className="text-gray-900">{secilenLastik.mevsim}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Yük Endeksi</span>
                <span className="text-gray-900">{secilenLastik.yuk_endeksi}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Hız Endeksi</span>
                <span className="text-gray-900">{secilenLastik.hiz_endeksi}</span>
              </div>
            </div>

            {secilenLastik.aciklama && (
              <div className="mb-6">
                <span className="block text-sm font-medium text-gray-700 mb-2">Açıklama</span>
                <p className="text-gray-600 whitespace-pre-wrap">{secilenLastik.aciklama}</p>
              </div>
            )}

            <div className="mb-6">
              <span className="block text-sm font-medium text-gray-700 mb-2">Ürün Resimleri</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  secilenLastik.urun_resmi_0,
                  secilenLastik.urun_resmi_1,
                  secilenLastik.urun_resmi_2,
                  secilenLastik.urun_resmi_3
                ].map((resim, index) => (
                  resim && (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={resim}
                        alt={`${secilenLastik.marka} ${secilenLastik.model} - Resim ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setDetayModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 