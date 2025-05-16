'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface UrunDetay {
  urun_id: number;
  marka: string;
  model: string;
  genislik_mm: number;
  profil: number;
  yapi: string;
  cap_inch: number;
  mevsim: string;
}

export default function StokEklePage({ params }: { params: { urunId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [urun, setUrun] = useState<UrunDetay | null>(null);
  const [formData, setFormData] = useState({
    stok_adet: '',
    fiyat: '',
    indirimli_fiyat: '',
    saglik_durumu: '100'
  });

  useEffect(() => {
    fetchUrunDetay();
  }, [params.urunId]);

  const fetchUrunDetay = async () => {
    try {
      const { data, error } = await supabase
        .from('urundetay')
        .select('*')
        .eq('urun_id', params.urunId)
        .single();

      if (error) throw error;
      setUrun(data);
    } catch (error) {
      console.error('Ürün detayları yüklenirken hata:', error);
      router.push('/bayi/lastikler');
    }
  };

  const formatEbat = (urun: UrunDetay) => {
    return `${urun.genislik_mm}/${urun.profil}${urun.yapi}${urun.cap_inch}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { data: magazaData } = await supabase
        .from('magazalar')
        .select('magaza_id')
        .eq('user_id', user.id)
        .single();

      if (!magazaData) throw new Error('Mağaza bulunamadı');

      const { error } = await supabase
        .from('stok')
        .insert([{
          urun_id: parseInt(params.urunId),
          magaza_id: magazaData.magaza_id,
          stok_adet: parseInt(formData.stok_adet),
          fiyat: parseFloat(formData.fiyat),
          indirimli_fiyat: formData.indirimli_fiyat ? parseFloat(formData.indirimli_fiyat) : null,
          saglik_durumu: parseInt(formData.saglik_durumu),
          guncellenme_tarihi: new Date().toISOString()
        }]);

      if (error) throw error;

      router.push('/bayi/stok');
      router.refresh();
    } catch (error) {
      console.error('Stok eklenirken hata:', error);
      alert('Stok eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!urun) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Stok Ekle</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ürün Bilgileri</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm text-gray-500">Marka</span>
              <span className="text-gray-900">{urun.marka}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Model</span>
              <span className="text-gray-900">{urun.model}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Ebat</span>
              <span className="text-gray-900">{formatEbat(urun)}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Mevsim</span>
              <span className="text-gray-900">{urun.mevsim}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="stok_adet" className="block text-sm font-medium text-gray-700 mb-1">
                Stok Adedi
              </label>
              <input
                type="number"
                id="stok_adet"
                value={formData.stok_adet}
                onChange={(e) => setFormData(prev => ({ ...prev, stok_adet: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, fiyat: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="indirimli_fiyat" className="block text-sm font-medium text-gray-700 mb-1">
                İndirimli Fiyat (Opsiyonel)
              </label>
              <input
                type="number"
                id="indirimli_fiyat"
                value={formData.indirimli_fiyat}
                onChange={(e) => setFormData(prev => ({ ...prev, indirimli_fiyat: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, saglik_durumu: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 