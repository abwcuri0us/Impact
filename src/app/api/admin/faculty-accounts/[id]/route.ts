import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// PUT /api/admin/faculty-accounts/[id] — Update faculty account (grant/revoke access)
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
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    // Fetch current user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !user) {
      return NextResponse.json({ error: 'Faculty account not found' }, { status: 404 })
    }

    // Verify this is a faculty account
    const currentPerms = user.permissions as Record<string, unknown>
    if (currentPerms?.is_faculty !== true) {
      return NextResponse.json({ error: 'This is not a faculty account' }, { status: 400 })
    }

    const body = await request.json()
    const { accessGranted } = body

    // Update permissions: toggle access_granted and update write permissions accordingly
    const updatedPerms = {
      ...currentPerms,
      access_granted: accessGranted === true,
      // When access is granted, give write permissions; when revoked, remove write
      courses: { read: true, write: accessGranted === true },
      faculty: { read: true, write: accessGranted === true },
      gallery: { read: true, write: accessGranted === true },
      videos: { read: true, write: accessGranted === true },
      certificates: { read: true, write: accessGranted === true },
    }

    const { data, error: updateError } = await supabase
      .from('users')
      .update({ permissions: updatedPerms })
      .eq('id', id)
      .select('id, username, display_name, role, permissions, is_active, last_login, created_at')
      .single()

    if (updateError) {
      console.error('Supabase update error:', updateError)
      return NextResponse.json({ error: 'Failed to update faculty account' }, { status: 500 })
    }

    const perms = data.permissions as Record<string, unknown>

    return NextResponse.json({
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      role: data.role,
      isActive: data.is_active,
      lastLogin: data.last_login,
      createdAt: data.created_at,
      facultyId: perms?.faculty_id || null,
      accessGranted: perms?.access_granted === true,
    })
  } catch (error) {
    console.error('Update faculty account error:', error)
    return NextResponse.json({ error: 'Failed to update faculty account' }, { status: 500 })
  }
}

// DELETE /api/admin/faculty-accounts/[id] — Delete faculty account (admin only)
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
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    // Verify this is a faculty account before deleting
    const { data: user } = await supabase
      .from('users')
      .select('permissions')
      .eq('id', id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'Faculty account not found' }, { status: 404 })
    }

    const perms = user.permissions as Record<string, unknown>
    if (perms?.is_faculty !== true) {
      return NextResponse.json({ error: 'This is not a faculty account' }, { status: 400 })
    }

    // Don't allow deleting admin accounts
    if (perms.is_faculty !== true) {
      return NextResponse.json({ error: 'Cannot delete non-faculty accounts from here' }, { status: 400 })
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: 'Failed to delete faculty account' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Faculty account deleted' })
  } catch (error) {
    console.error('Delete faculty account error:', error)
    return NextResponse.json({ error: 'Failed to delete faculty account' }, { status: 500 })
  }
}

// Reset password for faculty account
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || auth.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await params
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { newPassword } = body

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    // Verify this is a faculty account
    const { data: user } = await supabase
      .from('users')
      .select('permissions')
      .eq('id', id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'Faculty account not found' }, { status: 404 })
    }

    const perms = user.permissions as Record<string, unknown>
    if (perms?.is_faculty !== true) {
      return NextResponse.json({ error: 'This is not a faculty account' }, { status: 400 })
    }

    // Hash and update password
    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Reset failed attempts
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        failed_attempts: 0,
        locked_until: null,
      })
      .eq('id', id)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset faculty password error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
