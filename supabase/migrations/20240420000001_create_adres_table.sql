-- Create adres table
CREATE TABLE IF NOT EXISTS adres (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    adres_baslik VARCHAR(100) NOT NULL,
    adres TEXT NOT NULL,
    sehir VARCHAR(50) NOT NULL,
    ilce VARCHAR(50) NOT NULL,
    telefon VARCHAR(20) NOT NULL,
    adres_tipi VARCHAR(20) NOT NULL CHECK (adres_tipi IN ('fatura', 'teslimat')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create RLS policies
ALTER TABLE adres ENABLE ROW LEVEL SECURITY;

-- Policy for select
CREATE POLICY "Users can view their own addresses"
    ON adres
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for insert
CREATE POLICY "Users can insert their own addresses"
    ON adres
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for update
CREATE POLICY "Users can update their own addresses"
    ON adres
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for delete
CREATE POLICY "Users can delete their own addresses"
    ON adres
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_adres_updated_at
    BEFORE UPDATE ON adres
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 