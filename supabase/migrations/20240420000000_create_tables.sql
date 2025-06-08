-- Create sepet table
CREATE TABLE sepet (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    urun_id BIGINT NOT NULL,
    isim TEXT NOT NULL,
    ebat TEXT NOT NULL,
    fiyat DECIMAL(10,2) NOT NULL,
    adet INTEGER NOT NULL CHECK (adet > 0),
    resim TEXT NOT NULL,
    stok_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, urun_id, ebat)
);

-- Create RLS policies for sepet table
ALTER TABLE sepet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart items"
    ON sepet FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
    ON sepet FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
    ON sepet FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
    ON sepet FOR DELETE
    USING (auth.uid() = user_id);

-- Create adres table
CREATE TABLE adres (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    adres_baslik TEXT NOT NULL,
    adres TEXT NOT NULL,
    sehir TEXT NOT NULL,
    ilce TEXT NOT NULL,
    telefon TEXT NOT NULL,
    adres_tipi TEXT NOT NULL CHECK (adres_tipi IN ('fatura', 'teslimat')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for adres table
ALTER TABLE adres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addresses"
    ON adres FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
    ON adres FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
    ON adres FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
    ON adres FOR DELETE
    USING (auth.uid() = user_id);

-- Create bayiler table
CREATE TABLE bayiler (
    id BIGSERIAL PRIMARY KEY,
    isim TEXT NOT NULL,
    adres TEXT NOT NULL,
    sehir TEXT NOT NULL,
    ilce TEXT NOT NULL,
    telefon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for bayiler table
ALTER TABLE bayiler ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view dealers"
    ON bayiler FOR SELECT
    TO authenticated
    USING (true);

-- Create siparis table
CREATE TABLE siparis (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fatura_adres_id BIGINT NOT NULL REFERENCES adres(id),
    teslimat_adres_id BIGINT NOT NULL REFERENCES adres(id),
    montaj_bayi_id BIGINT REFERENCES bayiler(id),
    montaj_tarihi DATE,
    montaj_saati TEXT,
    montaj_notu TEXT,
    toplam_tutar DECIMAL(10,2) NOT NULL,
    kargo_tutari DECIMAL(10,2) NOT NULL,
    durum TEXT NOT NULL CHECK (durum IN ('hazırlanıyor', 'onaylandı', 'montaj', 'kargoda', 'tamamlandı', 'iptal')),
    teslimat_tipi TEXT NOT NULL CHECK (teslimat_tipi IN ('adres', 'magaza')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for siparis table
ALTER TABLE siparis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
    ON siparis FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
    ON siparis FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
    ON siparis FOR UPDATE
    USING (auth.uid() = user_id);

-- Create siparis_urunleri table
CREATE TABLE siparis_urunleri (
    id BIGSERIAL PRIMARY KEY,
    siparis_id BIGINT NOT NULL REFERENCES siparis(id) ON DELETE CASCADE,
    stok_id BIGINT NOT NULL,
    adet INTEGER NOT NULL CHECK (adet > 0),
    fiyat DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for siparis_urunleri table
ALTER TABLE siparis_urunleri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items"
    ON siparis_urunleri FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM siparis s
            WHERE s.id = siparis_id
            AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own order items"
    ON siparis_urunleri FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM siparis s
            WHERE s.id = siparis_id
            AND s.user_id = auth.uid()
        )
    );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sepet_updated_at
    BEFORE UPDATE ON sepet
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adres_updated_at
    BEFORE UPDATE ON adres
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bayiler_updated_at
    BEFORE UPDATE ON bayiler
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_siparis_updated_at
    BEFORE UPDATE ON siparis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 