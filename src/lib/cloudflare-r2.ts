/**
 * Cloudflare R2 Client Wrapper
 *
 * Uses the S3-compatible API via native fetch.
 * Gracefully handles missing configuration by returning null.
 * All methods return null if R2 is not configured.
 */

// ==========================================
// Configuration
// ==========================================

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'impact-computers'
const R2_ENDPOINT_ENV = process.env.R2_ENDPOINT || ''

/** Returns true if all required R2 env vars are set */
export function isR2Configured(): boolean {
  return !!(
    (R2_ENDPOINT_ENV || R2_ACCOUNT_ID) &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_PUBLIC_URL
  )
}

// ==========================================
// S3-compatible helpers (AWS Signature V4)
// ==========================================

const R2_ENDPOINT = R2_ENDPOINT_ENV || (R2_ACCOUNT_ID
  ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : '')

/** Simple UTC timestamp for AWS auth headers */
function getAmzDate(): string {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function getDateStamp(): string {
  return getAmzDate().slice(0, 8)
}

/**
 * HMAC-SHA256 helper using Web Crypto API.
 * Returns hex-encoded HMAC digest.
 */
async function hmacSHA256(key: ArrayBuffer | string, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    typeof key === 'string' ? new TextEncoder().encode(key) : key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
}

async function getSignatureKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string
): Promise<ArrayBuffer> {
  const kDate = await hmacSHA256(`AWS4${secretKey}`, dateStamp)
  const kRegion = await hmacSHA256(kDate, region)
  const kService = await hmacSHA256(kRegion, service)
  const kSigning = await hmacSHA256(kService, 'aws4_request')
  return kSigning
}

function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Signs an S3 request using AWS Signature Version 4.
 * Returns the Authorization header value.
 */
