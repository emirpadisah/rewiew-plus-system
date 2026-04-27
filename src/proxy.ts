import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeJWT, JWT_COOKIE_NAME } from '@/lib/auth/jwt'

const isDevelopment = process.env.NODE_ENV === 'development'

function logProxy(message: string, pathname: string, details?: Record<string, unknown>) {
  if (!isDevelopment) {
    return
  }

  console.log(`[Proxy] ${message}`, {
    pathname,
    timestamp: new Date().toISOString(),
    ...details,
  })
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.delete(JWT_COOKIE_NAME)
  return response
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(JWT_COOKIE_NAME)?.value
  const pathname = request.nextUrl.pathname

  logProxy('Request started', pathname, { hasToken: Boolean(token) })

  if (pathname === '/') {
    if (token) {
      try {
        const payload = await decodeJWT(token)

        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }

        if (payload.role === 'business') {
          return NextResponse.redirect(new URL('/business', request.url))
        }
      } catch {
        return clearAuthCookie(NextResponse.next())
      }
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/auth/login')) {
    if (token) {
      try {
        const payload = await decodeJWT(token)

        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }

        if (payload.role === 'business') {
          return NextResponse.redirect(new URL('/business', request.url))
        }
      } catch {
        return clearAuthCookie(NextResponse.next())
      }
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      const payload = await decodeJWT(token)

      if (payload.role !== 'admin') {
        return clearAuthCookie(NextResponse.redirect(new URL('/auth/login', request.url)))
      }
    } catch {
      return clearAuthCookie(NextResponse.redirect(new URL('/auth/login', request.url)))
    }
  }

  if (pathname.startsWith('/business')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      const payload = await decodeJWT(token)

      if (payload.role !== 'business') {
        return clearAuthCookie(NextResponse.redirect(new URL('/auth/login', request.url)))
      }
    } catch {
      return clearAuthCookie(NextResponse.redirect(new URL('/auth/login', request.url)))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*', '/business/:path*', '/auth/login'],
}
