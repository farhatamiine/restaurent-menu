-- Shops Table
CREATE TABLE public.shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  owner_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('restaurant', 'barber')) NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- RLS for Shops
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public shops are viewable by everyone." ON public.shops FOR SELECT USING (true);
CREATE POLICY "Users can insert their own shop." ON public.shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own shop." ON public.shops FOR UPDATE USING (auth.uid() = owner_id);

-- Categories Table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  shop_id UUID REFERENCES public.shops ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- RLS for Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Shop owners can insert categories." ON public.categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid())
);
CREATE POLICY "Shop owners can update categories." ON public.categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid())
);
CREATE POLICY "Shop owners can delete categories." ON public.categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid())
);

-- Menu Items Table
CREATE TABLE public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  category_id UUID REFERENCES public.categories ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  metadata JSONB
);

-- RLS for Menu Items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items are viewable by everyone." ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Shop owners can insert items." ON public.menu_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.categories c
    JOIN public.shops s ON s.id = c.shop_id
    WHERE c.id = category_id AND s.owner_id = auth.uid()
  )
);
CREATE POLICY "Shop owners can update items." ON public.menu_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.categories c
    JOIN public.shops s ON s.id = c.shop_id
    WHERE c.id = category_id AND s.owner_id = auth.uid()
  )
);
CREATE POLICY "Shop owners can delete items." ON public.menu_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.categories c
    JOIN public.shops s ON s.id = c.shop_id
    WHERE c.id = category_id AND s.owner_id = auth.uid()
  )
);
