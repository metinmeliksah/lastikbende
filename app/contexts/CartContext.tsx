'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

// Sepetteki ürün nesnesi için tip tanımı
interface CartProduct {
  id: number;
  isim: string;
  ebat: string; // Frontend'de gösterim için tutuyoruz
  fiyat: number;
  adet: number;
  resim: string;
  stok_id: number;
}

// Veritabanı tiplerini tanımla
interface StokItem {
  stok_id: number;
  urun_id: number;
  ebat: string;
  stok_adet: number;
}

interface UrunItem {
  id: number;
  isim: string;
  fiyat: number;
  resim: string;
}

interface SepetItem {
  id: number;
  user_id: string;
  stok_id: number;
  adet: number;
}

// Define proper types for database results
type SepetItemRow = {
  id: number;
  user_id: string;
  stok_id: number;
  adet: number;
  // Include any other fields from the actual table
};

type StokItemRow = {
  stok_id: number;
  urun_id: number;
  ebat: string;
  fiyat: number;
  // Include any other fields from the actual table
};

type UrunDetayRow = {
  urun_id: number;
  model: string;
  urun_resmi_0: string;
  // Include any other fields from the actual table
};

// Sepet context için tip tanımı
interface CartContextType {
  sepetUrunler: CartProduct[];
  sepeteEkle: (urun: CartProduct) => Promise<void>;
  sepettenCikar: (urunId: number) => Promise<void>;
  adetGuncelle: (urunId: number, yeniAdet: number) => Promise<void>;
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
      setYukleniyor(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.log('Kullanıcı oturumu bulunamadı');
        setYukleniyor(false);
        return;
      }

      // Sepet verilerini al
      const { data: sepetData, error: sepetError } = await supabase
        .from('sepet')
        .select('*')
        .eq('user_id', session.user.id);

      if (sepetError) {
        console.error('Sepet yüklenirken hata:', sepetError);
        toast.error('Sepet bilgileri yüklenirken bir hata oluştu');
        setYukleniyor(false);
        return;
      }

      if (!sepetData || sepetData.length === 0) {
        setSepetUrunler([]);
        setYukleniyor(false);
        return;
      }

