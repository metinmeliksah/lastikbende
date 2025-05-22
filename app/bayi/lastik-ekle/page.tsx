'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { PhotoIcon } from '@heroicons/react/24/outline';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function LastikEklePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stokEkle, setStokEkle] = useState(false);
  const [formData, setFormData] = useState({
    marka: '',
    model: '',
    genislik_mm: '',
    profil: '',
    yapi: '',
    cap_inch: '',
    yuk_endeksi: '',
    hiz_endeksi: '',
    mevsim: 'Yaz',
    aciklama: '',
    stok_adet: '',
    fiyat: '',
    indirimli_fiyat: '',
    saglik_durumu: '100'
  });
  const [resimler, setResimler] = useState<File[]>([]);

  const handleResimSecimi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setResimler(prev => [...prev, ...files].slice(0, 4));
  };

  const handleResimKaldir = (index: number) => {
    setResimler(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Resimleri yükle
      const resimUrlleri = await Promise.all(
        resimler.map(async (resim) => {
          const dosyaAdi = `${Date.now()}-${resim.name}`;
          const { data, error } = await supabase.storage
            .from('urun-resimleri')
            .upload(dosyaAdi, resim);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('urun-resimleri')
            .getPublicUrl(dosyaAdi);

          return publicUrl;
        })
      );

      // Ürün detaylarını kaydet
      const { data: urunData, error: urunError } = await supabase
        .from('urundetay')
        .insert([{
          marka: formData.marka,
          model: formData.model,
          genislik_mm: parseInt(formData.genislik_mm),
          profil: parseInt(formData.profil),
          yapi: formData.yapi,
          cap_inch: parseInt(formData.cap_inch),
          yuk_endeksi: formData.yuk_endeksi,
          hiz_endeksi: formData.hiz_endeksi,
          mevsim: formData.mevsim,
          aciklama: formData.aciklama || null,
          urun_resmi_0: resimUrlleri[0] || null,
          urun_resmi_1: resimUrlleri[1] || null,
          urun_resmi_2: resimUrlleri[2] || null,
          urun_resmi_3: resimUrlleri[3] || null
        }])
        .select()
        .single();

      if (urunError) throw urunError;

      // Stok bilgisi girilmişse kaydet
      if (stokEkle && formData.stok_adet && formData.fiyat) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Kullanıcı bulunamadı');

        const { data: sellerData } = await supabase
          .from('sellers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!sellerData) throw new Error('Bayi bulunamadı');

        const { error: stokError } = await supabase
          .from('stok')
          .insert([{
            urun_id: urunData.urun_id,
            magaza_id: sellerData.id,
            stok_adet: parseInt(formData.stok_adet),
            fiyat: parseFloat(formData.fiyat),
            indirimli_fiyat: formData.indirimli_fiyat ? parseFloat(formData.indirimli_fiyat) : null,
            saglik_durumu: parseInt(formData.saglik_durumu),
            guncellenme_tarihi: new Date().toISOString()
          }]);

        if (stokError) throw stokError;
      }

      router.push('/bayi/lastikler');
      router.refresh();
    } catch (error) {
      console.error('Lastik eklenirken hata:', error);
      alert('Lastik eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Yeni Lastik Ekle</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Temel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="marka" className="block text-sm font-medium text-gray-700 mb-1">
                  Marka
              </label>
              <input
                type="text"
                id="marka"
                value={formData.marka}
                  onChange={(e) => setFormData(prev => ({ ...prev, marka: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Model
              </label>
              <input
                type="text"
                id="model"
                value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
                <label htmlFor="genislik_mm" className="block text-sm font-medium text-gray-700 mb-1">
                  Genişlik (mm)
              </label>
              <input
                  type="number"
                  id="genislik_mm"
                  value={formData.genislik_mm}
                  onChange={(e) => setFormData(prev => ({ ...prev, genislik_mm: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
                <label htmlFor="profil" className="block text-sm font-medium text-gray-700 mb-1">
                  Profil
              </label>
              <input
                type="number"
                  id="profil"
                  value={formData.profil}
                  onChange={(e) => setFormData(prev => ({ ...prev, profil: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
                <label htmlFor="yapi" className="block text-sm font-medium text-gray-700 mb-1">
                  Yapı
              </label>
              <input
                type="text"
                  id="yapi"
                  value={formData.yapi}
                  onChange={(e) => setFormData(prev => ({ ...prev, yapi: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
              />
            </div>
            <div>
                <label htmlFor="cap_inch" className="block text-sm font-medium text-gray-700 mb-1">
                  Çap (inch)
              </label>
              <input
                  type="number"
                  id="cap_inch"
                  value={formData.cap_inch}
                  onChange={(e) => setFormData(prev => ({ ...prev, cap_inch: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
              />
            </div>
            <div>
                <label htmlFor="yuk_endeksi" className="block text-sm font-medium text-gray-700 mb-1">
                  Yük Endeksi
              </label>
              <input
                  type="text"
                  id="yuk_endeksi"
                  value={formData.yuk_endeksi}
                  onChange={(e) => setFormData(prev => ({ ...prev, yuk_endeksi: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
                <label htmlFor="hiz_endeksi" className="block text-sm font-medium text-gray-700 mb-1">
                  Hız Endeksi
              </label>
              <input
                  type="text"
                  id="hiz_endeksi"
                  value={formData.hiz_endeksi}
                  onChange={(e) => setFormData(prev => ({ ...prev, hiz_endeksi: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
                <label htmlFor="mevsim" className="block text-sm font-medium text-gray-700 mb-1">
                  Mevsim
              </label>
                <select
                  id="mevsim"
                  value={formData.mevsim}
                  onChange={(e) => setFormData(prev => ({ ...prev, mevsim: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="Yaz">Yaz</option>
                  <option value="Kış">Kış</option>
                  <option value="4 Mevsim">4 Mevsim</option>
                </select>
              </div>
            </div>
            </div>
            
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Açıklama</h2>
            <textarea
              id="aciklama"
              value={formData.aciklama}
              onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
              rows={6}
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ürün açıklaması..."
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ürün Resimleri</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
              {resimler.map((resim, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={URL.createObjectURL(resim)}
                    alt={`Resim ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleResimKaldir(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                  </div>
                ))}
              {resimler.length < 4 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500">
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Resim Ekle</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleResimSecimi}
                    className="hidden"
                  />
                </label>
                )}
              </div>
            <p className="text-sm text-gray-500">En fazla 4 adet resim yükleyebilirsiniz.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Stok Bilgisi</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={stokEkle}
                  onChange={(e) => setStokEkle(e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-600">Stok bilgisi ekle</span>
              </label>
            </div>
            
            {stokEkle && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
                  <label htmlFor="stok_adet" className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Adedi
              </label>
                  <input 
                    type="number"
                    id="stok_adet"
                    value={formData.stok_adet}
                    onChange={(e) => setFormData(prev => ({ ...prev, stok_adet: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required={stokEkle}
                  />
                </div>
                <div>
                  <label htmlFor="fiyat" className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat
                </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="fiyat"
                      value={formData.fiyat}
                      onChange={(e) => setFormData(prev => ({ ...prev, fiyat: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required={stokEkle}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                  </div>
              </div>
                <div>
                  <label htmlFor="indirimli_fiyat" className="block text-sm font-medium text-gray-700 mb-2">
                    İndirimli Fiyat (Opsiyonel)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="indirimli_fiyat"
                      value={formData.indirimli_fiyat}
                      onChange={(e) => setFormData(prev => ({ ...prev, indirimli_fiyat: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                  </div>
                    </div>
                <div>
                  <label htmlFor="saglik_durumu" className="block text-sm font-medium text-gray-700 mb-2">
                    Sağlık Durumu (0-100)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="saglik_durumu"
                      min="0"
                      max="100"
                      value={formData.saglik_durumu}
                      onChange={(e) => setFormData(prev => ({ ...prev, saglik_durumu: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required={stokEkle}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
              </div>
            )}
        </div>
        
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/bayi/lastikler')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            İptal
            </button>
          <button
            type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
} 