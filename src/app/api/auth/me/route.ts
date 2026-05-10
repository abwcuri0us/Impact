import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const result = await verifyAuth(request)

  if (result.authenticated && result.user) {
    let displayName: string | null = null
    let dbPermissions: Record<string, { read: boolean; write: boolean }> = {}
    let dbRole: string = result.user.role

    // Fetch display_name, permissions, and role from users table (always fresh from DB)
    try {
      const supabase = getSupabaseAdmin()
      if (supabase) {
        const { data } = await supabase
          .from('users')
          .select('display_name, permissions, role')
          .eq('id', result.user.userId)
          .single()
        if (data) {
          displayName = data.display_name || null

          // Parse permissions from DB — admin grants are always reflected immediately
          if (data.permissions) {
            if (typeof data.permissions === 'string') {
              try {
                dbPermissions = JSON.parse(data.permissions)
              } catch {
                dbPermissions = {}
              }
            } else if (typeof data.permissions === 'object') {
              dbPermissions = data.permissions as Record<string, { read: boolean; write: boolean }>
            }
          }

          // Also use fresh role from DB
          if (data.role) {
            dbRole = data.role
          }
        }
      }
    } catch {
      // Silently fall back to JWT values
      dbPermissions = result.user.permissions || {}
    }

    const isFaculty = dbRole === 'faculty'

    // Determine access granted: faculty has write access if ANY section has write: true
    const accessGranted = isFaculty && Object.values(dbPermissions).some(p => p.write === true)

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: result.user.userId,
        username: result.user.username,
        displayName,
        role: dbRole,
        permissions: dbPermissions,
        isFaculty,
        accessGranted,
      },
    })
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}
