'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface FormData {
  marka: string;
  model: string;
  ebat: string;
  yil: string;
  mevsim: string;
  hizIndeksi: string;
  yukIndeksi: string;
  stok: string;
  fiyat: string;
  indirimli: string;
  ozellikler: string[];
}

export default function LastikEkleSayfasi() {
  const [formData, setFormData] = useState<FormData>({
    marka: '',
    model: '',
    ebat: '',
    yil: '',
    mevsim: 'Yaz',
    hizIndeksi: '',
    yukIndeksi: '',
    stok: '',
    fiyat: '',
    indirimli: '',
    ozellikler: []
  });

  const [yeniOzellik, setYeniOzellik] = useState('');
  const [resimler, setResimler] = useState<File[]>([]);
  const [onizlemeUrller, setOnizlemeUrller] = useState<string[]>([]);

  // Form değişiklik fonksiyonu
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Özellik ekleme
  const handleOzellikEkle = () => {
    if (yeniOzellik.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        ozellikler: [...prev.ozellikler, yeniOzellik.trim()]
      }));
      setYeniOzellik('');
    }
  };

  // Özellik silme
  const handleOzellikSil = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ozellikler: prev.ozellikler.filter((_, i) => i !== index)
    }));
  };

  // Resim yükleme
  const handleResimYukle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Dosyaları diziye çevir
      const yeniResimler = Array.from(e.target.files);
      
      // Önce state güncelle
      setResimler(prev => [...prev, ...yeniResimler]);
      
      // Önizleme URL'leri oluştur
      const yeniUrller = yeniResimler.map(file => URL.createObjectURL(file));
      setOnizlemeUrller(prev => [...prev, ...yeniUrller]);
      
      // Input'u sıfırla (aynı dosyayı tekrar seçebilmek için)
      e.target.value = '';
    }
  };

  // Resim silme
  const handleResimSil = (index: number) => {
    try {
      // İlgili URL'yi al
      const urlToRevoke = onizlemeUrller[index];
      
      // State'lerin kopyasını oluştur
      const yeniResimler = [...resimler];
      const yeniUrller = [...onizlemeUrller];
      
      // Kopyalardan ilgili öğeleri kaldır
      yeniResimler.splice(index, 1);
      yeniUrller.splice(index, 1);
      
      // State'leri güncelle
      setResimler(yeniResimler);
      setOnizlemeUrller(yeniUrller);
      
      // URL'yi güvenli bir şekilde serbest bırak
      if (urlToRevoke) {
        setTimeout(() => {
          try {
            URL.revokeObjectURL(urlToRevoke);
          } catch (err) {
            console.error("URL revokeObject hatası:", err);
          }
        }, 100);
      }
    } catch (err) {
      console.error("Resim silme işlemi sırasında hata:", err);
    }
  };

  // URL'leri temizle (component unmount olduğunda)
  useEffect(() => {
    return () => {
      // Tüm URL'leri temizle
      onizlemeUrller.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error("Cleanup URL error:", err);
        }
      });
    };
  }, [onizlemeUrller]);

  // Form gönderme
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Gönderilen veri:', formData);
    console.log('Yüklenen resimler:', resimler);
    
    // Burada API'ye gönderme işlemi yapılacak
    alert('Lastik başarıyla eklendi!');
    
    // Formu sıfırla
    setFormData({
      marka: '',
      model: '',
      ebat: '',
      yil: '',
      mevsim: 'Yaz',
      hizIndeksi: '',
      yukIndeksi: '',
      stok: '',
      fiyat: '',
      indirimli: '',
      ozellikler: []
    });
    setResimler([]);
    setOnizlemeUrller([]);
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/bayi/lastikler" 
            className="p-2 text-gray-500 hover:text-gray-700 bg-white rounded-lg border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Yeni Lastik Ekle</h1>
        </div>
        <button
          type="submit"
          form="lastik-form"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Save className="w-4 h-4" />
          <span>Kaydet</span>
        </button>
      </div>

      {/* Form */}
      <form id="lastik-form" onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sol Kolon */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-3">Temel Bilgiler</h2>
            
            {/* Marka */}
            <div>
              <label htmlFor="marka" className="block text-sm font-medium text-gray-700 mb-1">
                Marka <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="marka"
                name="marka"
                value={formData.marka}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {/* Ebat */}
            <div>
              <label htmlFor="ebat" className="block text-sm font-medium text-gray-700 mb-1">
                Ebat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ebat"
                name="ebat"
                value={formData.ebat}
                onChange={handleChange}
                placeholder="Örn: 205/55 R16"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {/* Yıl */}
            <div>
              <label htmlFor="yil" className="block text-sm font-medium text-gray-700 mb-1">
                Üretim Yılı <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="yil"
                name="yil"
                value={formData.yil}
                onChange={handleChange}
                min="2018"
                max="2023"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {/* Mevsim */}
            <div>
              <label htmlFor="mevsim" className="block text-sm font-medium text-gray-700 mb-1">
                Mevsim <span className="text-red-500">*</span>
              </label>
              <select
                id="mevsim"
                name="mevsim"
                value={formData.mevsim}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="Yaz">Yaz</option>
                <option value="Kış">Kış</option>
                <option value="Dört Mevsim">Dört Mevsim</option>
              </select>
            </div>
            
            {/* Hız İndeksi */}
            <div>
              <label htmlFor="hizIndeksi" className="block text-sm font-medium text-gray-700 mb-1">
                Hız İndeksi
              </label>
              <input
                type="text"
                id="hizIndeksi"
                name="hizIndeksi"
                value={formData.hizIndeksi}
                onChange={handleChange}
                placeholder="Örn: V, W, Y"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            {/* Yük İndeksi */}
            <div>
              <label htmlFor="yukIndeksi" className="block text-sm font-medium text-gray-700 mb-1">
                Yük İndeksi
              </label>
              <input
                type="text"
                id="yukIndeksi"
                name="yukIndeksi"
                value={formData.yukIndeksi}
                onChange={handleChange}
                placeholder="Örn: 91, 95"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          {/* Sağ Kolon */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-3">Stok ve Fiyat Bilgileri</h2>
            
            {/* Stok */}
            <div>
              <label htmlFor="stok" className="block text-sm font-medium text-gray-700 mb-1">
                Stok Adedi <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stok"
                name="stok"
                value={formData.stok}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {/* Fiyat */}
            <div>
              <label htmlFor="fiyat" className="block text-sm font-medium text-gray-700 mb-1">
                Fiyat (₺) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="fiyat"
                name="fiyat"
                value={formData.fiyat}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {/* İndirimli Fiyat */}
            <div>
              <label htmlFor="indirimli" className="block text-sm font-medium text-gray-700 mb-1">
                İndirimli Fiyat (₺)
              </label>
              <input
                type="number"
                id="indirimli"
                name="indirimli"
                value={formData.indirimli}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            {/* Lastik Özellikleri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Lastik Özellikleri
              </label>
              
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={yeniOzellik}
                    onChange={(e) => setYeniOzellik(e.target.value)}
                    placeholder="Özellik yazın..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleOzellikEkle}
                    className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.ozellikler.map((ozellik, index) => (
                  <div key={index} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                    <span className="text-sm">{ozellik}</span>
                    <button
                      type="button"
                      onClick={() => handleOzellikSil(index)}
                      className="text-purple-700 hover:text-purple-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.ozellikler.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Henüz özellik eklenmedi</p>
                )}
              </div>
            </div>
            
            {/* Ürün Görselleri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ürün Görselleri
              </label>
              
              <div className="mb-3">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Plus className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Resim yüklemek için tıklayın</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleResimYukle}
                  />
                </label>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {onizlemeUrller.map((url, index) => (
                  <div key={index} className="relative">
                    <div className="h-24 w-full border rounded-lg overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Önizleme ${index}`} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleResimSil(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Alt Butonlar */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <Link 
            href="/bayi/lastikler" 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            İptal
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Lastik Ekle
          </button>
        </div>
      </form>
    </div>
  );
} 