      try {
        // Sepet içeriğini güncelleyip, kullanıcıya sunulacak forma dönüştür
        const sepetUrunleri: CartProduct[] = [];

        // Explicitly cast to the appropriate type
        const typedSepetData = sepetData as unknown as SepetItemRow[];

        for (const sepetItem of typedSepetData) {
          // Stok bilgilerini çek
          const { data: stokData, error: stokError } = await supabase
            .from('stok')
            .select('*')
            .eq('stok_id', sepetItem.stok_id)
            .single();

          if (stokError) {
            console.error(`Stok verisi çekilirken hata (stok_id: ${sepetItem.stok_id}):`, stokError);
            continue;
          }

          // Cast the result to our interface
          const typedStokData = stokData as unknown as StokItemRow;
          if (!typedStokData) {
            console.error(`Stok verisi bulunamadı (stok_id: ${sepetItem.stok_id})`);
            continue;
          }

          // Ürün detaylarını çek
          const { data: urunDetay, error: urunError } = await supabase
            .from('urundetay')
            .select('*')
            .eq('urun_id', typedStokData.urun_id)
            .single();

          if (urunError) {
            console.error(`Ürün detayı çekilirken hata (urun_id: ${typedStokData.urun_id}):`, urunError);
            continue;
          }

          // Cast the result to our interface
          const typedUrunDetay = urunDetay as unknown as UrunDetayRow;
          if (!typedUrunDetay) {
            console.error(`Ürün detayı bulunamadı (urun_id: ${typedStokData.urun_id})`);
            continue;
          }

          sepetUrunleri.push({
            id: sepetItem.id,
            isim: typedUrunDetay.model,
            ebat: typedStokData.ebat || '',
            fiyat: typedStokData.fiyat,
            adet: sepetItem.adet,
            resim: typedUrunDetay.urun_resmi_0,
            stok_id: sepetItem.stok_id
          });
        }

        setSepetUrunler(sepetUrunleri);
      } catch (error) {
        console.error('Ürün bilgileri yüklenirken hata:', error);
        toast.error('Ürün bilgileri yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Sepet yüklenirken hata:', error);
      toast.error('Sepet bilgileri yüklenirken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  // Component mount olduğunda sepeti yükle
  useEffect(() => {
    sepetVerileriniYukle();
  }, []);

  // Toplam tutarı hesapla
  const toplamTutar = sepetUrunler.reduce((toplam, urun) => toplam + (urun.fiyat * urun.adet), 0);

  // Sepete ürün ekle
  const sepeteEkle = async (urun: CartProduct) => {
    setYukleniyor(true);
    try {
      // Ürün daha önce sepette var mı kontrol et
      const existingItemIndex = sepetUrunler.findIndex(
        (item) => item.stok_id === urun.stok_id
      );

      let yeniSepet: CartProduct[] = [...sepetUrunler];

      if (existingItemIndex >= 0) {
        // Ürün zaten sepette, adet artır
        yeniSepet[existingItemIndex] = {
          ...yeniSepet[existingItemIndex],
          adet: yeniSepet[existingItemIndex].adet + urun.adet,
        };
        toast.success("Ürün adedi güncellendi");
      } else {
        // Yeni ürün, sepete ekle
        yeniSepet.push(urun);
        toast.success("Ürün sepete eklendi");
      }

      setSepetUrunler(yeniSepet);
      await sepetKaydet(yeniSepet);
    } catch (error) {
      console.error('Ürün sepete eklenirken hata:', error);
      toast.error('Ürün sepete eklenirken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  // Sepeti veritabanına kaydet
  const sepetKaydet = async (yeniSepet: CartProduct[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Kullanıcı oturumu bulunamadı');
        return;
      }
      
      // Önce eski sepeti temizle
      const { error: deleteError } = await supabase
        .from('sepet')
        .delete()
        .eq('user_id', session.user.id);
        
      if (deleteError) {
        console.error('Sepet temizlenirken hata:', deleteError);
        toast.error('Sepet güncellenirken bir hata oluştu');
        return;
      }

      // Yeni sepeti kaydet
      if (yeniSepet.length > 0) {
        const sepetVerileri = yeniSepet.map(urun => ({
          user_id: session.user.id,
          stok_id: urun.stok_id,
          adet: urun.adet
        }));

        const { error: insertError } = await supabase
          .from('sepet')
          .insert(sepetVerileri);

        if (insertError) {
          console.error('Sepet kaydedilirken hata:', insertError);
          toast.error('Sepet kaydedilirken bir hata oluştu');
        }
      }
    } catch (error) {
      console.error('Sepet kaydedilirken hata:', error);
      toast.error('Sepet kaydedilirken bir hata oluştu');
    }
  };

  const sepettenCikar = async (urunId: number) => {
    setYukleniyor(true);
    try {
      const yeniSepet = sepetUrunler.filter(urun => urun.id !== urunId);
      setSepetUrunler(yeniSepet);
      await sepetKaydet(yeniSepet);
      toast.success('Ürün sepetten çıkarıldı');
    } catch (error) {
      console.error('Ürün sepetten çıkarılırken hata:', error);
      toast.error('Ürün sepetten çıkarılırken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  const adetGuncelle = async (urunId: number, yeniAdet: number) => {
    setYukleniyor(true);
    try {
      if (yeniAdet <= 0) {
        await sepettenCikar(urunId);
        return;
      }

      const yeniSepet = [...sepetUrunler];
      const urunIndex = yeniSepet.findIndex(urun => urun.id === urunId);
      
      if (urunIndex !== -1) {
        yeniSepet[urunIndex].adet = yeniAdet;
        setSepetUrunler(yeniSepet);
        await sepetKaydet(yeniSepet);
        toast.success('Ürün adedi güncellendi');
      }
    } catch (error) {
      console.error('Adet güncellenirken hata:', error);
      toast.error('Ürün adedi güncellenirken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  const sepetiTemizle = async () => {
    setYukleniyor(true);
    try {
      setSepetUrunler([]);
      await sepetKaydet([]);
      toast.success('Sepet temizlendi');
    } catch (error) {
      console.error('Sepet temizlenirken hata:', error);
      toast.error('Sepet temizlenirken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <CartContext.Provider value={{
      sepetUrunler,
      sepeteEkle,
      sepettenCikar,
      adetGuncelle,
      sepetiTemizle,
      toplamTutar,
      yukleniyor
    }}>
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