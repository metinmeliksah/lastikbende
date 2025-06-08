-- Ödeme logları tablosu
CREATE TABLE IF NOT EXISTS odeme_log (
  id BIGSERIAL PRIMARY KEY,
  kullanici_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referans_no TEXT NOT NULL UNIQUE,
  yontem TEXT NOT NULL CHECK (yontem IN ('credit-card', 'bank-transfer')),
  tutar DECIMAL(10,2) NOT NULL,
  durum TEXT NOT NULL CHECK (durum IN ('beklemede', 'onaylandi', 'reddedildi', 'iade')),
  detaylar JSONB DEFAULT '{}'::jsonb,
  olusturma_tarihi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  guncelleme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Otomatik güncelleme tarihi için trigger
CREATE OR REPLACE FUNCTION update_odeme_log_guncelleme_tarihi()
RETURNS TRIGGER AS $$
BEGIN
  NEW.guncelleme_tarihi = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER odeme_log_guncelleme_tarihi
  BEFORE UPDATE ON odeme_log
  FOR EACH ROW
  EXECUTE FUNCTION update_odeme_log_guncelleme_tarihi();

-- RLS politikaları
ALTER TABLE odeme_log ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi ödemelerini görebilir
CREATE POLICY "Kullanıcılar kendi ödemelerini görebilir"
  ON odeme_log FOR SELECT
  USING (auth.uid() = kullanici_id);

-- Admin rollü kullanıcılar tüm ödemeleri görebilir
CREATE POLICY "Adminler tüm ödemeleri görebilir"
  ON odeme_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- İndeks
CREATE INDEX idx_odeme_log_kullanici_id ON odeme_log(kullanici_id);
CREATE INDEX idx_odeme_log_referans_no ON odeme_log(referans_no);
CREATE INDEX idx_odeme_log_durum ON odeme_log(durum);

-- Sipariş tablosundaki odeme_bilgisi alanı için örnek açıklama güncelleme
COMMENT ON COLUMN siparis.odeme_bilgisi IS 
'Ödeme bilgileri için örnek JSON yapısı:
{
  "yontem": "credit-card|bank-transfer",
  "durum": "beklemede|onaylandi|reddedildi",
  "referans_no": "ödeme referans numarası",
  "tutar": 1000.00,
  "odeme_tarihi": "2024-04-25T14:30:00Z",
  "detaylar": {
    "kart_tipi": "visa|mastercard|troy|amex",
    "son_4_hane": "1234"
  }
}'; 