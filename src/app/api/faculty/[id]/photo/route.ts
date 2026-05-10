import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { verifyAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  isR2Configured,
  uploadFile as r2Upload,
  generateFilePath,
} from '@/lib/cloudflare-r2'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = path.extname(file.name) || '.jpg'

    // Try Cloudflare R2 first (if configured)
    if (isR2Configured()) {
      const fileName = `${id}${ext}`
      const filePath = generateFilePath('faculty', fileName)

      const result = await r2Upload('faculty', file, filePath)
      if (result) {
        // Update Supabase with the new photo URL
        const supabase = getSupabaseAdmin()
        if (supabase) {
          await supabase
            .from('faculty')
            .update({ photo_url: result.url })
            .eq('id', id)
        }

        return NextResponse.json({ photoUrl: result.url, provider: 'r2' })
      }
      console.warn('R2 faculty photo upload failed, falling back')
    }

    // Try Supabase Storage
    const supabase = getSupabaseAdmin()
    if (supabase) {
      const fileName = `${id}${ext}`
      const storagePath = `${id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('faculty')
        .upload(storagePath, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        })

      if (!uploadError) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const photoUrl = `${supabaseUrl}/storage/v1/object/public/faculty/${storagePath}`

        // Update the faculty member's photo_url in Supabase
        await supabase
          .from('faculty')
          .update({ photo_url: photoUrl })
          .eq('id', id)

        return NextResponse.json({ photoUrl, provider: 'supabase' })
      }

      console.error('Supabase Storage upload error:', uploadError)
    }

    // Fallback: Use local filesystem
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'faculty')
    await mkdir(uploadDir, { recursive: true })

    const fileName = `${id}${ext}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)
    const photoUrl = `/uploads/faculty/${fileName}`

    // Update the faculty member's photo_url in Supabase for local fallback too
    const supabaseLocal = getSupabaseAdmin()
    if (supabaseLocal) {
      await supabaseLocal
        .from('faculty')
        .update({ photo_url: photoUrl })
        .eq('id', id)
    }

    return NextResponse.json({ photoUrl, provider: 'local' })
  } catch (error) {
    console.error('Error uploading faculty photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
