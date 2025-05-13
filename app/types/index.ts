export interface CartProduct {
  id: number;
  isim: string;
  ebat: string;
  fiyat: number;
  adet: number;
  resim: string;
  stok_id: number;
}

// Interface for database cart item
export interface SepetItem {
  id: number;
  user_id: string;
  stok_id: number;
  adet: number;
}

// Legacy interfaces kept for backward compatibility
export interface CartDatabaseItem extends CartProduct {
  user_id: string;
}

export interface DatabaseCartItem {
  id: number;
  user_id: string;
  stok_id: number;
  adet: number;
}

export interface Adres {
  id?: number;
  user_id?: string;
  adres_baslik: string;
  adres: string;
  sehir: string;
  ilce: string;
  telefon: string;
  adres_tipi: 'fatura' | 'teslimat';
  created_at?: string;
  updated_at?: string;
}

export interface MontajBilgisi {
  bayi_id?: number;
  tarih: string;
  saat: string;
  not?: string;
}

export interface OdemeBilgisi {
  yontem: 'credit-card' | 'bank-transfer';
  durum?: 'beklemede' | 'onaylandi' | 'reddedildi';
  referans_no?: string;
  tutar: number;
  odeme_tarihi?: string;
  kartNo?: string;
  kartSahibi?: string;
  banka?: string;
}

export interface Siparis {
  id?: number;
  siparis_no?: string;
  user_id: string;
  teslimat_tipi: 'adres' | 'magaza';
  teslimat_adres_id?: number;
  fatura_adres_id: number;
  magaza_id?: number | null;
  montaj_bilgisi?: MontajBilgisi | null;
  montaj_bayi_id?: number | null;
  montaj_tarihi?: string | null;
  montaj_saati?: string | null;
  montaj_notu?: string | null;
  odeme_bilgisi: OdemeBilgisi;
  durum?: string;
  siparis_durumu?: string;
  toplam_tutar: number;
  kargo_ucreti: number;
  genel_toplam: number;
  siparis_tarihi?: string;
  guncelleme_tarihi?: string;
  siparis_urunleri?: SiparisUrun[];
}

export interface SiparisUrun {
  id?: number;
  siparis_id?: number;
  stok_id: number | string;
  adet: number;
  fiyat: number;
  urun_bilgisi?: {
    isim?: string;
    ebat?: string;
    resim?: string;
  };
}

export interface Bayi {
  id: number;
  isim: string;
  adres: string;
  sehir: string;
  ilce: string;
  telefon: string;
}

export interface SiparisDetay extends Siparis {
  urunler?: SiparisUrun[];
} 