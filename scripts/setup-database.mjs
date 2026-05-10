#!/usr/bin/env node

/**
 * Database Setup Script for Impact Computers
 * 
 * Creates all required tables, indexes, triggers, and default data.
 * Supports three execution modes:
 *   1. Direct PostgreSQL via DATABASE_URL (preferred)
 *   2. Supabase Management API via SUPABASE_ACCESS_TOKEN
 *   3. Prints SQL for manual execution in Supabase Dashboard
 * 
 * Usage: node scripts/setup-database.mjs
 * 
 * Env vars:
 *   DATABASE_URL          - PostgreSQL connection string (direct DB mode)
 *   SUPABASE_ACCESS_TOKEN - Management API token (API mode)
 *   SUPABASE_URL          - Project URL e.g. https://xxx.supabase.co (API mode)
 */

import pg from 'pg'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Client } = pg

// ==========================================
// Load .env file (shell env vars can override)
// ==========================================

function loadEnvFile() {
  try {
    const __filename = fileURLToPath(import.meta.url)
    const projectRoot = join(dirname(__filename), '..')
    const envPath = join(projectRoot, '.env')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim()
      // Only set if not already defined in environment (shell takes precedence)
      if (!(key in process.env)) {
        process.env[key] = value
      }
    }
  } catch {
    // .env file not found - continue with env vars only
  }
}

loadEnvFile()

// ==========================================
// Configuration
// ==========================================

const DATABASE_URL = process.env.DATABASE_URL || ''
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || ''
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const PROJECT_REF = SUPABASE_URL ? SUPABASE_URL.replace('https://', '').replace('.supabase.co', '') : ''

// Default admin user password hash for 'impact@1997'
const ADMIN_PASSWORD_HASH = '$2b$12$Pm1YKedCNG3qBjvR95i3KeRfZnKFezSwfzKOk1zqgrhHk1MbC5N7q'

// ==========================================
// SQL Statements
// ==========================================

const FULL_SQL = `
-- ===========================================
-- IMPACT COMPUTERS - FULL DATABASE SETUP
-- ===========================================

-- 1. ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

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

CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  course_interest TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'new',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faculty_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  password_hash TEXT,
  display_name TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT DEFAULT '',
  visitor_name TEXT DEFAULT '',
  visitor_email TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CREATE INDEXES
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
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at);

-- 4. CREATE UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CREATE TRIGGERS (drop existing first)
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_faculty_updated_at ON faculty;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_photos_updated_at ON photos;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_users_updated_at ON users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_faculty_accounts_updated_at ON faculty_accounts;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE TRIGGER update_faculty_accounts_updated_at BEFORE UPDATE ON faculty_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. ROW LEVEL SECURITY
DO $$ BEGIN ALTER TABLE courses ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE faculty ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE photos ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE videos ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE certificates ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE users ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Public read policies
DO $$ BEGIN CREATE POLICY "Public read active courses" ON courses FOR SELECT USING (is_active = true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read active faculty" ON faculty FOR SELECT USING (is_active = true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read active photos" ON photos FOR SELECT USING (is_active = true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read active videos" ON videos FOR SELECT USING (is_active = true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read active certificates" ON certificates FOR SELECT USING (is_active = true); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 7. INSERT DEFAULT ADMIN USER (Password: impact@1997)
INSERT INTO users (username, password_hash, display_name, role, permissions, is_active)
VALUES (
  'admin',
  '${ADMIN_PASSWORD_HASH}',
  'Administrator',
  'admin',
  '{"courses":{"read":true,"write":true},"faculty":{"read":true,"write":true},"gallery":{"read":true,"write":true},"videos":{"read":true,"write":true},"certificates":{"read":true,"write":true},"enquiries":{"read":true,"write":true}}'::jsonb,
  true
)
ON CONFLICT (username) DO NOTHING;
`

// SQL for just the missing tables (faculty_accounts, chat_sessions)
const MISSING_TABLES_SQL = `
-- Missing tables: faculty_accounts and chat_sessions

CREATE TABLE IF NOT EXISTS faculty_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID REFERENCES faculty(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  password_hash TEXT,
  display_name TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT DEFAULT '',
  visitor_name TEXT DEFAULT '',
  visitor_email TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at);

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_faculty_accounts_updated_at ON faculty_accounts;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE TRIGGER update_faculty_accounts_updated_at BEFORE UPDATE ON faculty_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN ALTER TABLE faculty_accounts ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END $$;
`

// ==========================================
// Mode 1: Direct PostgreSQL
// ==========================================

