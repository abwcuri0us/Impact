import { NextRequest } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'
import bcrypt from 'bcryptjs'

export const AUTH_COOKIE_NAME = 'auth-token'
export const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-key-do-not-use-in-production'

const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: string
  username: string
  role: string
  permissions: Record<string, { read: boolean; write: boolean }>
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function verifyAuth(request: NextRequest): Promise<{ authenticated: boolean; user?: JWTPayload }> {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return { authenticated: false }
    }

    const { payload } = await jwtVerify(token, secret)
    const user = payload as unknown as JWTPayload

    return { authenticated: true, user }
  } catch {
    return { authenticated: false }
  }
}

export async function createToken(userData: {
  userId: string
  username: string
  role: string
  permissions: string
}): Promise<string> {
  let permissions: Record<string, { read: boolean; write: boolean }>
  try {
    permissions = JSON.parse(userData.permissions)
  } catch {
    permissions = {}
  }

  return new SignJWT({
    userId: userData.userId,
    username: userData.username,
    role: userData.role,
    permissions,
  } satisfies JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

/**
 * Check if an authenticated user has the required permission for a section.
 * Admins always have full access. Returns true if user has the permission.
 */
export function hasPermission(
  auth: { authenticated: boolean; user?: JWTPayload },
  section: string,
  mode: 'read' | 'write' = 'write'
): boolean {
  if (!auth.authenticated || !auth.user) return false
  // Admins have full access to everything
  if (auth.user.role === 'admin') return true
  // Check specific section permission
  const perm = auth.user.permissions?.[section]
  if (!perm) return false
  return mode === 'read' ? !!perm.read : !!perm.write
}

export function getDefaultPermissions(): string {
  return JSON.stringify({
    courses: { read: true, write: true },
    faculty: { read: true, write: true },
    gallery: { read: true, write: true },
    videos: { read: true, write: true },
    certificates: { read: true, write: true },
    enquiries: { read: true, write: false },
  })
}
