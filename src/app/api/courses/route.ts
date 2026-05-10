import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, hasPermission } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { courses as seedCourses } from '@/data/courses'

// Prevent race condition on concurrent auto-seed
let _seeding = false

// Normalize jsonb fields that might be stored as strings
function parseJsonb(val: unknown): unknown[] {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }
  return []
}

function mapCourseRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    icon: row.icon,
    duration: row.duration,
    fees: row.fees,
    description: row.description,
    overview: row.overview,
    syllabus: parseJsonb(row.syllabus),
    benefits: parseJsonb(row.benefits),
    color: row.color,
    popular: row.popular,
    certification: row.certification,
    examDetails: row.exam_details,
    iconUrl: row.icon_url,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function prepareSeedForSupabase(c: (typeof seedCourses)[number]) {
  return {
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    icon: c.icon,
    duration: c.duration,
    fees: c.fees,
    description: c.description,
    overview: c.overview,
    syllabus: c.syllabus,
    benefits: c.benefits,
    color: c.color,
    popular: c.popular,
    certification: c.certification,
    exam_details: c.examDetails || '',
    icon_url: c.iconUrl || '',
    sort_order: 0,
    is_active: true,
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get('all') === 'true'

    let query = supabase
      .from('courses')
      .select('*')
    if (!showAll) query = query.eq('is_active', true)
    query = query.order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
    }

    // Auto-seed from seed data if Supabase returns 0 rows (with lock to prevent race condition)
    if (data.length === 0 && !_seeding) {
      _seeding = true
      try {
        const seedRows = seedCourses.map(prepareSeedForSupabase)
        const { data: insertedData, error: insertError } = await supabase
          .from('courses')
          .upsert(seedRows, { onConflict: 'slug' })
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true })

        if (insertError) {
          console.error('Supabase seed error:', insertError)
          // On conflict error (duplicate), just re-fetch respecting showAll
          let retryQuery = supabase
            .from('courses')
            .select('*')
          if (!showAll) retryQuery = retryQuery.eq('is_active', true)
          const { data: retryData } = await retryQuery
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true })
          return NextResponse.json((retryData || []).map(mapCourseRow))
        }

        const mapped = (insertedData || []).map(mapCourseRow)
        return NextResponse.json(mapped)
      } finally {
        _seeding = false
      }
    }

    const mapped = data.map(mapCourseRow)
    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
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

    if (!hasPermission(auth, 'courses', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for courses' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const {
      slug,
      title,
      subtitle,
      icon,
      duration,
      fees,
      description,
      overview,
      syllabus,
      benefits,
      color,
      popular,
      certification,
      examDetails,
      iconUrl,
      sortOrder,
      isActive,
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Auto-generate slug from title if not provided
    const courseSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Normalize syllabus and benefits
    const syllabusData = Array.isArray(syllabus) ? syllabus : typeof syllabus === 'string' ? (() => { try { return JSON.parse(syllabus) } catch { return [] } })() : []
    const benefitsData = Array.isArray(benefits) ? benefits : typeof benefits === 'string' ? (() => { try { return JSON.parse(benefits) } catch { return [] } })() : []

    // Check for duplicate slug
    const { data: existing, error: checkError } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', courseSlug)
      .maybeSingle()

    if (checkError) {
      console.error('Supabase check error:', checkError)
      return NextResponse.json({ error: 'Failed to check slug' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json(
        { error: 'A course with this slug already exists' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        slug: courseSlug,
        title,
        subtitle: subtitle || '',
        icon: icon || 'GraduationCap',
        duration: duration || '',
        fees: fees || '',
        description: description || '',
        overview: overview || '',
        syllabus: syllabusData,
        benefits: benefitsData,
        color: color || 'from-brand-purple to-brand-purple-dark',
        popular: popular || false,
        certification: certification || '',
        exam_details: examDetails || '',
        icon_url: iconUrl || '',
        sort_order: sortOrder || 0,
        is_active: isActive !== undefined ? isActive : true,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
    }

    const mapped = mapCourseRow(data)
    return NextResponse.json(mapped, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
