import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
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

// ── Data-access helpers ────────────────────────────────────────────────────

async function getUserById(id: string) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('users')
    .select(USER_SELECT_COLS)
    .eq('id', id)
    .single()
  if (!error && data) return mapUserRow(data)
  return null
}

async function updateUser(id: string, data: Record<string, unknown>) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  // Convert camelCase keys to snake_case for Supabase
  const sbData: Record<string, unknown> = {}
  if (data.displayName !== undefined) sbData.display_name = data.displayName
  if (data.role !== undefined) sbData.role = data.role
  if (data.permissions !== undefined) {
    // Supabase jsonb expects a parsed object
    sbData.permissions = typeof data.permissions === 'string'
      ? JSON.parse(data.permissions)
      : data.permissions
  }
  if (data.isActive !== undefined) sbData.is_active = data.isActive
  if (data.failedAttempts !== undefined) sbData.failed_attempts = data.failedAttempts
  if (data.lockedUntil !== undefined) sbData.locked_until = data.lockedUntil

  if (Object.keys(sbData).length === 0) {
    // Nothing to update – still fetch current row
    const { data: row, error } = await supabase
      .from('users')
      .select(USER_SELECT_COLS)
      .eq('id', id)
      .single()
    if (!error && row) return mapUserRow(row)
    return null
  }

  const { data: row, error } = await supabase
    .from('users')
    .update(sbData)
    .eq('id', id)
    .select(USER_SELECT_COLS)
    .single()

  if (!error && row) return mapUserRow(row)
  return null
}

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || auth.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await params

    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || auth.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { displayName, role, permissions, isActive } = body

    // Check user exists
    const existing = await getUserById(id)
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deactivating self
    if (auth.user.userId === id && isActive === false) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own account.' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (displayName !== undefined) updateData.displayName = displayName
    if (role !== undefined) updateData.role = role
    if (permissions !== undefined) updateData.permissions = permissions
    if (isActive !== undefined) updateData.isActive = isActive

    // If reactivating, also reset failed attempts and lock
    if (isActive === true && !existing.isActive) {
      updateData.failedAttempts = 0
      updateData.lockedUntil = null
    }

    const user = await updateUser(id, updateData)

    if (!user) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Deactivate user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || auth.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await params

    // Prevent deactivating self
    if (auth.user.userId === id) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own account.' },
        { status: 400 }
      )
    }

    // Check user exists
    const existing = await getUserById(id)
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = await updateUser(id, { isActive: false })

    if (!user) {
      return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Deactivate user error:', error)
    return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 })
  }
}
