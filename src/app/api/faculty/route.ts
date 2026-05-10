import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, hasPermission } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data, error } = await supabase
      .from('faculty')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch faculty members' }, { status: 500 })
    }

    // Map Supabase fields to expected format
    const mapped = (data || []).map((f) => ({
      id: f.id,
      name: f.name,
      role: f.designation,
      designation: f.designation,
      branch: f.branch,
      photoUrl: f.photo_url,
      bio: f.bio,
      isFounder: false,
      sortOrder: f.sort_order,
      experience: '',
      expertise: f.bio || '',
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }))
    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty members' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasPermission(auth, 'faculty', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for faculty' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { name, role, designation, experience, expertise, photoUrl, photo_url, isFounder, sortOrder, branch, bio } = body

    const memberName = name
    const memberRole = role || designation
    const memberPhoto = photoUrl || photo_url || ''
    const memberBranch = branch || 'Ghansoli - Sector 7'

    if (!memberName || !memberRole) {
      return NextResponse.json(
        { error: 'Name and role are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('faculty')
      .insert({
        is_active: true,
        name: memberName,
        designation: memberRole,
        branch: memberBranch,
        photo_url: memberPhoto,
        bio: bio || expertise || '',
        sort_order: sortOrder || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create faculty member' }, { status: 500 })
    }

    const mapped = {
      id: data.id,
      name: data.name,
      role: data.designation,
      designation: data.designation,
      branch: data.branch,
      photoUrl: data.photo_url,
      bio: data.bio,
      isFounder: isFounder || false,
      sortOrder: data.sort_order,
      experience: experience || '',
      expertise: data.bio || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
    return NextResponse.json(mapped, { status: 201 })
  } catch (error) {
    console.error('Error creating faculty:', error)
    return NextResponse.json(
      { error: 'Failed to create faculty member' },
      { status: 500 }
    )
  }
}
