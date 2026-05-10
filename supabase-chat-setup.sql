-- ═══════════════════════════════════════════════════════════════
-- Supabase SQL Setup for Chat History
-- Run this in your Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Create chat_sessions table for storing chat history
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for chat history (chatbot doesn't require login)
CREATE POLICY "Allow anonymous read" ON public.chat_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON public.chat_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON public.chat_sessions
  FOR UPDATE USING (true);

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id
  ON public.chat_sessions (session_id);

-- Grant access to anon role
GRANT ALL ON public.chat_sessions TO anon;
GRANT ALL ON public.chat_sessions TO authenticated;
