'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface YetkiliForm {
  ad: string;
  soyad: string;
  telefon: string;
  email: string;
  password: string;
}

interface Seller {
  id: number;
  isim: string;
}

export default function YetkiliEkle({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [seller, setSeller] = useState<Seller | null>(null);

  const [yetkiliForm, setYetkiliForm] = useState<YetkiliForm>({
    ad: '',
    soyad: '',
    telefon: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchSeller();
  }, []);

  const fetchSeller = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('id, isim')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setSeller(data);
    } catch (error) {
      console.error('Bayi bilgileri yüklenirken hata:', error);
      alert('Bayi bilgileri yüklenirken bir hata oluştu.');
      router.push('/yonetici/bayiler');
    }
  };

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
      // Validate phone number
      if (!isValidPhoneNumber(yetkiliForm.telefon)) {
        alert('Telefon numarası +90 XXX XXX XXXX formatında olmalıdır.');
        return;
      }

      // Validate email
      if (!isValidEmail(yetkiliForm.email)) {
        alert('Geçerli bir email adresi giriniz.');
        return;
      }

      // Insert manager
      const { error: yetkiliError } = await supabase
        .from('seller_managers')
        .insert([{
          ad: yetkiliForm.ad.trim(),
          soyad: yetkiliForm.soyad.trim(),
          telefon: yetkiliForm.telefon.replace(/\D/g, ''),
          email: yetkiliForm.email.trim(),
          password: yetkiliForm.password,
          bayi_id: params.id
        }]);

      if (yetkiliError) throw yetkiliError;

      router.push('/yonetici/bayiler');
    } catch (error) {
      console.error('Yetkili eklenirken hata:', error);
      alert('Yetkili eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!seller) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/yonetici/bayiler"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Yetkili Ekle</h1>
          <p className="text-sm text-gray-500">{seller.isim}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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