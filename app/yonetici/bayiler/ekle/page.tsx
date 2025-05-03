'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, X, Upload, Plus, Trash } from 'lucide-react';
import Link from 'next/link';

export default function BayiEkle() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firmaAdi: '',
    yetkiliAdi: '',
    email: '',
    telefon: '',
    sehir: '',
    adres: '',
    vergiNo: '',
    vergiDairesi: '',
    website: '',
    notlar: '',
    durum: 'aktif'
  });

  // Form validation
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.firmaAdi.trim()) {
      newErrors.firmaAdi = 'Firma adı gereklidir';
    }
    
    if (!formData.yetkiliAdi.trim()) {
      newErrors.yetkiliAdi = 'Yetkili adı gereklidir';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.telefon.trim()) {
      newErrors.telefon = 'Telefon numarası gereklidir';
    }

    if (!formData.sehir.trim()) {
      newErrors.sehir = 'Şehir gereklidir';
    }
    
    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Navigate to bayiler page on success
      router.push('/yonetici/bayiler');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/yonetici/bayiler"
            className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="yonetici-page-title mb-0">Yeni Bayi Ekle</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => router.push('/yonetici/bayiler')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>İptal</span>
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="yonetici-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Firma Bilgileri */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Firma Bilgileri</h2>
            <div className="border-t border-gray-100 pt-4"></div>
          </div>

          {/* Firma Adı */}
          <div className="space-y-2">
            <label htmlFor="firmaAdi" className="block text-sm font-medium text-gray-700">
              Firma Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firmaAdi"
              name="firmaAdi"
              value={formData.firmaAdi}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.firmaAdi ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 focus:outline-none focus:ring-2`}
              placeholder="Firma adını giriniz"
            />
            {errors.firmaAdi && (
              <p className="text-red-500 text-xs mt-1">{errors.firmaAdi}</p>
            )}
          </div>

          {/* Vergi No */}
          <div className="space-y-2">
            <label htmlFor="vergiNo" className="block text-sm font-medium text-gray-700">
              Vergi No
            </label>
            <input
              type="text"
              id="vergiNo"
              name="vergiNo"
              value={formData.vergiNo}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Vergi numarasını giriniz"
            />
          </div>

          {/* Vergi Dairesi */}
          <div className="space-y-2">
            <label htmlFor="vergiDairesi" className="block text-sm font-medium text-gray-700">
              Vergi Dairesi
            </label>
            <input
              type="text"
              id="vergiDairesi"
              name="vergiDairesi"
              value={formData.vergiDairesi}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Vergi dairesini giriniz"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.firmaniz.com"
            />
          </div>

          {/* İletişim Bilgileri */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">İletişim Bilgileri</h2>
            <div className="border-t border-gray-100 pt-4"></div>
          </div>

          {/* Yetkili Adı */}
          <div className="space-y-2">
            <label htmlFor="yetkiliAdi" className="block text-sm font-medium text-gray-700">
              Yetkili Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="yetkiliAdi"
              name="yetkiliAdi"
              value={formData.yetkiliAdi}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.yetkiliAdi ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 focus:outline-none focus:ring-2`}
              placeholder="Yetkili kişinin adını giriniz"
            />
            {errors.yetkiliAdi && (
              <p className="text-red-500 text-xs mt-1">{errors.yetkiliAdi}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-posta <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 focus:outline-none focus:ring-2`}
              placeholder="ornek@firma.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Telefon */}
          <div className="space-y-2">
            <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">
              Telefon <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="telefon"
              name="telefon"
              value={formData.telefon}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.telefon ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 focus:outline-none focus:ring-2`}
              placeholder="0212 555 66 77"
            />
            {errors.telefon && (
              <p className="text-red-500 text-xs mt-1">{errors.telefon}</p>
            )}
          </div>

          {/* Şehir */}
          <div className="space-y-2">
            <label htmlFor="sehir" className="block text-sm font-medium text-gray-700">
              Şehir <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="sehir"
              name="sehir"
              value={formData.sehir}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.sehir ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} px-4 py-2 focus:outline-none focus:ring-2`}
              placeholder="İstanbul"
            />
            {errors.sehir && (
              <p className="text-red-500 text-xs mt-1">{errors.sehir}</p>
            )}
          </div>

          {/* Adres */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="adres" className="block text-sm font-medium text-gray-700">
              Adres
            </label>
            <textarea
              id="adres"
              name="adres"
              value={formData.adres}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Firma adresini giriniz"
            ></textarea>
          </div>

          {/* Diğer Bilgiler */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Diğer Bilgiler</h2>
            <div className="border-t border-gray-100 pt-4"></div>
          </div>

          {/* Durum */}
          <div className="space-y-2">
            <label htmlFor="durum" className="block text-sm font-medium text-gray-700">
              Durum
            </label>
            <select
              id="durum"
              name="durum"
              value={formData.durum}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="aktif">Aktif</option>
              <option value="pasif">Pasif</option>
              <option value="askida">Askıda</option>
            </select>
          </div>

          {/* Logo Yükleme Bölümü */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Firma Logosu
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Logo yükle</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">veya sürükle bırak</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF (max. 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Notlar */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="notlar" className="block text-sm font-medium text-gray-700">
              Notlar
            </label>
            <textarea
              id="notlar"
              name="notlar"
              value={formData.notlar}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ek notlar giriniz"
            ></textarea>
          </div>
        </div>

        {/* Form Controls */}
        <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/yonetici/bayiler')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 