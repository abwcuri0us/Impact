import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, hasPermission } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    let query = supabase
      .from('videos')
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
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }

    const mapped = (data || []).map((v) => {
      const vid = extractYouTubeId(v.video_url) || ''
      return {
        id: v.id,
        title: v.title,
        youtubeUrl: v.video_url,
        videoUrl: v.video_url,
        videoId: vid,
        videoType: v.video_type || (vid ? 'youtube' : 'uploaded'),
        section: v.section,
        description: v.description,
        sortOrder: v.sort_order,
        createdAt: v.created_at,
        updatedAt: v.updated_at,
      }
    })
    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
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

    if (!hasPermission(auth, 'videos', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for videos' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { title, youtubeUrl, videoUrl, section, sortOrder, description } = body

    const url = youtubeUrl || videoUrl

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and video URL are required' },
        { status: 400 }
      )
    }

    const videoId = extractYouTubeId(url)
    const isYouTube = !!videoId
    const thumbnailUrl = isYouTube
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : ''

    const { data, error } = await supabase
      .from('videos')
      .insert({
        is_active: true,
        title,
        video_url: url,
        thumbnail_url: thumbnailUrl,
        section: section || 'General',
        description: description || '',
        sort_order: sortOrder || 0,
      })
      .select()
      .single()

    // Try to set video_type if possible (column may not exist yet)
    if (data && !error) {
      try {
        await supabase.from('videos').update({ video_type: isYouTube ? 'youtube' : 'uploaded' }).eq('id', data.id);
      } catch {
        // video_type column may not exist yet, ignore
      }
    }

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
    }

    const mapped = {
      id: data.id,
      title: data.title,
      youtubeUrl: data.video_url,
      videoUrl: data.video_url,
      videoId,
      videoType: isYouTube ? 'youtube' : 'uploaded',
      section: data.section,
      description: data.description,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
    return NextResponse.json(mapped, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
