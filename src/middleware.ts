import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeJWT, JWT_COOKIE_NAME } from '@/lib/auth/jwt'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(JWT_COOKIE_NAME)?.value

  // Public routes
  if (request.nextUrl.pathname.startsWith('/auth/login')) {
    if (token) {
      try {
        const payload = await decodeJWT(token)
        // Redirect to appropriate dashboard
        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (payload.role === 'business') {
          return NextResponse.redirect(new URL('/business', request.url))
        }
      } catch {
        // Invalid token, allow access to login
      }
    }
    return NextResponse.next()
  }

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      const payload = await decodeJWT(token)
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/business')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      const payload = await decodeJWT(token)
      if (payload.role !== 'business') {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/business/:path*',
    '/auth/login',
  ],
}

