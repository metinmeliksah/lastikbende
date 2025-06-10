import { useState, useEffect } from 'react';
import { MontajBilgisi } from '../types';
import { getSupabaseClient } from '@/lib/supabase';

interface MontajFormProps {
  onSubmit: (montajBilgisi: MontajBilgisi) => void;
  onCancel: () => void;
}

interface Bayi {
  id: number;
  isim: string;
  adres: string;
  sehir: string;
  ilce: string;
  telefon: string;
}

export default function MontajForm({ onSubmit, onCancel }: MontajFormProps) {
  const [bayiler, setBayiler] = useState<Bayi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenBayi, setSecilenBayi] = useState<number | null>(null);
  const [tarih, setTarih] = useState('');
  const [saat, setSaat] = useState('');
  const [not, setNot] = useState('');

  const supabase = getSupabaseClient();

  useEffect(() => {
    bayileriYukle();
  }, []);

  const bayileriYukle = async () => {
    try {
      const { data, error } = await supabase
        .from('bayiler')
        .select('*')
        .order('sehir', { ascending: true });

      if (error) throw error;
      
      if (data) {
        const tiplenmisBayiler: Bayi[] = data.map(item => ({
          id: Number(item.id),
          isim: String(item.isim || ''),
          adres: String(item.adres || ''),
          sehir: String(item.sehir || ''),
          ilce: String(item.ilce || ''),
          telefon: String(item.telefon || '')
        }));
        setBayiler(tiplenmisBayiler);
      } else {
        setBayiler([]);
      }
    } catch (error) {
      console.error('Bayiler yüklenirken hata:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secilenBayi || !tarih || !saat) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    onSubmit({
      bayi_id: secilenBayi,
      tarih,
      saat,
      not: not || undefined
    });
  };

  if (yukleniyor) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bayi Seçin *
        </label>
        <select
          value={secilenBayi || ''}
          onChange={(e) => setSecilenBayi(Number(e.target.value))}
          className="w-full border rounded-md py-2 px-3"
          required
        >
          <option value="">Bayi seçin</option>
          {bayiler.map((bayi) => (
            <option key={bayi.id} value={bayi.id}>
              {bayi.isim} - {bayi.sehir}, {bayi.ilce}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Montaj Tarihi *
        </label>
        <input
          type="date"
          value={tarih}
          onChange={(e) => setTarih(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full border rounded-md py-2 px-3"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Montaj Saati *
        </label>
        <select
          value={saat}
          onChange={(e) => setSaat(e.target.value)}
          className="w-full border rounded-md py-2 px-3"
          required
        >
          <option value="">Saat seçin</option>
          {[
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
            '16:00', '16:30', '17:00'
          ].map((saat) => (
            <option key={saat} value={saat}>
              {saat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Montaj Notu
        </label>
        <textarea
          value={not}
          onChange={(e) => setNot(e.target.value)}
          className="w-full border rounded-md py-2 px-3"
          rows={3}
          placeholder="Varsa eklemek istediğiniz notları yazabilirsiniz"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Montaj Bilgilerini Kaydet
        </button>
      </div>
    </form>
  );
} 