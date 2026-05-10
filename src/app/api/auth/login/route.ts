import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME, createToken, verifyPassword, getDefaultPermissions } from '@/lib/auth'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rate-limit'
import { getSupabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// ── Normalized user shape ──────────────────────────────────────────────────
interface NormalizedUser {
  id: string
  username: string
  passwordHash: string
  displayName: string | null
  role: string
  permissions: string // JSON string – kept for compatibility with createToken()
  isActive: boolean
  failedAttempts: number
  lockedUntil: Date | null
  lastLogin: Date | null
  createdAt: Date
  updatedAt: Date
}

// ── Supabase row → NormalizedUser ──────────────────────────────────────────
function mapUserRow(row: Record<string, unknown>): NormalizedUser {
  const perms = row.permissions
  return {
    id: row.id as string,
    username: row.username as string,
    passwordHash: row.password_hash as string,
    displayName: (row.display_name as string) ?? null,
    role: row.role as string,
    permissions: typeof perms === 'string' ? perms : JSON.stringify(perms ?? '{}'),
    isActive: row.is_active as boolean,
    failedAttempts: (row.failed_attempts as number) ?? 0,
    lockedUntil: row.locked_until ? new Date(row.locked_until as string) : null,
    lastLogin: row.last_login ? new Date(row.last_login as string) : null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  }
}

// ── Data-access helpers (Supabase only) ───────────────────────────────────

let _adminEnsured = false

async function ensureDefaultAdmin() {
  const supabase = getSupabaseAdmin()
  if (!supabase) return
  if (_adminEnsured) return

  const { count, error } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
  if (!error && count === 0) {
    try {
      const hash = await bcrypt.hash('impact@1997', 12)
      const { error: insertError } = await supabase.from('users').insert({
        username: 'admin',
        password_hash: hash,
        display_name: 'Administrator',
        role: 'admin',
        permissions: JSON.parse(getDefaultPermissions()),
        is_active: true,
      })
      if (insertError) console.error('Failed to create default admin:', insertError.message)
      else _adminEnsured = true
    } catch (err) {
      console.error('ensureDefaultAdmin error:', err)
    }
  } else if (!error && count > 0) {
    _adminEnsured = true
  }
}

async function findUserByUsername(username: string): Promise<NormalizedUser | null> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  if (!error && data) return mapUserRow(data)
  return null
}

async function incrementFailedAttempts(userId: string, currentCount: number) {
  const newCount = currentCount + 1
  const lockedUntil = newCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null

  const supabase = getSupabaseAdmin()
  if (!supabase) return { newCount, lockedUntil }

  const update: Record<string, unknown> = { failed_attempts: newCount }
  if (lockedUntil) update.locked_until = lockedUntil.toISOString()
  await supabase.from('users').update(update).eq('id', userId)

  return { newCount, lockedUntil }
}

async function resetUserAfterLogin(userId: string) {
  const now = new Date()

  const supabase = getSupabaseAdmin()
  if (!supabase) return

  await supabase.from('users').update({
    failed_attempts: 0,
    locked_until: null,
    last_login: now.toISOString(),
  }).eq('id', userId)
}

// ── POST /api/auth/login ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    // Check rate limit FIRST (before any DB lookups)
    const rateCheck = checkRateLimit(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Try again in ${rateCheck.retryAfterSeconds} seconds.`,
          code: 'RATE_LIMITED',
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      )
    }

    // Ensure default admin exists
    await ensureDefaultAdmin()

    // Look up user by username
    const user = await findUserByUsername(username)

    if (!user) {
      // Record failed attempt
      const result = recordFailedAttempt(ip)
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid username or password.',
          remainingAttempts: result.remainingAttempts,
        },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'This account has been deactivated. Contact your administrator.',
          code: 'ACCOUNT_DEACTIVATED',
        },
        { status: 403 }
      )
    }

    // Check if user is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const lockMinutes = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000)
      return NextResponse.json(
        {
          success: false,
          error: `This account is temporarily locked. Try again in ${lockMinutes} minute${lockMinutes !== 1 ? 's' : ''}.`,
          code: 'ACCOUNT_LOCKED',
        },
        { status: 403 }
      )
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash)
    if (!passwordValid) {
      // Increment failed attempts
      const { newCount, lockedUntil } = await incrementFailedAttempts(user.id, user.failedAttempts)

      const result = recordFailedAttempt(ip)
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid username or password.',
          remainingAttempts: result.remainingAttempts,
          code: newCount >= 5 ? 'ACCOUNT_LOCKED' : undefined,
        },
        { status: 401 }
      )
    }

    // SUCCESS: reset failed attempts, update last login
    await resetUserAfterLogin(user.id)

    // Reset rate limit for this IP
    resetRateLimit(ip)

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    })

    // Parse permissions for response
    let permissions: Record<string, { read: boolean; write: boolean }>
    try {
      permissions = JSON.parse(user.permissions)
    } catch {
      permissions = {}
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Authenticated',
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          permissions,
        },
      },
      { status: 200 }
    )

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request.' },
      { status: 400 }
    )
  }
}
