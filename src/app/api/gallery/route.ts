import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, hasPermission } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const section = searchParams.get('section')

    let query = supabase
      .from('photos')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    // Support both 'section' and 'category' query params (they filter the same column)
    const filter = section || category;
    if (filter && filter !== 'all') {
      query = query.eq('section', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 })
    }

    const mapped = (data || []).map((p) => ({
      id: p.id,
      title: p.caption || p.section,
      category: p.section,
      section: p.section,
      caption: p.caption,
      imageUrl: p.image_url,
      description: p.description || '',
      sortOrder: p.sort_order,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }))
    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
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
    if (!hasPermission(auth, 'gallery', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for gallery' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { title, category, caption, section, imageUrl, description, sortOrder } = body

    if (!title && !imageUrl) {
      return NextResponse.json(
        { error: 'Title or imageUrl is required' },
        { status: 400 }
      )
    }

    const photoSection = section || category || 'General'
    const { data, error } = await supabase
      .from('photos')
      .insert({
        is_active: true,
        section: photoSection,
        caption: caption || title || '',
        image_url: imageUrl,
        sort_order: sortOrder || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create gallery image' }, { status: 500 })
    }

    const mapped = {
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
    }
    return NextResponse.json(mapped, { status: 201 })
  } catch (error) {
    console.error('Error creating gallery image:', error)
    return NextResponse.json(
      { error: 'Failed to create gallery image' },
      { status: 500 }
    )
  }
}
