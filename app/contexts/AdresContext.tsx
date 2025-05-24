'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Adres } from '../types';
import { toast } from 'react-hot-toast';

interface AdresContextType {
  adresler: Adres[];
  yukleniyor: boolean;
  adresEkle: (adres: Omit<Adres, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Adres>;
  adresGuncelle: (id: number, adres: Partial<Omit<Adres, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  adresSil: (id: number) => Promise<void>;
  adresleriYenile: () => Promise<void>;
}

const AdresContext = createContext<AdresContextType | undefined>(undefined);

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

export function AdresProvider({ children }: { children: ReactNode }) {
  const [adresler, setAdresler] = useState<Adres[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const supabase = getSupabaseClient();

  const adresleriYenile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAdresler([]);
        return;
      }

      const { data, error } = await supabase
        .from('adres')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Validate and filter data
      const validatedData = ((data || []) as unknown[])
        .filter(isValidAdres);

      setAdresler(validatedData);
    } catch (error) {
      console.error('Adresler yüklenirken hata:', error);
      toast.error('Adresler yüklenirken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    adresleriYenile();
  }, []);

  const adresEkle = async (yeniAdres: Omit<Adres, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Adres> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Oturum bulunamadı');

      const { data, error } = await supabase
        .from('adres')
        .insert([{ ...yeniAdres, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');
      
      const validatedData = data as unknown;
      if (!isValidAdres(validatedData)) {
        throw new Error('Invalid address data structure returned from insert');
      }

      setAdresler([validatedData, ...adresler]);
      return validatedData;
    } catch (error) {
      console.error('Adres eklenirken hata:', error);
      throw error;
    }
  };

  const adresGuncelle = async (id: number, guncelAdres: Partial<Omit<Adres, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Oturum bulunamadı');

      const { error } = await supabase
        .from('adres')
        .update(guncelAdres)
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setAdresler(adresler.map(adres =>
        adres.id === id ? { ...adres, ...guncelAdres } : adres
      ));
    } catch (error) {
      console.error('Adres güncellenirken hata:', error);
      throw error;
    }
  };

  const adresSil = async (id: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Oturum bulunamadı');

      const { error } = await supabase
        .from('adres')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setAdresler(adresler.filter(adres => adres.id !== id));
    } catch (error) {
      console.error('Adres silinirken hata:', error);
      throw error;
    }
  };

  return (
    <AdresContext.Provider value={{
      adresler,
      yukleniyor,
      adresEkle,
      adresGuncelle,
      adresSil,
      adresleriYenile
    }}>
      {children}
    </AdresContext.Provider>
  );
}

export function useAdres() {
  const context = useContext(AdresContext);
  if (context === undefined) {
    throw new Error('useAdres must be used within an AdresProvider');
  }
  return context;
} 