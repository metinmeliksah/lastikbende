export interface Adres {
  id: number;
  user_id: string;
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

export interface SepetUrun {
  id: number;
  isim: string;
  resim: string;
  fiyat: number;
  adet: number;
  ebat: string;
}

export interface Siparis {
  id: number;
  user_id: string;
  fatura_adres_id: number;
  teslimat_adres_id: number;
  durum: 'hazırlanıyor' | 'onaylandı' | 'montaj' | 'kargoda' | 'tamamlandı' | 'iptal';
  teslimat_tipi: 'adres' | 'magaza';
  toplam_tutar: number;
  kargo_tutari: number;
  montaj_bayi_id?: number;
  montaj_tarihi?: string;
  montaj_saati?: string;
  montaj_notu?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SiparisUrun {
  id: number;
  siparis_id: number;
  stok_id: number;
  adet: number;
  fiyat: number;
} 