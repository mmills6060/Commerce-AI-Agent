-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  image TEXT,
  images TEXT[],
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  total DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public read access)
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  USING (true);

CREATE POLICY "Products can be inserted by authenticated users" 
  ON products FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products can be updated by authenticated users" 
  ON products FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Products can be deleted by authenticated users" 
  ON products FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create policies for orders
CREATE POLICY "Orders are viewable by their owner" 
  ON orders FOR SELECT 
  USING (user_id = auth.uid()::text OR auth.role() = 'authenticated');

CREATE POLICY "Orders can be created by anyone" 
  ON orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Orders can be updated by their owner or authenticated users" 
  ON orders FOR UPDATE 
  USING (user_id = auth.uid()::text OR auth.role() = 'authenticated');

-- Create policies for chat_sessions
CREATE POLICY "Chat sessions are viewable by their owner" 
  ON chat_sessions FOR SELECT 
  USING (user_id = auth.uid()::text OR user_id IS NULL OR auth.role() = 'authenticated');

CREATE POLICY "Chat sessions can be created by anyone" 
  ON chat_sessions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Chat sessions can be updated by their owner" 
  ON chat_sessions FOR UPDATE 
  USING (user_id = auth.uid()::text OR user_id IS NULL OR auth.role() = 'authenticated');

CREATE POLICY "Chat sessions can be deleted by their owner" 
  ON chat_sessions FOR DELETE 
  USING (user_id = auth.uid()::text OR auth.role() = 'authenticated');

