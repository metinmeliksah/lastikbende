-- RLS'yi etkinleştir
ALTER TABLE public.siparis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siparis_urunleri ENABLE ROW LEVEL SECURITY;

-- siparis_no kolonu yoksa ekle
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'siparis' 
                  AND column_name = 'siparis_no') THEN
        ALTER TABLE public.siparis ADD COLUMN siparis_no TEXT;
        
        -- Var olan siparişler için siparis_no değerlerini oluştur
        UPDATE public.siparis
        SET siparis_no = 'SIP-' || TO_CHAR(COALESCE(siparis_tarihi, created_at), 'YYYYMMDD') || '-' || id
        WHERE siparis_no IS NULL;
    END IF;
END $$;

-- Teslimat tipi kolonundan sipariş numaralarını çıkar ve siparis_no kolonuna kaydet 
UPDATE public.siparis
SET 
    teslimat_tipi = SPLIT_PART(teslimat_tipi, '_', 1),
    siparis_no = SUBSTRING(teslimat_tipi FROM POSITION('_' IN teslimat_tipi) + 1)
WHERE 
    teslimat_tipi LIKE '%\_%' AND
    teslimat_tipi LIKE '%SIP-%';

-- Sipariş kaydını doğrulamak için fonksiyon
CREATE OR REPLACE FUNCTION dogrula_siparis_kaydi(p_siparis_no TEXT)
RETURNS TABLE (
    id BIGINT,
    siparis_no TEXT
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        s.id,
        s.siparis_no
    FROM 
        siparis s
    WHERE 
        s.siparis_no = p_siparis_no OR
        s.teslimat_tipi LIKE '%' || p_siparis_no;
END;
$$ LANGUAGE plpgsql;

-- Doğrudan sipariş kaydeden fonksiyon (acil durumlar için)
CREATE OR REPLACE FUNCTION dogrudan_siparis_kaydet(
    p_user_id UUID,
    p_teslimat_tipi TEXT,
    p_fatura_adres_id INTEGER,
    p_odeme_bilgisi JSONB,
    p_toplam_tutar NUMERIC
) 
RETURNS TABLE (
    id BIGINT,
    siparis_no TEXT
) AS $$
DECLARE
    v_siparis_id BIGINT;
    v_siparis_no TEXT;
BEGIN
    -- Teslimat tipinden sipariş numarasını çıkar
    IF p_teslimat_tipi LIKE '%_SIP-%' THEN
        v_siparis_no := SUBSTRING(p_teslimat_tipi FROM POSITION('_SIP-' IN p_teslimat_tipi) + 1);
    ELSE
        v_siparis_no := 'SIP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || FLOOR(RANDOM() * 1000)::TEXT;
    END IF;

    -- Kaydı oluştur
    INSERT INTO siparis (
        user_id,
        teslimat_tipi,
        fatura_adres_id,
        odeme_bilgisi,
        durum,
        siparis_durumu,
        toplam_tutar,
        genel_toplam,
        siparis_tarihi,
        guncelleme_tarihi,
        siparis_no
    ) VALUES (
        p_user_id,
        SPLIT_PART(p_teslimat_tipi, '_', 1), -- Teslimat tipini temizle
        p_fatura_adres_id,
        p_odeme_bilgisi,
        'hazırlanıyor',
        'siparis_alindi',
        p_toplam_tutar,
        p_toplam_tutar,
        NOW(),
        NOW(),
        v_siparis_no
    ) RETURNING id INTO v_siparis_id;

    RETURN QUERY 
    SELECT 
        v_siparis_id,
        v_siparis_no;
END;
$$ LANGUAGE plpgsql;

-- Kullanıcıların kendi siparişlerini görebilmesi için politika
CREATE POLICY "Kullanıcılar kendi siparişlerini görebilir" ON public.siparis
    FOR SELECT
    USING (auth.uid() = user_id);

-- Kullanıcıların kendi siparişlerini güncelleyebilmesi için politika
CREATE POLICY "Kullanıcılar kendi siparişlerini güncelleyebilir" ON public.siparis
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Kullanıcıların kendi siparişlerini oluşturabilmesi için politika
CREATE POLICY "Kullanıcılar kendi siparişlerini oluşturabilir" ON public.siparis
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Sipariş ürünleri için politikalar
CREATE POLICY "Users can view their own order items" ON public.siparis_urunleri
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.siparis
        WHERE siparis.id = siparis_urunleri.siparis_id
        AND siparis.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own order items" ON public.siparis_urunleri
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.siparis
        WHERE siparis.id = siparis_urunleri.siparis_id
        AND siparis.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own order items" ON public.siparis_urunleri
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.siparis
        WHERE siparis.id = siparis_urunleri.siparis_id
        AND siparis.user_id = auth.uid()
    )); 