'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import Link from 'next/link';

interface YetkiliForm {
  id: number;
  ad: string;
  soyad: string;
  telefon: string;
  email: string;
  password: string | null;
  changePassword: boolean;
  bayi_id: number;
  bayi_isim: string;
}

export default function YetkiliDuzenle() {
  const router = useRouter();
  const params = useParams();
  const yetkiliId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [yetkiliForm, setYetkiliForm] = useState<YetkiliForm>({
    id: parseInt(yetkiliId),
    ad: '',
    soyad: '',
    telefon: '',
    email: '',
    password: null,
    changePassword: false,
    bayi_id: 0,
    bayi_isim: ''
  });

  useEffect(() => {
    fetchYetkili();
  }, [yetkiliId]);

  const fetchYetkili = async () => {
    try {
      setLoading(true);

      // Önce yetkili bilgilerini al
      const { data: yetkili, error } = await supabase
        .from('seller_managers')
        .select(`id, ad, soyad, telefon, email, bayi_id`)
        .eq('id', yetkiliId)
        .single();

      if (error) throw error;

      if (yetkili) {
        // Bayi bilgilerini ayrı sorgula
        const { data: bayiData, error: bayiError } = await supabase
          .from('sellers')
          .select('isim')
          .eq('id', yetkili.bayi_id)
          .single();

        if (bayiError) console.error('Bayi bilgisi alınırken hata:', bayiError);

        setYetkiliForm({
          id: yetkili.id,
          ad: yetkili.ad,
          soyad: yetkili.soyad,
          telefon: yetkili.telefon,
          email: yetkili.email,
          password: null,
          changePassword: false,
          bayi_id: yetkili.bayi_id,
          bayi_isim: bayiData?.isim || 'Bayi bulunamadı'
        });
      }
    } catch (error) {
      console.error('Yetkili bilgisi alınırken hata:', error);
    } finally {
      setLoading(false);
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
    setFormError('');
    
    // Validations
    if (!yetkiliForm.ad.trim() || !yetkiliForm.soyad.trim()) {
      setFormError('Ad ve soyad alanları zorunludur.');
      return;
    }

    if (!isValidPhoneNumber(yetkiliForm.telefon)) {
      setFormError('Telefon numarası +90 XXX XXX XXXX formatında olmalıdır.');
      return;
    }

    if (!isValidEmail(yetkiliForm.email)) {
      setFormError('Geçerli bir email adresi giriniz.');
      return;
    }

    if (yetkiliForm.changePassword && (!yetkiliForm.password || yetkiliForm.password.length < 6)) {
      setFormError('Parola en az 6 karakter olmalıdır.');
      return;
    }

    try {
      setSaving(true);

      const updateData: any = {
        ad: yetkiliForm.ad.trim(),
        soyad: yetkiliForm.soyad.trim(),
        telefon: yetkiliForm.telefon.replace(/\D/g, ''),
        email: yetkiliForm.email.trim()
      };

      // Sadece parola değiştirilmek isteniyorsa ekle
      if (yetkiliForm.changePassword && yetkiliForm.password) {
        updateData.password = yetkiliForm.password;
      }

      const { error } = await supabase
        .from('seller_managers')
        .update(updateData)
        .eq('id', yetkiliForm.id);

      if (error) throw error;

      router.push('/yonetici/bayiler');
    } catch (error) {
      console.error('Yetkili güncellenirken hata:', error);
      setFormError('Yetkili güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Yetkili Düzenle</h1>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {formError && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              {formError}
            </div>
          )}

          {/* Bayi Bilgisi */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bayi Bilgisi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bayi ID</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={yetkiliForm.bayi_id}
                    className="pl-10 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bayi İsmi</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2H4v-1h16v1h-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={yetkiliForm.bayi_isim}
                    className="pl-10 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Yetkili Bilgileri */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Yetkili Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={yetkiliForm.ad}
                    onChange={(e) => setYetkiliForm({ ...yetkiliForm, ad: e.target.value })}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={yetkiliForm.soyad}
                    onChange={(e) => setYetkiliForm({ ...yetkiliForm, soyad: e.target.value })}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
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
                    value={formatPhoneInput(yetkiliForm.telefon.replace(/^90/, ''))}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setYetkiliForm({ ...yetkiliForm, telefon: '90' + value });
                      }
                    }}
                    placeholder="XXX XXX XXXX"
                    className="pl-20 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                    value={yetkiliForm.email}
                    onChange={(e) => setYetkiliForm({ ...yetkiliForm, email: e.target.value })}
                    className={`pl-10 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      yetkiliForm.email && !isValidEmail(yetkiliForm.email)
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
                {yetkiliForm.email && !isValidEmail(yetkiliForm.email) && (
                  <p className="mt-1 text-sm text-red-600">Geçerli bir e-posta adresi giriniz</p>
                )}
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="changePassword"
                    checked={yetkiliForm.changePassword}
                    onChange={(e) => setYetkiliForm({ ...yetkiliForm, changePassword: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="changePassword" className="ml-2 block text-sm text-gray-700">
                    Şifreyi Değiştir
                  </label>
                </div>
                {yetkiliForm.changePassword && (
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={yetkiliForm.password || ''}
                      onChange={(e) => setYetkiliForm({ ...yetkiliForm, password: e.target.value })}
                      className="pl-10 pr-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Yeni şifre"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}
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
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 