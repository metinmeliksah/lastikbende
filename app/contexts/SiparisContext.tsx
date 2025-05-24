import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Siparis, SiparisUrun, MontajBilgisi } from '../types';

interface SiparisContextType {
  siparisler: Siparis[];
  yukleniyor: boolean;
  siparisOlustur: (
    faturaAdresId: number,
    teslimatAdresId: number | null,
    montajBilgisi?: MontajBilgisi
  ) => Promise<number>;
  siparisDetayEkle: (siparisId: number, urunler: Omit<SiparisUrun, 'id' | 'siparis_id'>[]) => Promise<void>;
  siparisDurumGuncelle: (siparisId: number, yeniDurum: Siparis['durum']) => Promise<void>;
  siparisGetir: (siparisId: number) => Promise<Siparis | null>;
  siparisUrunleriGetir: (siparisId: number) => Promise<SiparisUrun[]>;
}

const SiparisContext = createContext<SiparisContextType | undefined>(undefined);

export function SiparisProvider({ children }: { children: ReactNode }) {
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    siparisleriYukle();
  }, []);

  const siparisleriYukle = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSiparisler([]);
        return;
      }

      const { data, error } = await supabase
        .from('siparis')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSiparisler((data || []) as unknown as Siparis[]);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  const siparisOlustur = async (
    faturaAdresId: number,
    teslimatAdresId: number | null,
    montajBilgisi?: MontajBilgisi
  ): Promise<number> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Oturum bulunamadı');

      const montajTarihi = montajBilgisi?.tarih ? new Date(montajBilgisi.tarih).toISOString().split('T')[0] : null;

      const yeniSiparis = {
        user_id: session.user.id,
        fatura_adres_id: faturaAdresId,
        teslimat_adres_id: teslimatAdresId,
        durum: 'hazırlanıyor' as const,
        teslimat_tipi: montajBilgisi ? 'magaza' : 'adres' as const,
        toplam_tutar: 0,
        kargo_tutari: 0,
        ...(montajBilgisi ? {
          montaj_bayi_id: montajBilgisi.bayi_id,
          montaj_tarihi: montajTarihi,
          montaj_saati: montajBilgisi.saat,
          montaj_notu: montajBilgisi.not || null
        } : {
          montaj_bayi_id: null,
          montaj_tarihi: null,
          montaj_saati: null,
          montaj_notu: null
        })
      };

      console.log('Oluşturulacak sipariş:', yeniSiparis);

      const { data, error } = await supabase
        .from('siparis')
        .insert([yeniSiparis])
        .select()
        .single();

      if (error) {
        console.error('Sipariş oluşturma hatası:', error);
        throw error;
      }
      if (!data) throw new Error('Sipariş oluşturulamadı');

      const typedData = data as unknown as Siparis;
      setSiparisler([typedData, ...siparisler]);
      return typedData.id as number;
    } catch (error) {
      console.error('Sipariş oluşturulurken hata:', error);
      throw error;
    }
  };

  const siparisDetayEkle = async (
    siparisId: number,
    urunler: Omit<SiparisUrun, 'id' | 'siparis_id'>[]
  ) => {
    try {
      const siparisUrunleri = urunler.map(urun => ({
        ...urun,
        siparis_id: siparisId
      }));

      const { error } = await supabase
        .from('siparis_urunleri')
        .insert(siparisUrunleri);

      if (error) throw error;

      const toplamTutar = urunler.reduce((total, urun) => total + (urun.fiyat * urun.adet), 0);
      const kargoTutari = toplamTutar > 1000 ? 0 : 29.90;

      const { error: updateError } = await supabase
        .from('siparis')
        .update({
          toplam_tutar: toplamTutar,
          kargo_tutari: kargoTutari
        })
        .eq('id', siparisId);

      if (updateError) throw updateError;

      await siparisleriYukle();
    } catch (error) {
      console.error('Sipariş detayları eklenirken hata:', error);
      throw error;
    }
  };

  const siparisDurumGuncelle = async (siparisId: number, yeniDurum: Siparis['durum']) => {
    try {
      const { error } = await supabase
        .from('siparis')
        .update({ durum: yeniDurum })
        .eq('id', siparisId);

      if (error) throw error;
      setSiparisler(siparisler.map(siparis =>
        siparis.id === siparisId ? { ...siparis, durum: yeniDurum } : siparis
      ));
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      throw error;
    }
  };

  const siparisGetir = async (siparisId: number): Promise<Siparis | null> => {
    try {
      const { data, error } = await supabase
        .from('siparis')
        .select('*')
        .eq('id', siparisId)
        .single();

      if (error) throw error;
      return data as unknown as Siparis;
    } catch (error) {
      console.error('Sipariş getirilirken hata:', error);
      return null;
    }
  };

  const siparisUrunleriGetir = async (siparisId: number): Promise<SiparisUrun[]> => {
    try {
      const { data, error } = await supabase
        .from('siparis_urunleri')
        .select('*')
        .eq('siparis_id', siparisId);

      if (error) throw error;
      return (data || []) as unknown as SiparisUrun[];
    } catch (error) {
      console.error('Sipariş ürünleri getirilirken hata:', error);
      return [];
    }
  };

  return (
    <SiparisContext.Provider value={{
      siparisler,
      yukleniyor,
      siparisOlustur,
      siparisDetayEkle,
      siparisDurumGuncelle,
      siparisGetir,
      siparisUrunleriGetir
    }}>
      {children}
    </SiparisContext.Provider>
  );
}

export function useSiparis() {
  const context = useContext(SiparisContext);
  if (context === undefined) {
    throw new Error('useSiparis must be used within a SiparisProvider');
  }
  return context;
} 