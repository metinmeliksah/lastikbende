'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

interface CartProduct {
  id: number;
  isim: string;
  ebat: string;
  fiyat: number;
  adet: number;
  resim: string;
  stok_id: number;
}

interface CartDatabaseItem extends CartProduct {
  user_id: string;
  urun_id: number;
}

interface DatabaseCartItem {
  id: number;
  user_id: string;
  urun_id: number;
  isim: string;
  ebat: string;
  fiyat: number;
  adet: number;
  resim: string;
  stok_id: number;
}

interface CartContextType {
  sepetUrunler: CartProduct[];
  sepeteEkle: (urun: CartProduct) => Promise<void>;
  sepettenCikar: (urunId: number, ebat: string) => Promise<void>;
  adetGuncelle: (urunId: number, ebat: string, yeniAdet: number) => Promise<void>;
  sepetiTemizle: () => Promise<void>;
  toplamTutar: number;
  yukleniyor: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [sepetUrunler, setSepetUrunler] = useState<CartProduct[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const supabase = getSupabaseClient();

  // Sepeti veritabanından yükle
  const sepetVerileriniYukle = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Veritabanından kullanıcının sepetini al
        const { data: sepetData, error } = await supabase
          .from('sepet')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Sepet yüklenirken hata:', error);
          return;
        }

        if (sepetData) {
          const formattedData: CartProduct[] = (sepetData as unknown as DatabaseCartItem[]).map(item => ({
            id: item.urun_id,
            isim: item.isim,
            ebat: item.ebat,
            fiyat: item.fiyat,
            adet: item.adet,
            resim: item.resim,
            stok_id: item.stok_id
          }));
          setSepetUrunler(formattedData);
        }
      } else {
        // Kullanıcı giriş yapmamışsa localStorage'dan yükle
        const savedCart = localStorage.getItem('sepet');
        if (savedCart) {
          setSepetUrunler(JSON.parse(savedCart));
        }
      }
    } catch (error) {
      console.error('Sepet yüklenirken hata:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  // Component mount olduğunda sepeti yükle
  useEffect(() => {
    sepetVerileriniYukle();
  }, []);

  // Sepeti veritabanına kaydet
  const sepetKaydet = async (yeniSepet: CartProduct[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Önce eski sepeti temizle
        await supabase
          .from('sepet')
          .delete()
          .eq('user_id', session.user.id);

        // Yeni sepeti kaydet
        if (yeniSepet.length > 0) {
          const sepetVerileri = yeniSepet.map(urun => ({
            user_id: session.user.id,
            urun_id: urun.id,
            isim: urun.isim,
            ebat: urun.ebat,
            fiyat: urun.fiyat,
            adet: urun.adet,
            resim: urun.resim,
            stok_id: urun.stok_id
          }));

          const { error } = await supabase
            .from('sepet')
            .insert(sepetVerileri);

          if (error) {
            console.error('Sepet kaydedilirken hata:', error);
          }
        }
      }
      // Her durumda localStorage'a da kaydet
      localStorage.setItem('sepet', JSON.stringify(yeniSepet));
    } catch (error) {
      console.error('Sepet kaydedilirken hata:', error);
    }
  };

  const sepeteEkle = async (urun: CartProduct) => {
    setYukleniyor(true);
    try {
      const yeniSepet = [...sepetUrunler];
      const mevcutUrun = yeniSepet.find(item => 
        item.id === urun.id && item.ebat === urun.ebat
      );
      
      if (mevcutUrun) {
        mevcutUrun.adet += urun.adet;
      } else {
        yeniSepet.push(urun);
      }
      
      setSepetUrunler(yeniSepet);
      await sepetKaydet(yeniSepet);
    } catch (error) {
      console.error('Ürün sepete eklenirken hata:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  const sepettenCikar = async (urunId: number, ebat: string) => {
    setYukleniyor(true);
    try {
      const yeniSepet = sepetUrunler.filter(urun => 
        !(urun.id === urunId && urun.ebat === ebat)
      );
      setSepetUrunler(yeniSepet);
      await sepetKaydet(yeniSepet);
    } catch (error) {
      console.error('Ürün sepetten çıkarılırken hata:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  const adetGuncelle = async (urunId: number, ebat: string, yeniAdet: number) => {
    if (yeniAdet < 1) return;
    setYukleniyor(true);
    try {
      const yeniSepet = sepetUrunler.map(urun =>
        urun.id === urunId && urun.ebat === ebat
          ? { ...urun, adet: yeniAdet }
          : urun
      );
      setSepetUrunler(yeniSepet);
      await sepetKaydet(yeniSepet);
    } catch (error) {
      console.error('Ürün adeti güncellenirken hata:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  const sepetiTemizle = async () => {
    setYukleniyor(true);
    try {
      setSepetUrunler([]);
      await sepetKaydet([]);
      localStorage.removeItem('sepet');
    } catch (error) {
      console.error('Sepet temizlenirken hata:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  const toplamTutar = sepetUrunler.reduce(
    (total, urun) => total + urun.fiyat * urun.adet,
    0
  );

  return (
    <CartContext.Provider
      value={{
        sepetUrunler,
        sepeteEkle,
        sepettenCikar,
        adetGuncelle,
        sepetiTemizle,
        toplamTutar,
        yukleniyor
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 