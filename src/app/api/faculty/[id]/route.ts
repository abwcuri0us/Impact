import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, hasPermission } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data, error } = await supabase
      .from('faculty')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      role: data.designation,
      designation: data.designation,
      branch: data.branch,
      photoUrl: data.photo_url,
      bio: data.bio,
      isFounder: false,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty member' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasPermission(auth, 'faculty', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for faculty' }, { status: 403 })
    }

    const { id } = await params

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { name, role, designation, experience, expertise, photoUrl, photo_url, isFounder, sortOrder, branch, bio } = body

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.designation = role
    if (designation !== undefined) updateData.designation = designation
    if (photoUrl !== undefined) updateData.photo_url = photoUrl
    if (photo_url !== undefined) updateData.photo_url = photo_url
    if (expertise !== undefined) updateData.bio = expertise
    if (bio !== undefined) updateData.bio = bio
    if (branch !== undefined) updateData.branch = branch
    if (sortOrder !== undefined) updateData.sort_order = sortOrder

    const { data, error } = await supabase
      .from('faculty')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'Failed to update faculty member' }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      role: data.designation,
      designation: data.designation,
      branch: data.branch,
      photoUrl: data.photo_url,
      bio: data.bio,
      isFounder: isFounder ?? false,
      sortOrder: data.sort_order,
      experience: experience || '',
      expertise: data.bio || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error('Error updating faculty:', error)
    return NextResponse.json(
      { error: 'Failed to update faculty member' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasPermission(auth, 'faculty', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for faculty' }, { status: 403 })
    }

    const { id } = await params

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: deletedData, error } = await supabase
      .from('faculty')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: 'Failed to delete faculty member' }, { status: 500 })
    }

    if (!deletedData || deletedData.length === 0) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting faculty:', error)
    return NextResponse.json(
      { error: 'Failed to delete faculty member' },
      { status: 500 }
    )
  }
}
