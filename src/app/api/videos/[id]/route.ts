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
      .from('videos')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const videoId = extractYouTubeId(data.video_url) || ''
    return NextResponse.json({
      id: data.id,
      title: data.title,
      youtubeUrl: data.video_url,
      videoUrl: data.video_url,
      videoId,
      videoType: data.video_type || (videoId ? 'youtube' : 'uploaded'),
      section: data.section,
      description: data.description,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
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

    if (!hasPermission(auth, 'videos', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for videos' }, { status: 403 })
    }

    const { id } = await params

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { title, youtubeUrl, videoUrl, section, sortOrder, description } = body

    const url = youtubeUrl || videoUrl

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (url) {
      const vid = extractYouTubeId(url)
      updateData.video_url = url
      if (vid) {
        updateData.thumbnail_url = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`
      }
    }
    if (section !== undefined) updateData.section = section
    if (description !== undefined) updateData.description = description
    if (sortOrder !== undefined) updateData.sort_order = sortOrder

    const { data, error } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
    }

    const videoId = extractYouTubeId(data.video_url) || ''
    return NextResponse.json({
      id: data.id,
      title: data.title,
      youtubeUrl: data.video_url,
      videoUrl: data.video_url,
      videoId,
      videoType: data.video_type || (videoId ? 'youtube' : 'uploaded'),
      section: data.section,
      description: data.description,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'Failed to update video' },
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

    if (!hasPermission(auth, 'videos', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for videos' }, { status: 403 })
    }

    const { id } = await params

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: deletedData, error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
    }

    if (!deletedData || deletedData.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}
