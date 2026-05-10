import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'

// ── Column mapping (adapted to existing schema) ──
// Table: enquiries (id, name, email NOT NULL, phone NOT NULL, course_interest, message, is_read, created_at)

const SELECT_COLS = [
  'id', 'name', 'email', 'phone', 'course_interest', 'message', 'is_read', 'created_at',
].join(',')

function mapEnquiryRow(row: Record<string, unknown>) {
  // Parse source from message prefix if encoded as [SOURCE] prefix
  const msg = row.message as string || '';
  let source = 'website';
  let cleanMessage = msg;

  if (msg.startsWith('[WHATSAPP] ')) {
    source = 'whatsapp';
    cleanMessage = msg.substring('[WHATSAPP] '.length);
  } else if (msg.startsWith('[WEBSITE] ')) {
    source = 'website';
    cleanMessage = msg.substring('[WEBSITE] '.length);
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email || null,
    phone: row.phone,
    course: row.course_interest || null,
    message: cleanMessage || null,
    source,
    isRead: !!row.is_read,
    createdAt: row.created_at,
  }
}

// POST /api/enquiries — Public endpoint for website visitors to submit enquiries
export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    const rateCheck = checkRateLimit(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      )
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const body = await request.json()
    const { name, email, phone, course, message, source } = body

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
    }

    const phoneClean = (phone || '').replace(/[\s\-\+\(\)]/g, '')
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 })
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
      }
    }

    // Encode source as message prefix
    const sourcePrefix = source === 'whatsapp' ? '[WHATSAPP] ' : '[WEBSITE] '
    const fullMessage = sourcePrefix + (message ? message.trim() : '')

    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        name: name.trim(),
        email: email && email.trim() ? email.trim() : 'N/A',
        phone: phone.trim(),
        course_interest: course ? course.trim() : null,
        message: fullMessage || null,
        is_read: false,
      })
      .select(SELECT_COLS)
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to submit enquiry.' }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: 'Enquiry submitted successfully.', enquiry: mapEnquiryRow(data) },
      { status: 201 }
    )
  } catch (error) {
    console.error('Enquiry submit error:', error)
    return NextResponse.json({ error: 'Failed to submit enquiry.' }, { status: 500 })
  }
}

// GET /api/enquiries — Authenticated endpoint for admin/faculty to view enquiries
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const readFilter = searchParams.get('read') // 'true', 'false', or 'all'

    let query = supabase
      .from('enquiries')
      .select(SELECT_COLS, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by read status
    if (readFilter === 'false') {
      query = query.eq('is_read', false)
    } else if (readFilter === 'true') {
      query = query.eq('is_read', true)
    }

    // Search across fields (sanitized to prevent PostgREST injection)
    if (search) {
      const sanitized = search.replace(/[%.,()']/g, '').trim()
      if (sanitized) {
        query = query.or(`name.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,email.ilike.%${sanitized}%,course_interest.ilike.%${sanitized}%`)
      }
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch enquiries.' }, { status: 500 })
    }

    return NextResponse.json({
      enquiries: (data || []).map(mapEnquiryRow),
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Fetch enquiries error:', error)
    return NextResponse.json({ error: 'Failed to fetch enquiries.' }, { status: 500 })
  }
}

// PATCH /api/enquiries — Authenticated endpoint to mark as read/unread
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    if (auth.user.role !== 'admin') {
      const perm = auth.user.permissions?.enquiries
      if (!perm || !perm.write) {
        return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
      }
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { id, isRead } = body

    if (!id) {
      return NextResponse.json({ error: 'Enquiry ID is required.' }, { status: 400 })
    }

    if (isRead === undefined) {
      return NextResponse.json({ error: 'isRead field is required.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('enquiries')
      .update({ is_read: !!isRead })
      .eq('id', id)
      .select(SELECT_COLS)
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'Failed to update enquiry.' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Enquiry not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, enquiry: mapEnquiryRow(data) })
  } catch (error) {
    console.error('Update enquiry error:', error)
    return NextResponse.json({ error: 'Failed to update enquiry.' }, { status: 500 })
  }
}

// DELETE /api/enquiries — Authenticated endpoint to delete an enquiry (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Enquiry ID is required.' }, { status: 400 })
    }

    const { error } = await supabase.from('enquiries').delete().eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: 'Failed to delete enquiry.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Enquiry deleted.' })
  } catch (error) {
    console.error('Delete enquiry error:', error)
    return NextResponse.json({ error: 'Failed to delete enquiry.' }, { status: 500 })
  }
}
