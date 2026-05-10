import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, hasPermission } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

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
    syllabus: row.syllabus, // Supabase jsonb - already parsed
    benefits: row.benefits, // Supabase jsonb - already parsed
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
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json(mapCourseRow(data))
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
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

    if (!hasPermission(auth, 'courses', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for courses' }, { status: 403 })
    }

    const { id } = await params

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

    // Check for duplicate slug if changing
    if (slug) {
      const { data: existing, error: checkError } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
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
    }

    // Build update object with snake_case columns
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (slug !== undefined) updateData.slug = slug
    if (icon !== undefined) updateData.icon = icon
    if (duration !== undefined) updateData.duration = duration
    if (fees !== undefined) updateData.fees = fees
    if (description !== undefined) updateData.description = description
    if (overview !== undefined) updateData.overview = overview
    if (color !== undefined) updateData.color = color
    if (popular !== undefined) updateData.popular = popular
    if (certification !== undefined) updateData.certification = certification
    if (examDetails !== undefined) updateData.exam_details = examDetails
    if (iconUrl !== undefined) updateData.icon_url = iconUrl
    if (sortOrder !== undefined) updateData.sort_order = sortOrder
    if (isActive !== undefined) updateData.is_active = isActive
    // For syllabus and benefits: if array, pass directly (jsonb); if string, JSON.parse first
    if (syllabus !== undefined) {
      updateData.syllabus = Array.isArray(syllabus) ? syllabus : (() => { try { return JSON.parse(syllabus) } catch { return [] } })()
    }
    if (benefits !== undefined) {
      updateData.benefits = Array.isArray(benefits) ? benefits : (() => { try { return JSON.parse(benefits) } catch { return [] } })()
    }

    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: data ? 'Failed to update course' : 'Course not found' }, { status: data ? 500 : 404 })
    }

    return NextResponse.json(mapCourseRow(data))
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
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

    if (!hasPermission(auth, 'courses', 'write')) {
      return NextResponse.json({ error: 'Access denied — you do not have write permission for courses' }, { status: 403 })
    }

    const { id } = await params

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: deletedData, error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
    }

    if (!deletedData || deletedData.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
