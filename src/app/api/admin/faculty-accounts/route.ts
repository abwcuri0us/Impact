import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, hashPassword, getDefaultPermissions as getFacultyDefaultPermissions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/admin/faculty-accounts — List all faculty accounts (admin only)
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

    // Fetch all users that have is_faculty=true in their permissions
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, display_name, role, permissions, is_active, last_login, created_at')
      .order('created_at', { ascending: true })

    if (usersError) {
      console.error('Supabase error:', usersError)
      return NextResponse.json({ error: 'Failed to fetch faculty accounts' }, { status: 500 })
    }

    // Filter faculty users (is_faculty=true in permissions) and map
    const facultyAccounts = (users || [])
      .filter((u: Record<string, unknown>) => {
        const perms = u.permissions
        const parsed = typeof perms === 'string' ? JSON.parse(perms) : perms
        return parsed?.is_faculty === true
      })
      .map((u: Record<string, unknown>) => {
        const perms = u.permissions
        const parsed = typeof perms === 'string' ? JSON.parse(perms) : perms
        return {
          id: u.id,
          username: u.username,
          displayName: u.display_name,
          role: u.role,
          isActive: u.is_active,
          lastLogin: u.last_login,
          createdAt: u.created_at,
          facultyId: parsed?.faculty_id || null,
          accessGranted: parsed?.access_granted === true,
        }
      })

    // Fetch faculty details for linked faculty members
    const facultyIds = facultyAccounts
      .map((a: { facultyId: string | null }) => a.facultyId)
      .filter(Boolean)

    let facultyMap: Record<string, Record<string, unknown>> = {}
    if (facultyIds.length > 0) {
      const { data: facultyData } = await supabase
        .from('faculty')
        .select('id, name, designation, branch, photo_url')
        .in('id', facultyIds)

      if (facultyData) {
        facultyMap = Object.fromEntries(
          facultyData.map((f: Record<string, unknown>) => [f.id, f])
        )
      }
    }

    // Enrich faculty accounts with faculty details
    const enriched = facultyAccounts.map((account: Record<string, unknown>) => {
      const fId = account.facultyId as string | null
      const faculty = fId ? facultyMap[fId] : null
      return {
        ...account,
        facultyName: faculty?.name || 'Unlinked',
        facultyDesignation: faculty?.designation || '',
        facultyBranch: faculty?.branch || '',
        facultyPhotoUrl: faculty?.photo_url || '',
      }
    })

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('List faculty accounts error:', error)
    return NextResponse.json({ error: 'Failed to fetch faculty accounts' }, { status: 500 })
  }
}

// POST /api/admin/faculty-accounts — Create a faculty account (admin only)
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
    const { username, password, displayName, facultyId } = body

    // Validation
    if (!username || !password || !displayName || !facultyId) {
      return NextResponse.json(
        { error: 'Username, password, display name, and faculty member are all required.' },
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

    // Verify the faculty member exists
    const { data: facultyMember, error: facultyError } = await supabase
      .from('faculty')
      .select('id, name')
      .eq('id', facultyId)
      .single()

    if (facultyError || !facultyMember) {
      return NextResponse.json(
        { error: 'Selected faculty member not found.' },
        { status: 400 }
      )
    }

    // Check username uniqueness
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

    // Check if this faculty member already has an account
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, permissions')
    if (allUsers) {
      const alreadyLinked = allUsers.find((u: Record<string, unknown>) => {
        const perms = u.permissions
        const parsed = typeof perms === 'string' ? JSON.parse(perms) : perms
        return parsed?.is_faculty === true && parsed?.faculty_id === facultyId
      })
      if (alreadyLinked) {
        return NextResponse.json(
          { error: 'This faculty member already has a login account.' },
          { status: 409 }
        )
      }
    }

    // Create the faculty user
    const passwordHash = await hashPassword(password)
    const permissions = getFacultyDefaultPermissions(facultyId)
    const permsObj = JSON.parse(permissions)

    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        display_name: displayName,
        role: 'editor',
        permissions: permsObj,
        is_active: true,
      })
      .select('id, username, display_name, role, permissions, is_active, created_at')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create faculty account' }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      role: data.role,
      isActive: data.is_active,
      createdAt: data.created_at,
      facultyId,
      facultyName: facultyMember.name,
      accessGranted: false,
    }, { status: 201 })
  } catch (error) {
    console.error('Create faculty account error:', error)
    return NextResponse.json({ error: 'Failed to create faculty account' }, { status: 500 })
  }
}
