import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, hashPassword } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// PUT /api/admin/users/[id]/password - Change user password
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
    const { newPassword } = body

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required.' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const passwordHash = await hashPassword(newPassword)

    // Check user exists
    const { data: existing, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single()

    if (findError || !existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update password and reset lock
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        failed_attempts: 0,
        locked_until: null,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Supabase password update error:', updateError)
      return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully.' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
