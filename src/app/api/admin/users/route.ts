import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, hashPassword, getDefaultPermissions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// ── Shared column mapping helpers ──────────────────────────────────────────

function mapUserRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    permissions: row.permissions,
    isActive: row.is_active,
    failedAttempts: row.failed_attempts,
    lockedUntil: row.locked_until,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const USER_SELECT_COLS = [
  'id', 'username', 'display_name', 'role', 'permissions',
  'is_active', 'failed_attempts', 'locked_until', 'last_login',
  'created_at', 'updated_at',
].join(',')

// GET /api/admin/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || auth.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data, error } = await supabase
      .from('users')
      .select(USER_SELECT_COLS)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json((data || []).map(mapUserRow))
  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || auth.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { username, password, displayName, role, permissions, isActive } = body

    // Validation
    if (!username || !password || !displayName) {
      return NextResponse.json(
        { error: 'Username, password, and display name are required.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long.' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(password)
    const finalPermissions = permissions || getDefaultPermissions()
    // Supabase jsonb column expects a parsed object
    const permsObj = typeof finalPermissions === 'string'
      ? JSON.parse(finalPermissions)
      : finalPermissions

    // Check uniqueness
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Supabase check error:', checkError)
      return NextResponse.json({ error: 'Failed to check username' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this username already exists.' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        display_name: displayName,
        role: role || 'admin',
        permissions: permsObj,
        is_active: isActive !== undefined ? isActive : true,
      })
      .select(USER_SELECT_COLS)
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json(mapUserRow(data), { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
