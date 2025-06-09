'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { useAdres } from '../contexts/AdresContext';
import { Adres } from '../types';
import { toast } from 'react-hot-toast';

interface AdresFormProps {
  tip: 'fatura' | 'teslimat';
  initialValues?: Adres;
  onSuccess?: (data: Adres) => void;
  onCancel?: () => void;
}

type AdresFormData = Omit<Adres, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Type guard function to validate address data
function isValidAdres(item: unknown): item is Adres {
  const address = item as Record<string, unknown>;
  return (
    typeof address.id === 'number' &&
    typeof address.user_id === 'string' &&
    typeof address.adres_baslik === 'string' &&
    typeof address.adres === 'string' &&
    typeof address.sehir === 'string' &&
    typeof address.ilce === 'string' &&
    typeof address.telefon === 'string' &&
    (address.adres_tipi === 'fatura' || address.adres_tipi === 'teslimat')
  );
}

export default function AdresForm({ tip, initialValues, onSuccess, onCancel }: AdresFormProps) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { adresEkle, adresGuncelle } = useAdres();
  const [form, setForm] = useState<AdresFormData>({
    adres_baslik: initialValues?.adres_baslik || '',
    adres: initialValues?.adres || '',
    sehir: initialValues?.sehir || '',
    ilce: initialValues?.ilce || '',
    telefon: initialValues?.telefon || '',
    adres_tipi: tip
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Telefon numarası validasyonu
    const phoneRegex = /^(05)[0-9][0-9][1-9]([0-9]){6}$/;
    if (!phoneRegex.test(form.telefon.replace(/\s+/g, ''))) {
      toast.error('Geçerli bir telefon numarası giriniz (05XX XXX XX XX)');
      return;
    }
    
    try {
      let savedAddress: Adres;
      
      if (initialValues?.id) {
        await adresGuncelle(initialValues.id, form);
        const { data } = await supabase
          .from('adres')
          .select('*')
          .eq('id', initialValues.id)
          .single();
          
        if (!data || !isValidAdres(data)) {
          throw new Error('Invalid address data returned from database');
        }
        
        savedAddress = data;
        toast.success('Adres başarıyla güncellendi');
      } else {
        savedAddress = await adresEkle(form);
        toast.success('Adres başarıyla eklendi');
      }
      
      onSuccess?.(savedAddress);
    } catch (error) {
      console.error('Form gönderilirken hata:', error);
      toast.error('Adres kaydedilirken bir hata oluştu');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4 text-center">
        {initialValues ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
      </h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Adres Başlığı *
        </label>
        <input
          type="text"
          value={form.adres_baslik}
          onChange={(e) => setForm({ ...form, adres_baslik: e.target.value })}
          className="w-full bg-dark-400 border border-gray-700 rounded-lg py-2 px-3 text-white"
          placeholder="Örn: Ev, İş"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Adres *
        </label>
        <textarea
          value={form.adres}
          onChange={(e) => setForm({ ...form, adres: e.target.value })}
          className="w-full bg-dark-400 border border-gray-700 rounded-lg py-2 px-3 text-white"
          rows={3}
          placeholder="Açık adres"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Şehir *
          </label>
          <input
            type="text"
            value={form.sehir}
            onChange={(e) => setForm({ ...form, sehir: e.target.value })}
            className="w-full bg-dark-400 border border-gray-700 rounded-lg py-2 px-3 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            İlçe *
          </label>
          <input
            type="text"
            value={form.ilce}
            onChange={(e) => setForm({ ...form, ilce: e.target.value })}
            className="w-full bg-dark-400 border border-gray-700 rounded-lg py-2 px-3 text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Telefon *
        </label>
        <input
          type="tel"
          value={form.telefon}
          onChange={(e) => setForm({ ...form, telefon: e.target.value })}
          className="w-full bg-dark-400 border border-gray-700 rounded-lg py-2 px-3 text-white"
          placeholder="05XX XXX XX XX"
          required
        />
      </div>
      
      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-400 mb-3">
          Adres Tipi *
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="teslimat"
              checked={form.adres_tipi === 'teslimat'}
              onChange={() => setForm({ ...form, adres_tipi: 'teslimat' })}
              className="mr-2 text-primary bg-dark-300 border-gray-700"
            />
            <span className="text-white">Teslimat Adresi</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="fatura"
              checked={form.adres_tipi === 'fatura'}
              onChange={() => setForm({ ...form, adres_tipi: 'fatura' })}
              className="mr-2 text-primary bg-dark-300 border-gray-700"
            />
            <span className="text-white">Fatura Adresi</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-dark-300 text-white border border-gray-700 rounded-lg hover:bg-dark-200 transition-colors"
          >
            İptal
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {initialValues ? 'Adresi Güncelle' : 'Adresi Kaydet'}
        </button>
      </div>
    </form>
  );
} 