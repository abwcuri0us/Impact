import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, hasPermission } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasPermission(auth, 'gallery', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for gallery' }, { status: 403 })
    }

    const { id } = await params

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { title, category, caption, section, imageUrl, description, sortOrder } = body

    const updateData: Record<string, unknown> = {}
    // Support both 'title' and 'caption' — map title to caption for DB
    const captionValue = caption !== undefined ? caption : title
    if (captionValue !== undefined) updateData.caption = captionValue
    if (section !== undefined) updateData.section = section
    else if (category !== undefined) updateData.section = category
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    if (sortOrder !== undefined) updateData.sort_order = sortOrder
    if (description !== undefined) updateData.description = description

    const { data, error } = await supabase
      .from('photos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'Failed to update gallery image' }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      title: caption || title || data.section,
      category: data.section,
      section: data.section,
      caption: data.caption,
      imageUrl: data.image_url,
      description: description || '',
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error('Error updating gallery image:', error)
    return NextResponse.json(
      { error: 'Failed to update gallery image' },
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
    if (!hasPermission(auth, 'gallery', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for gallery' }, { status: 403 })
    }

    const { id } = await params

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: deletedData, error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 })
    }

    if (!deletedData || deletedData.length === 0) {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return NextResponse.json(
      { error: 'Failed to delete gallery image' },
      { status: 500 }
    )
  }
}