async function runViaPostgreSQL() {
  if (!DATABASE_URL) return false

  console.log('📡 Mode: Direct PostgreSQL connection')
  console.log(`   URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`)

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  let connected = false
  try {
    await client.connect()
    connected = true
  } catch (err) {
    console.log(`   ⚠️  Direct connection failed: ${err.message}\n`)
    return false
  }

  try {
    console.log('✅ Connected to database\n')

    console.log('📦 Creating tables...')
    await client.query(FULL_SQL)
    console.log('   ✅ All tables, indexes, triggers, and policies created')

    console.log('👤 Ensuring default admin user...')
    console.log('   ✅ Admin user ready (admin / impact@1997)')

    console.log('\n📊 Verifying...')
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    console.log('   Tables:')
    for (const row of tables.rows) {
      console.log(`   - ${row.table_name}`)
    }

    console.log('\n✅ Database setup completed successfully!')
    return true
  } catch (error) {
    console.error(`\n❌ Database setup failed: ${error.message}`)
    if (error.code) console.error(`   Code: ${error.code}`)
    return false
  } finally {
    await client.end()
  }
}

// ==========================================
// Mode 2: Supabase Management API
// ==========================================

async function runViaManagementAPI() {
  if (!SUPABASE_ACCESS_TOKEN || !PROJECT_REF) return false

  console.log('📡 Mode: Supabase Management API')
  console.log(`   Project: ${PROJECT_REF}\n`)

  try {
    console.log('📦 Running full setup SQL...')
    const resp = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: FULL_SQL }),
      }
    )

    if (!resp.ok) {
      const text = await resp.text()
      console.error(`   ❌ API error ${resp.status}: ${text}`)
      return false
    }

    const result = await resp.json()
    if (result.error) {
      console.error(`   ❌ SQL error: ${result.error}`)
      return false
    }

    console.log('   ✅ All tables, indexes, triggers, and policies created')
    console.log('\n✅ Database setup completed successfully!')
    return true
  } catch (error) {
    console.error(`\n❌ Management API failed: ${error.message}`)
    return false
  }
}

// ==========================================
// Mode 3: Verify via REST API + Print SQL
// ==========================================

async function runViaRESTAPI() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log('⚠️  No Supabase URL or service key available for verification.')
    console.log('   Provide DATABASE_URL or SUPABASE_ACCESS_TOKEN for automatic setup.\n')
    return false
  }

  console.log('📡 Mode: REST API verification')
  console.log(`   URL: ${SUPABASE_URL}\n`)

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const expectedTables = [
    'courses', 'faculty', 'photos', 'videos',
    'certificates', 'users', 'enquiries',
    'faculty_accounts', 'chat_sessions'
  ]

  console.log('📊 Checking existing tables...\n')
  const missing = []

  for (const table of expectedTables) {
    const { error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    if (error) {
      console.log(`   ❌ ${table} - MISSING (${error.message})`)
      missing.push(table)
    } else {
      console.log(`   ✅ ${table} - exists`)
    }
  }

  // Check admin user
  const { data: users, error: uErr } = await supabase
    .from('users')
    .select('username, role')
    .eq('username', 'admin')
  if (uErr) {
    console.log(`   ⚠️  Could not check admin user: ${uErr.message}`)
  } else if (users && users.length > 0) {
    console.log(`   ✅ admin user exists (role: ${users[0].role})`)
  } else {
    console.log('   ⚠️  admin user not found')
  }

  if (missing.length > 0) {
    console.log(`\n⚠️  Missing tables: ${missing.join(', ')}`)
    console.log('\n📄 Run this SQL in your Supabase Dashboard → SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql\n')
    console.log('─── COPY BELOW ───')
    console.log(MISSING_TABLES_SQL)
    console.log('─── END SQL ───\n')
    return false
  }

  console.log('\n✅ All tables verified!')
  return true
}

// ==========================================
// Main Execution
// ==========================================

async function run() {
  console.log('🔧 Impact Computers Database Setup')
  console.log('================================\n')

  // Try Mode 1: Direct PostgreSQL
  if (DATABASE_URL) {
    const ok = await runViaPostgreSQL()
    if (ok) {
      console.log('\n🚀 Next steps:')
      console.log('   1. Start the app: npm run dev')
      console.log('   2. Login at /admin with admin / impact@1997')
      console.log('   3. Change the admin password after first login!\n')
      return
    }
  }

  // Try Mode 2: Management API
  if (SUPABASE_ACCESS_TOKEN) {
    const ok = await runViaManagementAPI()
    if (ok) {
      console.log('\n🚀 Next steps:')
      console.log('   1. Start the app: npm run dev')
      console.log('   2. Login at /admin with admin / impact@1997')
      console.log('   3. Change the admin password after first login!\n')
      return
    }
  }

  // Try Mode 3: REST API verification
  const ok = await runViaRESTAPI()

  if (!ok) {
    console.log('\n💡 To set up the database automatically, provide one of:')
    console.log('   1. DATABASE_URL env var (direct PostgreSQL connection)')
    console.log('   2. SUPABASE_ACCESS_TOKEN env var (Supabase Management API)')
    console.log('\n   Or run the SQL manually in Supabase Dashboard SQL Editor.\n')
    console.log('─── FULL SQL (if all tables are missing) ───')
    console.log(FULL_SQL)
    console.log('─── END SQL ───\n')
    process.exit(1)
  }

  console.log('\n🚀 Next steps:')
  console.log('   1. Start the app: npm run dev')
  console.log('   2. Login at /admin with admin / impact@1997')
  console.log('   3. Change the admin password after first login!\n')
}

run()
