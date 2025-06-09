-- =================================================================
-- SİPARİŞ SİSTEMİ - BASİTLEŞTİRİLMİŞ VERSİYON
-- Kullanıcı sipariş takip sistemi için temel tablolar
-- =================================================================

-- 1. Sipariş tablosu (basitleştirilmiş)
CREATE TABLE IF NOT EXISTS public.siparis (
    id SERIAL PRIMARY KEY,
    siparis_no VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    teslimat_tipi VARCHAR(10) NOT NULL CHECK (teslimat_tipi IN ('adres', 'magaza')),
    durum VARCHAR(20) NOT NULL DEFAULT 'siparis_alindi' CHECK (durum IN (
        'siparis_alindi',
        'siparis_onaylandi', 
        'siparis_hazirlaniyor',
        'siparis_teslimatta',
        'siparis_tamamlandi',
        'siparis_iptal'
    )),
    toplam_tutar DECIMAL(10,2) NOT NULL DEFAULT 0,
    kargo_ucreti DECIMAL(10,2) NOT NULL DEFAULT 0,
    genel_toplam DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sipariş güncellemesi için trigger
CREATE OR REPLACE FUNCTION update_siparis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_siparis_updated_at ON public.siparis;
CREATE TRIGGER trigger_update_siparis_updated_at
    BEFORE UPDATE ON public.siparis
    FOR EACH ROW
    EXECUTE FUNCTION update_siparis_updated_at();

-- 3. Sipariş numarası otomatik oluşturma
CREATE OR REPLACE FUNCTION generate_siparis_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.siparis_no IS NULL OR NEW.siparis_no = '' THEN
        NEW.siparis_no := 'SIP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_siparis_no ON public.siparis;
CREATE TRIGGER trigger_generate_siparis_no
    BEFORE INSERT ON public.siparis
    FOR EACH ROW
    EXECUTE FUNCTION generate_siparis_no();

-- 4. RLS (Row Level Security) politikaları
ALTER TABLE public.siparis ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi siparişlerini görebilir
DROP POLICY IF EXISTS "Users can view own orders" ON public.siparis;
CREATE POLICY "Users can view own orders" ON public.siparis
    FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi siparişlerini ekleyebilir
DROP POLICY IF EXISTS "Users can insert own orders" ON public.siparis;
CREATE POLICY "Users can insert own orders" ON public.siparis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Test verisi ekleme
INSERT INTO public.siparis (user_id, teslimat_tipi, durum, toplam_tutar, kargo_ucreti, genel_toplam) 
VALUES 
    (auth.uid(), 'adres', 'siparis_tamamlandi', 1299.99, 29.99, 1329.98),
    (auth.uid(), 'adres', 'siparis_teslimatta', 899.99, 19.99, 919.98),
    (auth.uid(), 'magaza', 'siparis_hazirlaniyor', 1599.99, 0.00, 1599.99)
ON CONFLICT DO NOTHING;

-- 6. İndeksler
CREATE INDEX IF NOT EXISTS idx_siparis_user_id ON public.siparis(user_id);
CREATE INDEX IF NOT EXISTS idx_siparis_created_at ON public.siparis(created_at);
CREATE INDEX IF NOT EXISTS idx_siparis_durum ON public.siparis(durum);

-- 7. Yönetici için tüm siparişleri görme yetkisi
DROP POLICY IF EXISTS "Admins can view all orders" ON public.siparis;
CREATE POLICY "Admins can view all orders" ON public.siparis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND user_role = 'admin'
        )
    );

COMMENT ON TABLE public.siparis IS 'Kullanıcı siparişleri tablosu - basitleştirilmiş versiyon';
COMMENT ON COLUMN public.siparis.siparis_no IS 'Benzersiz sipariş numarası';
COMMENT ON COLUMN public.siparis.durum IS 'Sipariş durumu: alindi, onaylandi, hazirlaniyor, teslimatta, tamamlandi, iptal';
COMMENT ON COLUMN public.siparis.teslimat_tipi IS 'Teslimat tipi: adres veya magaza'; 