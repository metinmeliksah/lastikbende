'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface BayiForm {
  isim: string;
  vergi_no: string;
  vergi_dairesi: string;
  telefon: string;
  email: string;
  adres: string;
  sehir: string;
  ilce: string;
  durum: boolean;
}

interface YetkiliForm {
  ad: string;
  soyad: string;
  telefon: string;
  email: string;
  password: string;
}

export default function BayiEkle() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bayiForm, setBayiForm] = useState<BayiForm>({
    isim: '',
    vergi_no: '',
    vergi_dairesi: '',
    telefon: '',
    email: '',
    adres: '',
    sehir: '',
    ilce: '',
    durum: true
  });

  const [yetkiliForm, setYetkiliForm] = useState<YetkiliForm>({
    ad: '',
    soyad: '',
    telefon: '',
    email: '',
    password: ''
  });

  // Format phone number for input field
  const formatPhoneInput = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '').replace(/^90/, '');
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return cleaned.replace(/(\d{3})/, '$1 ');
    } else if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})/, '$1 $2 ');
    }
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Phone number validation
  const isValidPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return /^90\d{10}$/.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate phone numbers
      if (!isValidPhoneNumber(bayiForm.telefon)) {
        alert('Bayi telefon numarası +90 XXX XXX XXXX formatında olmalıdır.');
        return;
      }
      if (!isValidPhoneNumber(yetkiliForm.telefon)) {
        alert('Yetkili telefon numarası +90 XXX XXX XXXX formatında olmalıdır.');
        return;
      }

      // Validate emails
      if (!isValidEmail(bayiForm.email)) {
        alert('Geçerli bir bayi email adresi giriniz.');
        return;
      }
      if (!isValidEmail(yetkiliForm.email)) {
        alert('Geçerli bir yetkili email adresi giriniz.');
        return;
      }

      // Insert dealer
      const { data: bayiData, error: bayiError } = await supabase
        .from('sellers')
        .insert([{
          isim: bayiForm.isim.trim(),
          vergi_no: bayiForm.vergi_no.trim(),
          vergi_dairesi: bayiForm.vergi_dairesi.trim(),
          telefon: bayiForm.telefon.replace(/\D/g, ''),
          email: bayiForm.email.trim(),
          adres: bayiForm.adres.trim(),
          sehir: bayiForm.sehir.trim(),
          ilce: bayiForm.ilce.trim(),
          durum: bayiForm.durum,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (bayiError) throw bayiError;

      // Insert manager
      const { error: yetkiliError } = await supabase
        .from('seller_managers')
        .insert([{
          ad: yetkiliForm.ad.trim(),
          soyad: yetkiliForm.soyad.trim(),
          telefon: yetkiliForm.telefon.replace(/\D/g, ''),
          email: yetkiliForm.email.trim(),
          password: yetkiliForm.password,
          bayi_id: bayiData.id
        }]);

      if (yetkiliError) throw yetkiliError;

      router.push('/yonetici/bayiler');
    } catch (error) {
      console.error('Bayi eklenirken hata:', error);
      alert('Bayi eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/yonetici/bayiler"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Yeni Bayi Ekle</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bayi Bilgileri */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bayi Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2H4v-1h16v1h-1zm-2 0H7v2h6v-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={bayiForm.isim}
                  onChange={(e) => setBayiForm({ ...bayiForm, isim: e.target.value })}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={bayiForm.vergi_no}
                  onChange={(e) => setBayiForm({ ...bayiForm, vergi_no: e.target.value })}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={bayiForm.vergi_dairesi}
                  onChange={(e) => setBayiForm({ ...bayiForm, vergi_dairesi: e.target.value })}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <select
                  value={bayiForm.durum ? 'true' : 'false'}
                  onChange={(e) => setBayiForm({ ...bayiForm, durum: e.target.value === 'true' })}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="true">Aktif</option>
                  <option value="false">Pasif</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div className="absolute inset-y-0 left-8 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">+90</span>
                </div>
                <input
                  type="text"
                  value={formatPhoneInput(bayiForm.telefon.replace(/^90/, ''))}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setBayiForm({ ...bayiForm, telefon: '90' + value });
                    }
                  }}
                  placeholder="XXX XXX XXXX"
                  className="pl-20 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Adresi</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={bayiForm.email}
                  onChange={(e) => setBayiForm({ ...bayiForm, email: e.target.value })}
                  className={`pl-10 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    bayiForm.email && !isValidEmail(bayiForm.email)
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {bayiForm.email && !isValidEmail(bayiForm.email) && (
                <p className="mt-1 text-sm text-red-600">Geçerli bir e-posta adresi giriniz</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <textarea
                  value={bayiForm.adres}
                  onChange={(e) => setBayiForm({ ...bayiForm, adres: e.target.value })}
                  rows={3}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={bayiForm.sehir}
                  onChange={(e) => setBayiForm({ ...bayiForm, sehir: e.target.value })}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={bayiForm.ilce}
                  onChange={(e) => setBayiForm({ ...bayiForm, ilce: e.target.value })}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Yetkili Kişi Bilgileri */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Yetkili Kişi Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ad</label>
              <input
                type="text"
                value={yetkiliForm.ad}
                onChange={(e) => setYetkiliForm({ ...yetkiliForm, ad: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Soyad</label>
              <input
                type="text"
                value={yetkiliForm.soyad}
                onChange={(e) => setYetkiliForm({ ...yetkiliForm, soyad: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefon Numarası</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +90
                </span>
                <input
                  type="text"
                  value={formatPhoneInput(yetkiliForm.telefon.replace(/^90/, ''))}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setYetkiliForm({ ...yetkiliForm, telefon: '90' + value });
                    }
                  }}
                  placeholder="XXX XXX XXXX"
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Adresi</label>
              <input
                type="email"
                value={yetkiliForm.email}
                onChange={(e) => setYetkiliForm({ ...yetkiliForm, email: e.target.value })}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  yetkiliForm.email && !isValidEmail(yetkiliForm.email)
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parola</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  value={yetkiliForm.password}
                  onChange={(e) => setYetkiliForm({ ...yetkiliForm, password: e.target.value })}
                  className="block w-full rounded-md border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/yonetici/bayiler"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
} 