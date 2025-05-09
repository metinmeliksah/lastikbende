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
  bayi_id: number;
  tarih: string;
  saat: string;
  not?: string;
}

export interface Siparis {
  id?: number;
  user_id?: string;
  fatura_adres_id: number;
  teslimat_adres_id: number;
  montaj_bayi_id?: number;
  montaj_tarihi?: string;
  montaj_saati?: string;
  montaj_notu?: string;
  toplam_tutar: number;
  kargo_tutari: number;
  durum: 'hazırlanıyor' | 'onaylandı' | 'montaj' | 'kargoda' | 'tamamlandı' | 'iptal';
  teslimat_tipi: 'adres' | 'magaza';
  created_at?: string;
  updated_at?: string;
}

export interface SiparisUrun {
  id?: number;
  siparis_id: number;
  stok_id: number;
  adet: number;
  fiyat: number;
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