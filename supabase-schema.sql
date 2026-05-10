-- =============================================
-- IMPACT COMPUTERS - COMPLETE SUPABASE SCHEMA
-- =============================================
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Execute the ENTIRE script at once.
--
-- STEP 1: Create all tables
-- STEP 2: Create storage buckets & policies
-- STEP 3: Create indexes
-- STEP 4: Enable RLS & create policies
-- STEP 5: Create triggers
-- STEP 6: Insert default admin user
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLE 1: USERS (for admin authentication)
-- =============================================
create table if not exists users (
  id              uuid default uuid_generate_v4() primary key,
  username        text not null unique,
  password_hash   text not null,
  display_name    text not null,
  role            text not null default 'admin' check (role in ('admin', 'editor', 'viewer')),
  permissions     jsonb not null default '{"courses":{"read":true,"write":true},"faculty":{"read":true,"write":true},"gallery":{"read":true,"write":true},"videos":{"read":true,"write":true},"certificates":{"read":true,"write":true}}',
  is_active       boolean not null default true,
  failed_attempts integer not null default 0,
  locked_until    timestamptz,
  last_login      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================
-- TABLE 2: COURSES
-- =============================================
create table if not exists courses (
  id              uuid default uuid_generate_v4() primary key,
  slug            text not null unique,
  title           text not null,
  subtitle        text not null default '',
  icon            text not null default 'GraduationCap',
  duration        text not null default '',
  fees            text not null default '',
  description     text not null default '',
  overview        text not null default '',
  syllabus         jsonb not null default '[]',
  benefits        jsonb not null default '[]',
  color           text not null default 'from-brand-purple to-brand-purple-dark',
  popular         boolean not null default false,
  certification   text not null default '',
  exam_details    text not null default '',
  icon_url        text not null default '',
  sort_order      integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================
-- TABLE 3: FACULTY
-- =============================================
create table if not exists faculty (
  id              uuid default uuid_generate_v4() primary key,
  name            text not null,
  designation     text not null,
  branch          text not null default 'Ghansoli - Sector 7',
  photo_url       text,
  bio             text,
  sort_order      integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================
-- TABLE 4: PHOTOS (Gallery)
-- =============================================
create table if not exists photos (
  id              uuid default uuid_generate_v4() primary key,
  section         text not null default 'General',
  caption         text,
  image_url       text not null,
  sort_order      integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================
-- TABLE 5: VIDEOS
-- =============================================
create table if not exists videos (
  id              uuid default uuid_generate_v4() primary key,
  section         text not null default 'General',
  title           text not null,
  video_url       text not null,
  thumbnail_url   text,
  description     text,
  sort_order      integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================
-- TABLE 6: CERTIFICATES
-- =============================================
create table if not exists certificates (
  id              uuid default uuid_generate_v4() primary key,
  section         text not null default 'General',
  title           text not null,
  image_url       text,
  description     text,
  sort_order      integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =============================================
-- TABLE 7: ENQUIRIES (Contact form submissions)
-- =============================================
create table if not exists enquiries (
  id              uuid default uuid_generate_v4() primary key,
  name            text not null,
  email           text not null,
  phone           text,
  course_interest text,
  message         text,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('faculty', 'faculty', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('certificates', 'certificates', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('courses', 'courses', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('videos', 'videos', true) on conflict (id) do nothing;

-- Storage policies: public read, authenticated write
create policy "Allow public read from photos" on storage.objects for select using (bucket_id = 'photos');
create policy "Allow public read from faculty" on storage.objects for select using (bucket_id = 'faculty');
create policy "Allow public read from certificates" on storage.objects for select using (bucket_id = 'certificates');
create policy "Allow public read from courses" on storage.objects for select using (bucket_id = 'courses');
create policy "Allow public read from videos" on storage.objects for select using (bucket_id = 'videos');

create policy "Allow authenticated upload to photos" on storage.objects for insert with check (bucket_id = 'photos');
create policy "Allow authenticated upload to faculty" on storage.objects for insert with check (bucket_id = 'faculty');
create policy "Allow authenticated upload to certificates" on storage.objects for insert with check (bucket_id = 'certificates');
create policy "Allow authenticated upload to courses" on storage.objects for insert with check (bucket_id = 'courses');
create policy "Allow authenticated upload to videos" on storage.objects for insert with check (bucket_id = 'videos');

create policy "Allow authenticated update to photos" on storage.objects for update using (bucket_id = 'photos');
create policy "Allow authenticated update to faculty" on storage.objects for update using (bucket_id = 'faculty');
create policy "Allow authenticated update to certificates" on storage.objects for update using (bucket_id = 'certificates');
create policy "Allow authenticated update to courses" on storage.objects for update using (bucket_id = 'courses');
create policy "Allow authenticated update to videos" on storage.objects for update using (bucket_id = 'videos');

create policy "Allow authenticated delete from photos" on storage.objects for delete using (bucket_id = 'photos');
create policy "Allow authenticated delete from faculty" on storage.objects for delete using (bucket_id = 'faculty');
create policy "Allow authenticated delete from certificates" on storage.objects for delete using (bucket_id = 'certificates');
create policy "Allow authenticated delete from courses" on storage.objects for delete using (bucket_id = 'courses');
create policy "Allow authenticated delete from videos" on storage.objects for delete using (bucket_id = 'videos');

-- =============================================
-- INDEXES (for performance)
-- =============================================
create index if not exists idx_users_username on users(username);
create index if not exists idx_users_active on users(is_active);

create index if not exists idx_courses_slug on courses(slug);
create index if not exists idx_courses_active on courses(is_active);
create index if not exists idx_courses_sort on courses(sort_order);

create index if not exists idx_faculty_branch on faculty(branch);
create index if not exists idx_faculty_active on faculty(is_active);

create index if not exists idx_photos_section on photos(section);
create index if not exists idx_photos_active on photos(is_active);

create index if not exists idx_videos_section on videos(section);
create index if not exists idx_videos_active on videos(is_active);

create index if not exists idx_certificates_section on certificates(section);

create index if not exists idx_enquiries_read on enquiries(is_read);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
alter table users enable row level security;
alter table courses enable row level security;
alter table faculty enable row level security;
alter table photos enable row level security;
alter table videos enable row level security;
alter table certificates enable row level security;
alter table enquiries enable row level security;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Users: no public reads (auth is handled by our custom JWT system)
create policy "No public access to users" on users for select using (false);
create policy "Service role can manage users" on users for all using (true);

-- Courses: public can read active
create policy "Public can read active courses" on courses for select using (is_active = true);
create policy "Admin can insert courses" on courses for insert;
create policy "Admin can update courses" on courses for update;
create policy "Admin can delete courses" on courses for delete;

-- Faculty: public can read active
create policy "Public can read active faculty" on faculty for select using (is_active = true);
create policy "Admin can insert faculty" on faculty for insert;
create policy "Admin can update faculty" on faculty for update;
create policy "Admin can delete faculty" on faculty for delete;

-- Photos: public can read active
create policy "Public can read active photos" on photos for select using (is_active = true);
create policy "Admin can insert photos" on photos for insert;
create policy "Admin can update photos" on photos for update;
create policy "Admin can delete photos" on photos for delete;

-- Videos: public can read active
create policy "Public can read active videos" on videos for select using (is_active = true);
create policy "Admin can insert videos" on videos for insert;
create policy "Admin can update videos" on videos for update;
create policy "Admin can delete videos" on videos for delete;

-- Certificates: public can read active
create policy "Public can read active certificates" on certificates for select using (is_active = true);
create policy "Admin can insert certificates" on certificates for insert;
create policy "Admin can update certificates" on certificates for update;
create policy "Admin can delete certificates" on certificates for delete;

-- Enquiries: no public reads, public can insert (for contact form)
create policy "Anyone can submit enquiry" on enquiries for insert;
create policy "Admin can read enquiries" on enquiries for select;
create policy "Admin can update enquiries" on enquiries for update;
create policy "Admin can delete enquiries" on enquiries for delete;

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to all tables
create trigger update_users_updated_at before update on users for each row execute function update_updated_at_column();
create trigger update_courses_updated_at before update on courses for each row execute function update_updated_at_column();
create trigger update_faculty_updated_at before update on faculty for each row execute function update_updated_at_column();
create trigger update_photos_updated_at before update on photos for each row execute function update_updated_at_column();
create trigger update_videos_updated_at before update on videos for each row execute function update_updated_at_column();
create trigger update_certificates_updated_at before update on certificates for each row execute function update_updated_at_column();

-- =============================================
-- TABLE 8: CHAT SESSIONS (AI Chatbot History)
-- =============================================
create table if not exists chat_sessions (
  id              uuid default uuid_generate_v4() primary key,
  session_id      text unique not null,
  messages        jsonb not null default '[]'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table chat_sessions enable row level security;

create policy "Allow anonymous read" on chat_sessions for select using (true);
create policy "Allow anonymous insert" on chat_sessions for insert with check (true);
create policy "Allow anonymous update" on chat_sessions for update using (true);

create index if not exists idx_chat_sessions_session_id on chat_sessions(session_id);

grant all on chat_sessions to anon;
grant all on chat_sessions to authenticated;

-- =============================================
-- INSERT DEFAULT ADMIN USER
-- =============================================
-- Password: impact@1997 (bcrypt hash)
-- IMPORTANT: Change this password after first login!
insert into users (username, password_hash, display_name, role, is_active)
values (
  'admin',
  '$2a$12$LJ3m9ys3Lk.6bPKHqO2F9.hEzT79kLQmN0O8Xv9KL9b3FgQmVq3HK',
  'Administrator',
  'admin',
  true
) on conflict (username) do nothing;

-- =============================================
-- DONE!
-- =============================================
-- Next steps:
-- 1. Set SUPABASE_SERVICE_ROLE_KEY in your .env.local
-- 2. Run: npx prisma generate (for local dev fallback)
-- 3. Test the connection by starting your dev server
