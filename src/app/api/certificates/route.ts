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
    const section = searchParams.get('section')

    let query = supabase
      .from('certificates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (section && section !== 'all') {
      query = query.eq('section', section)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
    }

    const mapped = (data || []).map((c) => ({
      id: c.id,
      title: c.title,
      section: c.section,
      imageUrl: c.image_url,
      description: c.description,
      sortOrder: c.sort_order,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }))
    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
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
    if (!hasPermission(auth, 'certificates', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for certificates' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { title, section, imageUrl, description, sortOrder } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        title,
        section: section || 'General',
        image_url: imageUrl || '',
        description: description || '',
        sort_order: sortOrder || 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
    }

    const mapped = {
      id: data.id,
      title: data.title,
      section: data.section,
      imageUrl: data.image_url,
      description: data.description,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
    return NextResponse.json(mapped, { status: 201 })
  } catch (error) {
    console.error('Error creating certificate:', error)
    return NextResponse.json(
      { error: 'Failed to create certificate' },
      { status: 500 }
    )
  }
}
