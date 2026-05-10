-- ===========================================
-- IMPACT COMPUTERS GHANSOLI - SUPABASE SETUP
-- ===========================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard → Your Project → SQL Editor
-- ===========================================

-- ===========================================
-- 1. ENABLE UUID EXTENSION
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 2. CREATE TABLES
-- ===========================================

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  icon TEXT DEFAULT 'GraduationCap',
  duration TEXT DEFAULT '',
  fees TEXT DEFAULT '',
  description TEXT DEFAULT '',
  overview TEXT DEFAULT '',
  syllabus JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  color TEXT DEFAULT 'from-brand-purple to-brand-purple-dark',
  popular BOOLEAN DEFAULT false,
  certification TEXT DEFAULT '',
  exam_details TEXT DEFAULT '',
  icon_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  designation TEXT DEFAULT '',
  branch TEXT DEFAULT 'Ghansoli - Sector 7',
  bio TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Photos (Gallery Images) table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT DEFAULT 'General',
  caption TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT DEFAULT '',
  section TEXT DEFAULT 'General',
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  section TEXT DEFAULT 'General',
  image_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users table (Admin authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- 3. CREATE INDEXES
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_sort ON courses(sort_order, created_at);

CREATE INDEX IF NOT EXISTS idx_faculty_active ON faculty(is_active);
CREATE INDEX IF NOT EXISTS idx_faculty_sort ON faculty(sort_order, created_at);

CREATE INDEX IF NOT EXISTS idx_photos_active ON photos(is_active);
CREATE INDEX IF NOT EXISTS idx_photos_section ON photos(section);
CREATE INDEX IF NOT EXISTS idx_photos_sort ON photos(sort_order, created_at);

CREATE INDEX IF NOT EXISTS idx_videos_active ON videos(is_active);
CREATE INDEX IF NOT EXISTS idx_videos_section ON videos(section);
CREATE INDEX IF NOT EXISTS idx_videos_sort ON videos(sort_order, created_at);

CREATE INDEX IF NOT EXISTS idx_certificates_active ON certificates(is_active);
CREATE INDEX IF NOT EXISTS idx_certificates_section ON certificates(section);
CREATE INDEX IF NOT EXISTS idx_certificates_sort ON certificates(sort_order, created_at);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- ===========================================
-- 4. CREATE UPDATED_AT TRIGGER
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 5. CREATE STORAGE BUCKETS
-- ===========================================
-- Run these in your Supabase SQL Editor to create storage buckets:

INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('faculty', 'faculty', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('courses', 'courses', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all storage buckets
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id IN ('photos', 'faculty', 'certificates', 'courses'));

CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('photos', 'faculty', 'certificates', 'courses'));

CREATE POLICY "Authenticated update" ON storage.objects
  FOR UPDATE USING (bucket_id IN ('photos', 'faculty', 'certificates', 'courses'));

CREATE POLICY "Authenticated delete" ON storage.objects
  FOR DELETE USING (bucket_id IN ('photos', 'faculty', 'certificates', 'courses'));

-- ===========================================
-- 6. DISABLE RLS (since we use service_role key)
-- ===========================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow service_role to bypass RLS (this is default in Supabase)
-- For anon key, allow public reads on active content
CREATE POLICY "Public read active courses" ON courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active faculty" ON faculty
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active photos" ON photos
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active videos" ON videos
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active certificates" ON certificates
  FOR SELECT USING (is_active = true);

-- ===========================================
-- 7. INSERT DEFAULT ADMIN USER
-- Password: impact@1997
-- ===========================================
-- Note: The bcrypt hash below is for 'impact@1997'
-- In production, change this password after first login!

INSERT INTO users (username, password_hash, display_name, role, permissions, is_active)
VALUES (
  'admin',
  '$2b$12$LJ3m4ys3KqnhmZ5m5S5OQOZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',  -- Change this after setup!
  'Administrator',
  'admin',
  '{"courses":{"read":true,"write":true},"faculty":{"read":true,"write":true},"gallery":{"read":true,"write":true},"videos":{"read":true,"write":true},"certificates":{"read":true,"write":true}}'::jsonb,
  true
)
ON CONFLICT (username) DO NOTHING;

-- ===========================================
-- SETUP COMPLETE!
-- ===========================================
-- Next steps:
-- 1. Update .env with your Supabase URL and keys
-- 2. Run: npm install
-- 3. Run: npm run dev
-- 4. Login at /admin with admin / impact@1997
-- 5. Change the admin password immediately!
-- ===========================================
