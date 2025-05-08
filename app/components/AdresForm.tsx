import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

interface AdresFormProps {
  initialValues?: {
    id?: number;
    adres_baslik?: string;
    adres?: string;
    sehir?: string;
    ilce?: string;
    telefon?: string;
    adres_tipi?: 'fatura' | 'teslimat';
  };
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

const AdresForm: React.FC<AdresFormProps> = ({ initialValues = {}, onSubmit, onCancel, isEdit }) => {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [form, setForm] = useState({
    adres_baslik: initialValues.adres_baslik || '',
    adres: initialValues.adres || '',
    sehir: initialValues.sehir || '',
    ilce: initialValues.ilce || '',
    telefon: initialValues.telefon || '',
    adres_tipi: initialValues.adres_tipi || 'teslimat',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Oturum bilgisi alınamadı: ' + sessionError.message);
      }

      if (!session) {
        throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      }

      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch('/api/user/address', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(isEdit ? { ...form, id: initialValues.id } : form),
        credentials: 'include'
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          // Yönlendirme yapmadan önce hata mesajını göster
          throw new Error('Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.');
        }
        throw new Error(data.error || 'Bir hata oluştu');
      }

      if (!data.success) {
        throw new Error(data.error || 'Adres kaydedilemedi');
      }

      onSubmit(data.data);
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message);
      
      // Sadece gerçekten oturum hatası varsa yönlendir
      if (err.message.includes('Oturum süresi dolmuş') || err.message.includes('Oturum bulunamadı')) {
        setTimeout(() => {
          router.replace('/kullanici/giris');
        }, 2000); // Kullanıcının hata mesajını görmesi için 2 saniye bekle
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-dark-300 p-4 rounded-lg border border-gray-700">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-2 rounded">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Adres Başlığı</label>
        <input
          type="text"
          name="adres_baslik"
          value={form.adres_baslik}
          onChange={handleChange}
          className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
          placeholder="Ev, İş, vb."
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Adres</label>
        <textarea
          name="adres"
          value={form.adres}
          onChange={handleChange}
          className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
          rows={2}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Şehir</label>
          <input
            type="text"
            name="sehir"
            value={form.sehir}
            onChange={handleChange}
            className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">İlçe</label>
          <input
            type="text"
            name="ilce"
            value={form.ilce}
            onChange={handleChange}
            className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Telefon</label>
        <input
          type="text"
          name="telefon"
          value={form.telefon}
          onChange={handleChange}
          className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
          placeholder="05xx xxx xx xx"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Adres Tipi</label>
        <select
          name="adres_tipi"
          value={form.adres_tipi}
          onChange={handleChange}
          className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
        >
          <option value="teslimat">Teslimat</option>
          <option value="fatura">Fatura</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700"
          >
            İptal
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
};

export default AdresForm; 