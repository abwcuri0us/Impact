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
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      section: data.section,
      imageUrl: data.image_url,
      description: data.description,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error('Error fetching certificate:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
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
    if (!hasPermission(auth, 'certificates', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for certificates' }, { status: 403 })
    }

    const { id } = await params

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { title, section, imageUrl, description, sortOrder } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (section !== undefined) updateData.section = section
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    if (description !== undefined) updateData.description = description
    if (sortOrder !== undefined) updateData.sort_order = sortOrder

    const { data, error } = await supabase
      .from('certificates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      section: data.section,
      imageUrl: data.image_url,
      description: data.description,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error('Error updating certificate:', error)
    return NextResponse.json(
      { error: 'Failed to update certificate' },
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
    if (!hasPermission(auth, 'certificates', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for certificates' }, { status: 403 })
    }

    const { id } = await params

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: deletedData, error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 })
    }

    if (!deletedData || deletedData.length === 0) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting certificate:', error)
    return NextResponse.json(
      { error: 'Failed to delete certificate' },
      { status: 500 }
    )
  }
}
