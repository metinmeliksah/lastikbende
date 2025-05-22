-- Sipariş tablosunun yapısını kontrol et ve siparis_no alanını ekle
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'siparis' 
                  AND column_name = 'siparis_no') THEN
        ALTER TABLE public.siparis ADD COLUMN siparis_no TEXT;
        
        -- Mevcut yeni alan için bir indeks oluştur
        CREATE INDEX idx_siparis_no ON public.siparis(siparis_no);
        
        -- Bilgilendirme yapalım
        RAISE NOTICE 'siparis_no kolonu eklendi ve indekslendi';
    ELSE
        RAISE NOTICE 'siparis_no kolonu zaten mevcut';
    END IF;

    -- Diğer olası eksik alanları kontrol et
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'siparis' 
                  AND column_name = 'siparis_durumu') THEN
        ALTER TABLE public.siparis ADD COLUMN siparis_durumu TEXT NOT NULL DEFAULT 'siparis_alindi';
        RAISE NOTICE 'siparis_durumu kolonu eklendi';
    END IF;
    
    -- Diğer indeksleri kontrol et ve eksik olanları ekle
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_siparis_user_id') THEN
        CREATE INDEX idx_siparis_user_id ON public.siparis(user_id);
        RAISE NOTICE 'idx_siparis_user_id indeksi eklendi';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_siparis_durum') THEN
        CREATE INDEX idx_siparis_durum ON public.siparis(siparis_durumu);
        RAISE NOTICE 'idx_siparis_durum indeksi eklendi';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_siparis_tarih') THEN
        CREATE INDEX idx_siparis_tarih ON public.siparis(siparis_tarihi);
        RAISE NOTICE 'idx_siparis_tarih indeksi eklendi';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_siparis_magaza') THEN
        CREATE INDEX idx_siparis_magaza ON public.siparis(magaza_id) WHERE magaza_id IS NOT NULL;
        RAISE NOTICE 'idx_siparis_magaza indeksi eklendi';
    END IF;
    
    -- Trigger'ları kontrol et ve eksikse ekle
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'siparis_guncelleme_tarihi') THEN
        -- Önce fonksiyonu oluştur (eğer yoksa)
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_guncelleme_tarihi') THEN
            CREATE OR REPLACE FUNCTION update_guncelleme_tarihi() RETURNS TRIGGER AS $$
            BEGIN
                NEW.guncelleme_tarihi = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            RAISE NOTICE 'update_guncelleme_tarihi fonksiyonu eklendi';
        END IF;
        
        -- Trigger'ı ekle
        CREATE TRIGGER siparis_guncelleme_tarihi
        BEFORE UPDATE ON siparis
        FOR EACH ROW
        EXECUTE FUNCTION update_guncelleme_tarihi();
        RAISE NOTICE 'siparis_guncelleme_tarihi trigger eklendi';
    END IF;
    
    -- update_updated_at_column trigger'ını kontrol et
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_siparis_updated_at') THEN
        -- Önce fonksiyonu oluştur (eğer yoksa)
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
            CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            RAISE NOTICE 'update_updated_at_column fonksiyonu eklendi';
        END IF;
        
        -- Trigger'ı ekle
        CREATE TRIGGER update_siparis_updated_at
        BEFORE UPDATE ON siparis
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'update_siparis_updated_at trigger eklendi';
    END IF;
    
    -- Genel toplam hesaplama trigger'ını kontrol et
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_hesapla_genel_toplam') THEN
        -- Önce fonksiyonu oluştur (eğer yoksa)
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'hesapla_genel_toplam') THEN
            CREATE OR REPLACE FUNCTION hesapla_genel_toplam() RETURNS TRIGGER AS $$
            BEGIN
                NEW.genel_toplam = COALESCE(NEW.toplam_tutar, 0) + COALESCE(NEW.kargo_ucreti, 0);
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            RAISE NOTICE 'hesapla_genel_toplam fonksiyonu eklendi';
        END IF;
        
        -- Trigger'ı ekle
        CREATE TRIGGER tg_hesapla_genel_toplam
        BEFORE INSERT OR UPDATE ON siparis
        FOR EACH ROW
        EXECUTE FUNCTION hesapla_genel_toplam();
        RAISE NOTICE 'tg_hesapla_genel_toplam trigger eklendi';
    END IF;
    
    -- Sipariş durum değişikliği log'u için trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'siparis_durum_degisikligi') THEN
        -- Log tablosunu kontrol et ve yoksa oluştur
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'siparis_durum_log') THEN
            CREATE TABLE IF NOT EXISTS public.siparis_durum_log (
                id SERIAL PRIMARY KEY,
                siparis_id BIGINT NOT NULL REFERENCES siparis(id),
                eski_durum TEXT,
                yeni_durum TEXT,
                degisim_tarihi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                kullanici_id UUID
            );
            RAISE NOTICE 'siparis_durum_log tablosu oluşturuldu';
        END IF;
        
        -- Önce fonksiyonu oluştur (eğer yoksa)
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_siparis_durum_changes') THEN
            CREATE OR REPLACE FUNCTION log_siparis_durum_changes() RETURNS TRIGGER AS $$
            BEGIN
                IF OLD.siparis_durumu <> NEW.siparis_durumu THEN
                    INSERT INTO siparis_durum_log (siparis_id, eski_durum, yeni_durum, kullanici_id)
                    VALUES (NEW.id, OLD.siparis_durumu, NEW.siparis_durumu, auth.uid());
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            RAISE NOTICE 'log_siparis_durum_changes fonksiyonu eklendi';
        END IF;
        
        -- Trigger'ı ekle
        CREATE TRIGGER siparis_durum_degisikligi
        AFTER UPDATE ON siparis
        FOR EACH ROW
        EXECUTE FUNCTION log_siparis_durum_changes();
        RAISE NOTICE 'siparis_durum_degisikligi trigger eklendi';
    END IF;
