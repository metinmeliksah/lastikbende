-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    CONSTRAINT valid_cart_status CHECK (status IN ('active', 'converted', 'abandoned'))
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    stok_id INTEGER REFERENCES stok(stok_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, stok_id)
);

-- Create indexes for better performance
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_status ON carts(status);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_stok_id ON cart_items(stok_id);

-- Add RLS policies for carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own carts"
    ON carts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own carts"
    ON carts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carts"
    ON carts FOR UPDATE
    USING (auth.uid() = user_id);

-- Add RLS policies for cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart items"
    ON cart_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own cart items"
    ON cart_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own cart items"
    ON cart_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own cart items"
    ON cart_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()
    ));

-- Create function to update cart updated_at timestamp
CREATE OR REPLACE FUNCTION update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE carts
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.cart_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cart_items
CREATE TRIGGER update_cart_timestamp
    AFTER INSERT OR UPDATE OR DELETE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_timestamp(); 