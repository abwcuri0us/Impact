import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, verifyPassword, hashPassword } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// PUT /api/auth/change-password — allows authenticated user to change their own password
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required.' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from the current password.' },
        { status: 400 }
      )
    }

    // Look up user from Supabase
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, password_hash, username')
      .eq('id', auth.user.userId)
      .single()

    if (fetchError || !user) {
      console.error('Supabase fetch error:', fetchError)
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    // Verify current password
    const valid = await verifyPassword(currentPassword, user.password_hash as string)
    if (!valid) {
      return NextResponse.json(
        { error: 'Current password is incorrect.' },
        { status: 401 }
      )
    }

    // Hash the new password
    const newHash = await hashPassword(newPassword)

    // Update password in Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: newHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auth.user.userId)

    if (updateError) {
      console.error('Supabase update error:', updateError)
      return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Password changed successfully.' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Failed to change password.' }, { status: 500 })
  }
}
