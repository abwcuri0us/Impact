import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({
        photos: [],
        videos: [],
        certificates: [],
      })
    }

    const [photosRes, videosRes, certificatesRes] = await Promise.all([
      supabase.from('photos').select('section').eq('is_active', true),
      supabase.from('videos').select('section').eq('is_active', true),
      supabase.from('certificates').select('section').eq('is_active', true),
    ])

    const photosSections = [...new Set(photosRes.data?.map((p) => p.section).filter(Boolean) || [])].sort()
    const videosSections = [...new Set(videosRes.data?.map((v) => v.section).filter(Boolean) || [])].sort()
    const certificatesSections = [...new Set(certificatesRes.data?.map((c) => c.section).filter(Boolean) || [])].sort()

    return NextResponse.json({
      photos: photosSections,
      videos: videosSections,
      certificates: certificatesSections,
    })
  } catch (error) {
    console.error('Error fetching sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    )
  }
}