async function signRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: ArrayBuffer
): Promise<string> {
  const service = 's3'
  const region = 'auto'
  const amzDate = getAmzDate()
  const dateStamp = getDateStamp()

  const urlObj = new URL(url)
  const canonicalUri = urlObj.pathname
  const canonicalQuerystring = urlObj.searchParams.toString()

  // Ensure required headers
  headers['host'] = urlObj.host
  headers['x-amz-date'] = amzDate
  headers['x-amz-content-sha256'] = 'UNSIGNED-PAYLOAD'

  // Build canonical headers
  const signedHeaderKeys = Object.keys(headers)
    .map((k) => k.toLowerCase())
    .sort()
  const canonicalHeaders = signedHeaderKeys
    .map((k) => `${k}:${headers[k] || (k === 'host' ? urlObj.host : '')}\n`)
    .join('')

  const signedHeaders = signedHeaderKeys.join(';')

  // Canonical request
  const payloadHash = 'UNSIGNED-PAYLOAD'
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  // String to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const canonicalRequestHash = bufToHex(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest))
  )
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join('\n')

  // Signing key
  const signingKey = await getSignatureKey(R2_SECRET_ACCESS_KEY!, dateStamp, region, service)

  // Signature
  const signature = bufToHex(await hmacSHA256(signingKey, stringToSign))

  return `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}

// ==========================================
// Public API
// ==========================================

export interface R2UploadResult {
  key: string
  url: string
  bucket: string
}

export interface R2FileItem {
  key: string
  size: number
  lastModified: string
  url: string
}

/**
 * Upload a file to Cloudflare R2.
 *
 * @param bucket - The bucket name (overridden by R2_BUCKET_NAME env if set, but accepts explicit bucket for mapping)
 * @param file - The File/Blob to upload
 * @param filePath - The key/path within the bucket
 * @returns Upload result with key and public URL, or null if R2 is not configured
 */
export async function uploadFile(
  bucket: string,
  file: File | Blob,
  filePath: string
): Promise<R2UploadResult | null> {
  if (!isR2Configured()) return null

  try {
    const useBucket = R2_BUCKET_NAME || bucket
    const url = `${R2_ENDPOINT}/${useBucket}/${filePath}`
    const method = 'PUT'

    const headers: Record<string, string> = {
      'content-type': file.type || 'application/octet-stream',
    }

    const authorization = await signRequest(method, url, headers)
    headers['Authorization'] = authorization

    const body = await file.arrayBuffer()

    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    if (!response.ok) {
      console.error(`R2 upload failed: ${response.status} ${response.statusText}`)
      return null
    }

    return {
      key: filePath,
      url: `${R2_PUBLIC_URL}/${filePath}`,
      bucket: useBucket,
    }
  } catch (error) {
    console.error('R2 upload error:', error)
    return null
  }
}

/**
 * Delete a file from Cloudflare R2.
 *
 * @param bucket - The bucket name
 * @param filePath - The key/path of the file to delete
 * @returns true if deleted, false if not configured or failed
 */
export async function deleteFile(
  bucket: string,
  filePath: string
): Promise<boolean> {
  if (!isR2Configured()) return false

  try {
    const useBucket = R2_BUCKET_NAME || bucket
    const url = `${R2_ENDPOINT}/${useBucket}/${filePath}`
    const method = 'DELETE'

    const headers: Record<string, string> = {}

    const authorization = await signRequest(method, url, headers)
    headers['Authorization'] = authorization

    const response = await fetch(url, {
      method,
      headers,
    })

    if (!response.ok && response.status !== 204) {
      console.error(`R2 delete failed: ${response.status} ${response.statusText}`)
      return false
    }

    return true
  } catch (error) {
    console.error('R2 delete error:', error)
    return false
  }
}

/**
 * Get the public URL for a file in R2.
 *
 * @param bucket - The bucket name
 * @param filePath - The key/path of the file
 * @returns Public URL string, or null if R2 is not configured
 */
export function getFileUrl(bucket: string, filePath: string): string | null {
  if (!isR2Configured()) return null
  return `${R2_PUBLIC_URL}/${filePath}`
}

/**
 * List files in a Cloudflare R2 bucket with optional prefix filter.
 *
 * @param bucket - The bucket name
 * @param prefix - Optional path prefix to filter by
 * @returns Array of file items, or null if R2 is not configured
 */
export async function listFiles(
  bucket: string,
  prefix?: string
): Promise<R2FileItem[] | null> {
  if (!isR2Configured()) return null

  try {
    const useBucket = R2_BUCKET_NAME || bucket
    let url = `${R2_ENDPOINT}/${useBucket}?list-type=2`
    if (prefix) {
      url += `&prefix=${encodeURIComponent(prefix)}`
    }

    const method = 'GET'

    const headers: Record<string, string> = {}

    const authorization = await signRequest(method, url, headers)
    headers['Authorization'] = authorization

    const response = await fetch(url, {
      method,
      headers,
    })

    if (!response.ok) {
      console.error(`R2 list failed: ${response.status} ${response.statusText}`)
      return null
    }

    const xml = await response.text()
    const items: R2FileItem[] = []

    // Simple XML parsing for S3 ListObjectsV2 response
    const contentRegex = /<Contents>([\s\S]*?)<\/Contents>/g
    let match
    while ((match = contentRegex.exec(xml)) !== null) {
      const block = match[1]
      const keyMatch = block.match(/<Key><!\[CDATA\[(.*?)\]\]><\/Key>/) || block.match(/<Key>(.*?)<\/Key>/)
      const sizeMatch = block.match(/<Size>(.*?)<\/Size>/)
      const lastModMatch = block.match(/<LastModified>(.*?)<\/LastModified>/)

      if (keyMatch) {
        items.push({
          key: keyMatch[1],
          size: sizeMatch ? parseInt(sizeMatch[1], 10) : 0,
          lastModified: lastModMatch ? lastModMatch[1] : '',
          url: `${R2_PUBLIC_URL}/${keyMatch[1]}`,
        })
      }
    }

    return items
  } catch (error) {
    console.error('R2 list error:', error)
    return null
  }
}

/**
 * Generate a unique file path for uploads.
 * Format: {prefix}/{timestamp}-{random}.{ext}
 */
export function generateFilePath(prefix: string, fileName: string): string {
  const ext = fileName.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}/${timestamp}-${random}.${ext}`
}

/**
 * Map a bucket name used by the admin panel to an R2 path prefix.
 * - gallery-photos → gallery
 * - faculty-photos → faculty
 * - course-images → courses
 * - certificate-images → certificates
 * - photos → gallery
 * - faculty → faculty
 * - certificates → certificates
 * - courses → courses
 */
export function mapBucketToPrefix(bucket: string): string {
  const mapping: Record<string, string> = {
    'gallery-photos': 'gallery',
    'faculty-photos': 'faculty',
    'course-images': 'courses',
    'certificate-images': 'certificates',
    photos: 'gallery',
    faculty: 'faculty',
    certificates: 'certificates',
    courses: 'courses',
  }
  return mapping[bucket] || bucket
}
