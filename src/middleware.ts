import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { AUTH_COOKIE_NAME, JWT_SECRET } from '@/lib/auth'

const secret = new TextEncoder().encode(JWT_SECRET)

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes, but allow /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      await jwtVerify(token, secret)
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
