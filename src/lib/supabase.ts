import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://')

// ==========================================
// ADMIN CLIENT (Server-only, bypasses RLS)
// Uses service_role key for full access
// ==========================================
let _adminClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!isConfigured) return null
  if (_adminClient) return _adminClient

  const key = supabaseServiceKey && !supabaseServiceKey.includes('YOUR_SERVICE_ROLE_KEY')
    ? supabaseServiceKey
    : supabaseAnonKey

  _adminClient = createClient<Database>(supabaseUrl, key, {
    auth: {
      persistSession: false,
    },
  })

  return _adminClient
}

// ==========================================
// SERVER CLIENT (API routes, Server Components)
// ==========================================
export async function getSupabaseServer() {
  if (!isConfigured) return null

  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Cookie setting can fail in Server Components
        }
      },
    },
  })
}

// ==========================================
// ROUTE HANDLER CLIENT (for API routes with NextRequest)
// ==========================================
export function getSupabaseRouteHandler(request: NextRequest) {
  if (!isConfigured) return null

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value, options)
        )
      },
    },
  })
}

// ==========================================
// BROWSER CLIENT (Client Components)
// ==========================================
export function getSupabaseBrowser() {
  if (!isConfigured) return null

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
export function isSupabaseReady(): boolean {
  return isConfigured && getSupabaseAdmin() !== null
}