END $$;

-- Teslimat tipinden sipariş numaralarını çıkarma
UPDATE public.siparis
SET 
    teslimat_tipi = CASE 
        WHEN teslimat_tipi LIKE 'adres%_SIP-%' THEN 'adres'
        WHEN teslimat_tipi LIKE 'magaza%_SIP-%' THEN 'magaza'
        ELSE teslimat_tipi 
    END,
    siparis_no = CASE 
        WHEN teslimat_tipi LIKE '%_SIP-%' THEN 
            SUBSTRING(teslimat_tipi FROM POSITION('_SIP-' IN teslimat_tipi) + 1)
        ELSE 
            COALESCE(siparis_no, 'SIP-' || TO_CHAR(COALESCE(siparis_tarihi, created_at), 'YYYYMMDD') || '-' || id)
    END
WHERE 
    teslimat_tipi LIKE '%_SIP-%' OR siparis_no IS NULL;

-- Boş sipariş numaralarını doldur (hala boş olanlar varsa)
UPDATE public.siparis
SET siparis_no = 'SIP-' || TO_CHAR(COALESCE(siparis_tarihi, created_at), 'YYYYMMDD') || '-' || id
WHERE siparis_no IS NULL;

-- Sipariş tablosunun tam ilişkilerini kontrol et ve gerekirse güncelle
DO $$
BEGIN
    -- Şema diyagramında görülen ilişkiler için gerekli yabancı anahtar kontrolleri
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_siparis_user_id' AND table_name = 'siparis') THEN
        -- Auth.users tablosuna referans (şema diyagramında gösterildiği gibi)
        BEGIN
            ALTER TABLE public.siparis
            ADD CONSTRAINT fk_siparis_user_id
            FOREIGN KEY (user_id) REFERENCES auth.users(id);
            RAISE NOTICE 'fk_siparis_user_id ilişkisi eklendi';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'fk_siparis_user_id ilişkisi eklenemedi: %', SQLERRM;
        END;
    END IF;
END $$;

-- Sipariş ID'sine göre sipariş ve ilgili ürünleri getiren bir fonksiyon
CREATE OR REPLACE FUNCTION get_siparis_with_urunler(p_siparis_id TEXT)
RETURNS TABLE (
    id BIGINT,
    user_id UUID,
    teslimat_tipi TEXT,
    siparis_no TEXT,
    durum TEXT,
    odeme_bilgisi JSONB,
    siparis_tarihi TIMESTAMPTZ,
    siparis_urunleri JSON
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        s.id,
        s.user_id,
        s.teslimat_tipi,
        s.siparis_no,
        s.durum,
        s.odeme_bilgisi,
        s.siparis_tarihi,
        (
            SELECT json_agg(json_build_object(
                'siparis_id', su.siparis_id,
                'stok_id', su.stok_id,
                'adet', su.adet,
                'fiyat', su.fiyat
            ))
            FROM siparis_urunleri su
            WHERE su.siparis_id = s.id
        ) AS siparis_urunleri
    FROM 
        siparis s
    WHERE 
        s.id::TEXT = p_siparis_id OR s.siparis_no = p_siparis_id;
END;
$$ LANGUAGE plpgsql;

-- Sipariş numarasına göre sipariş kaydını doğrulayan fonksiyon
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

-- RLS politikaları
ALTER TABLE public.siparis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siparis_urunleri ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları kontrol et ve gerekirse sil
DROP POLICY IF EXISTS "Kullanıcılar kendi siparişlerini görebilir" ON public.siparis;
DROP POLICY IF EXISTS "Kullanıcılar kendi siparişlerini güncelleyebilir" ON public.siparis;
DROP POLICY IF EXISTS "Kullanıcılar kendi siparişlerini oluşturabilir" ON public.siparis;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.siparis_urunleri;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.siparis_urunleri;
DROP POLICY IF EXISTS "Users can update their own order items" ON public.siparis_urunleri;

-- Yeni politikaları ekle
CREATE POLICY "Kullanıcılar kendi siparişlerini görebilir" ON public.siparis
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi siparişlerini güncelleyebilir" ON public.siparis
    FOR UPDATE
    USING (auth.uid() = user_id);

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