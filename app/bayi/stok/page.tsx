'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useBayi } from '../../contexts/BayiContext';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Supabase bağlantı kontrolü
console.log('Supabase Bağlantı Bilgileri:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Mevcut' : 'Eksik',
  anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Mevcut' : 'Eksik'
});

interface StokData {
  stok_id: any;
  urun_id: any;
  magaza_id: any;
  stok_adet: any;
  fiyat: any;
  indirimli_fiyat: any;
  saglik_durumu: any;
  guncellenme_tarihi: any;
  urundetay: {
    marka: any;
    model: any;
    mevsim: any;
    genislik_mm: any;
    profil: any;
    yapi: any;
    cap_inch: any;
  };
}

interface StokItem {
  stok_id: number;
  urun_id: number;
  magaza_id: number;
  stok_adet: number;
  fiyat: number;
  indirimli_fiyat: number | null;
  saglik_durumu: number;
  guncellenme_tarihi: string;
  urun: {
    marka: string;
    model: string;
    genislik_mm: number;
    profil: number;
    yapi: string;
    cap_inch: number;
    mevsim: string;
  };
}

interface UrunDetay {
  marka: string;
  model: string;
  mevsim: string;
}

export default function StokPage() {
  const { bayiData, loading: bayiLoading } = useBayi();
  const [stoklar, setStoklar] = useState<StokItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [duzenleModal, setDuzenleModal] = useState(false);
  const [secilenStok, setSecilenStok] = useState<StokItem | null>(null);
  const [formData, setFormData] = useState({
    stok_adet: 0,
    fiyat: 0,
    indirimli_fiyat: 0,
    saglik_durumu: 100
  });

  console.log('StokPage Bileşeni Yüklendi:', {
    bayiLoading,
    bayiMevcut: !!bayiData,
    bayiBilgileri: bayiData
  });

  useEffect(() => {
    if (!bayiLoading && bayiData?.bayi_id) {
      console.log('Stok verilerini yükleme başlıyor - Bayi ID:', bayiData.bayi_id);
      fetchStoklar(bayiData.bayi_id.toString());
    }
  }, [bayiLoading, bayiData]);

  const fetchStoklar = async (bayiId: string) => {
    console.log('fetchStoklar Fonksiyonu Başladı - Bayi ID:', bayiId);
    try {
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
            marka,
            model,
            mevsim,
            genislik_mm,
            profil,
            yapi,
            cap_inch
          )
        `)
        .eq('magaza_id', bayiId)
        .order('guncellenme_tarihi', { ascending: false });

      if (stokError) {
        console.log('HATA - Stok Sorgu Hatası:', stokError);
        throw stokError;
      }

      console.log('BAŞARILI - Stok verileri alındı:', {
        kayit_sayisi: stokData?.length || 0
      });

      if (!stokData) {
        console.log('BİLGİ - Stok verisi bulunamadı');
        setStoklar([]);
        return;
      }

      const formattedStoklar: StokItem[] = (stokData as unknown as StokData[]).map(stok => ({
        stok_id: Number(stok.stok_id),
        urun_id: Number(stok.urun_id),
        magaza_id: Number(stok.magaza_id),
        stok_adet: Number(stok.stok_adet),
        fiyat: Number(stok.fiyat),
        indirimli_fiyat: stok.indirimli_fiyat ? Number(stok.indirimli_fiyat) : null,
        saglik_durumu: Number(stok.saglik_durumu),
        guncellenme_tarihi: stok.guncellenme_tarihi,
        urun: {
          marka: String(stok.urundetay.marka),
          model: String(stok.urundetay.model),
          mevsim: String(stok.urundetay.mevsim),
          genislik_mm: Number(stok.urundetay.genislik_mm),
          profil: Number(stok.urundetay.profil),
          yapi: String(stok.urundetay.yapi),
          cap_inch: Number(stok.urundetay.cap_inch)
        }
      }));

      setStoklar(formattedStoklar);
    } catch (error) {
      console.log('KRİTİK HATA:', error);
      setStoklar([]);
    } finally {
      setLoading(false);
    }
  };

  const formatEbat = (urun: any) => {
    if (!urun) return '';
    return `${urun.genislik_mm}/${urun.profil}${urun.yapi}${urun.cap_inch}`;
  };

  const handleDuzenle = (stok: StokItem) => {
    setSecilenStok(stok);
    setFormData({
      stok_adet: stok.stok_adet,
      fiyat: stok.fiyat,
      indirimli_fiyat: stok.indirimli_fiyat || 0,
      saglik_durumu: stok.saglik_durumu
    });
    setDuzenleModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secilenStok) return;

    try {
      const { error } = await supabase
        .from('stok')
        .update({
          stok_adet: formData.stok_adet,
          fiyat: formData.fiyat,
          indirimli_fiyat: formData.indirimli_fiyat || null,
          saglik_durumu: formData.saglik_durumu,
          guncellenme_tarihi: new Date().toISOString()
        })
        .eq('stok_id', secilenStok.stok_id);

      if (error) throw error;

      setDuzenleModal(false);
      fetchStoklar(secilenStok.magaza_id.toString());
    } catch (error) {
      console.error('Stok güncellenirken hata:', error);
      alert('Stok güncellenirken bir hata oluştu.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Stok Durumu</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="w-48 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
                <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ebat</th>
                <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mevsim</th>
                <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İnd. Fiyat</th>
                <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sağlık</th>
                <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="w-36 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Güncelleme</th>
                <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-3 py-4 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : stoklar.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-4 text-center text-gray-500">
                    Henüz stok kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                stoklar.map((stok) => (
                  <tr key={stok.stok_id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{stok.stok_id}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                      {stok.urun.marka} {stok.urun.model}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                      {stok.urun.genislik_mm}/{stok.urun.profil}{stok.urun.yapi}{stok.urun.cap_inch}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        stok.urun.mevsim === 'Yaz' 
                          ? 'bg-green-100 text-green-700' 
                          : stok.urun.mevsim === 'Kış' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                      }`}>
                        {stok.urun.mevsim}
                      </span>
                  </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">{stok.fiyat.toLocaleString('tr-TR')} ₺</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                      {stok.indirimli_fiyat ? `${stok.indirimli_fiyat.toLocaleString('tr-TR')} ₺` : '-'}
                  </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        stok.saglik_durumu >= 80 
                          ? 'bg-green-100 text-green-700' 
                          : stok.saglik_durumu >= 60 
                            ? 'bg-yellow-100 text-yellow-700'
                            : stok.saglik_durumu >= 40
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                      }`}>
                        %{stok.saglik_durumu}
                    </span>
                  </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">{stok.stok_adet}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(stok.guncellenme_tarihi).toLocaleString('tr-TR')}
                  </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleDuzenle(stok)}
                        className="inline-flex items-center px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Düzenle
                      </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          </div>
          
      {/* Düzenleme Modal */}
      {duzenleModal && secilenStok && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Stok Düzenle</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="stok_adet" className="block text-sm font-medium text-gray-700 mb-1">
                  Stok Adedi
                </label>
                <input
                  type="number"
                  id="stok_adet"
                  value={formData.stok_adet}
                  onChange={(e) => setFormData(prev => ({ ...prev, stok_adet: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="fiyat" className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat
                </label>
                <input
                  type="number"
                  id="fiyat"
                  value={formData.fiyat}
                  onChange={(e) => setFormData(prev => ({ ...prev, fiyat: parseFloat(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="indirimli_fiyat" className="block text-sm font-medium text-gray-700 mb-1">
                  İndirimli Fiyat
                </label>
                <input
                  type="number"
                  id="indirimli_fiyat"
                  value={formData.indirimli_fiyat}
                  onChange={(e) => setFormData(prev => ({ ...prev, indirimli_fiyat: parseFloat(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="saglik_durumu" className="block text-sm font-medium text-gray-700 mb-1">
                  Sağlık Durumu (0-100)
                </label>
                <input
                  type="number"
                  id="saglik_durumu"
                  min="0"
                  max="100"
                  value={formData.saglik_durumu}
                  onChange={(e) => setFormData(prev => ({ ...prev, saglik_durumu: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDuzenleModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 