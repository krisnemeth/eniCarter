-- Contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  body text NOT NULL,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Gallery images (managed via Supabase Storage)
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  category text NOT NULL CHECK (category IN ('fresh', 'designs')),
  visible boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- contacts: anyone can insert, only authenticated users can read
CREATE POLICY "contacts_insert_anon" ON contacts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "contacts_select_auth" ON contacts FOR SELECT TO authenticated USING (true);

-- posts: anyone can read published posts, authenticated users have full access
CREATE POLICY "posts_select_published" ON posts FOR SELECT TO anon USING (published = true);
CREATE POLICY "posts_all_auth" ON posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- gallery_images: anyone can read visible images, authenticated users have full access
CREATE POLICY "gallery_select_visible" ON gallery_images FOR SELECT TO anon USING (visible = true);
CREATE POLICY "gallery_all_auth" ON gallery_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket for gallery images (run in Supabase dashboard or via CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
-- CREATE POLICY "gallery_public_read" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'gallery');
-- CREATE POLICY "gallery_auth_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');
-- CREATE POLICY "gallery_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery');
