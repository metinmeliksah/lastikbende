'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Eye, EyeOff, Check, User, Mail, Phone, Calendar, Shield } from 'lucide-react';

interface Manager {
  id: number;
  ad: string;
  soyad: string;
  email: string;
  telefon: string;
  created_at: string;
  updated_at: string;
  role: string;
  durum: boolean;
}

export default function ProfilSayfasi() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manager, setManager] = useState<Manager | null>(null);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    password: '',
    changePassword: false
  });

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      
      // Oturum bilgilerini kontrol et
      const managerDataStr = localStorage.getItem('managerData');
      if (!managerDataStr) {
        console.error("Yönetici oturumu bulunamadı");
        window.location.href = '/yonetici/giris';
        return;
      }

      const managerData = JSON.parse(managerDataStr);
      const managerId = managerData.id;

      if (!managerId) {
        console.error("Yönetici ID bulunamadı");
        window.location.href = '/yonetici/giris';
        return;
      }

      // Yönetici bilgilerini getir
      const { data, error } = await supabase
        .from('managers')
        .select('*')
        .eq('id', managerId)
        .single();

      if (error) throw error;

      if (data) {
        setManager(data);
        setFormData({
          ad: data.ad || '',
          soyad: data.soyad || '',
          email: data.email || '',
          telefon: data.telefon || '',
          password: '',
          changePassword: false
        });
      }
    } catch (error) {
      console.error('Yönetici bilgileri alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Check if it starts with 90, if not add it
    const withCountry = cleaned.startsWith('90') ? cleaned : '90' + cleaned;
    // Format as +90 XXX XXX XXXX
    return `+${withCountry.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4')}`;
  };

  // Format phone number for input field
  const formatPhoneInput = (phone: string) => {
    if (!phone) return '';
    // Remove all non-numeric characters and the 90 prefix if exists
    const cleaned = phone.replace(/\D/g, '').replace(/^90/, '');
    
    // Format the remaining numbers
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return cleaned.replace(/(\d{3})/, '$1 ');
    } else if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})/, '$1 $2 ');
    }
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  // Phone number validation
  const isValidPhoneNumber = (phone: string) => {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return /^90\d{10}$/.test(cleaned);
  };

  // Email validation helper
  const isValidEmail = (email: string) => {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Tarih formatı için yardımcı fonksiyon
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!manager) return;

    // Validations
    if (!formData.ad.trim() || !formData.soyad.trim()) {
      setFormError('Ad ve soyad alanları zorunludur.');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setFormError('Geçerli bir email adresi giriniz.');
      return;
    }

    if (formData.telefon && !isValidPhoneNumber(formData.telefon)) {
      setFormError('Telefon numarası +90 XXX XXX XXXX formatında olmalıdır.');
      return;
    }

    if (formData.changePassword && (!formData.password || formData.password.length < 6)) {
      setFormError('Parola en az 6 karakter olmalıdır.');
      return;
    }

    try {
      setSaving(true);

      const updateData: any = {
        ad: formData.ad.trim(),
        soyad: formData.soyad.trim(),
        email: formData.email.trim(),
        telefon: formData.telefon ? formData.telefon.replace(/\D/g, '') : '',
        updated_at: new Date().toISOString()
      };

      // Sadece parola değiştirilmek isteniyorsa ekle
      if (formData.changePassword && formData.password) {
        updateData.password = formData.password;
      }

      const { error } = await supabase
        .from('managers')
        .update(updateData)
        .eq('id', manager.id);

      if (error) throw error;

      // Bilgileri yeniden çek
      await fetchManagerData();

      // İşlem başarılı mesajı
      setFormError('');
      alert('Profil bilgileriniz başarıyla güncellendi.');
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      setFormError('Profil güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profil Bilgilerim</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
            <User className="h-16 w-16 text-blue-600" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {manager?.ad} {manager?.soyad}
              </h2>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Yönetici
                </span>
                {manager?.role && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {manager.role}
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${manager?.durum ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {manager?.durum ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">E-posta</div>
                  <div className="text-sm font-medium text-gray-900">{manager?.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Telefon</div>
                  <div className="text-sm font-medium text-gray-900">
                    {manager?.telefon ? formatPhoneNumber(manager.telefon) : 'Belirtilmemiş'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Kayıt Tarihi</div>
                  <div className="text-sm font-medium text-gray-900">
                    {manager?.created_at ? formatDate(manager.created_at) : 'Belirtilmemiş'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Son Güncelleme</div>
                  <div className="text-sm font-medium text-gray-900">
                    {manager?.updated_at ? formatDate(manager.updated_at) : 'Belirtilmemiş'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profil Bilgilerini Güncelle</h2>

        {formError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ad" className="block text-sm font-medium text-gray-700 mb-1">
                Ad
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="ad"
                  value={formData.ad}
                  onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="soyad" className="block text-sm font-medium text-gray-700 mb-1">
                Soyad
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="soyad"
                  value={formData.soyad}
                  onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta Adresi
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`pl-10 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    formData.email && !isValidEmail(formData.email)
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {formData.email && !isValidEmail(formData.email) && (
                <p className="mt-1 text-sm text-red-600">Geçerli bir e-posta adresi giriniz</p>
              )}
            </div>
            <div>
              <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon Numarası
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 left-8 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">+90</span>
                </div>
                <input
                  type="text"
                  id="telefon"
                  value={formatPhoneInput(formData.telefon.replace(/^90/, ''))}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setFormData({ ...formData, telefon: '90' + value });
                    }
                  }}
                  placeholder="XXX XXX XXXX"
                  className="pl-20 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="changePassword"
                checked={formData.changePassword}
                onChange={(e) => setFormData({ ...formData, changePassword: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="changePassword" className="ml-2 block text-sm text-gray-700">
                Şifremi değiştirmek istiyorum
              </label>
            </div>

            {formData.changePassword && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Yeni Şifre
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pr-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Şifre en az 6 karakter olmalıdır.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
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
                  <span>Değişiklikleri Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
