import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeJWT, JWT_COOKIE_NAME } from '@/lib/auth/jwt'

const isDevelopment = process.env.NODE_ENV === 'development'

function logMiddleware(message: string, pathname: string, details?: any) {
  if (isDevelopment) {
    console.log(`[Middleware] ${message}`, {
      pathname,
      timestamp: new Date().toISOString(),
      ...details,
    })
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(JWT_COOKIE_NAME)?.value
  const pathname = request.nextUrl.pathname

  logMiddleware('Request başlatıldı', pathname, { hasToken: !!token })

  // Home page - redirect logged in users to dashboard
  if (pathname === '/') {
    if (token) {
      try {
        const payload = await decodeJWT(token)
        // Redirect to appropriate dashboard
        if (payload.role === 'admin') {
          logMiddleware('Admin yönlendir', pathname, { userId: payload.userId })
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (payload.role === 'business') {
          logMiddleware('Business yönlendir', pathname, { userId: payload.userId })
          return NextResponse.redirect(new URL('/business', request.url))
        }
      } catch (error) {
        // Invalid token, allow access to home page
        logMiddleware('Token decode hatası', pathname, { error: (error as any)?.message })
      }
    }
    logMiddleware('Home page erişim izni verildi', pathname)
    return NextResponse.next()
  }

  // Public routes
  if (pathname.startsWith('/auth/login')) {
    if (token) {
      try {
        const payload = await decodeJWT(token)
        // Redirect to appropriate dashboard
        if (payload.role === 'admin') {
          logMiddleware('Login sayfasından admin yönlendir', pathname)
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (payload.role === 'business') {
          logMiddleware('Login sayfasından business yönlendir', pathname)
          return NextResponse.redirect(new URL('/business', request.url))
        }
      } catch (error) {
        // Invalid token, allow access to login
        logMiddleware('Token geçersiz, login izni verildi', pathname)
      }
    }
    logMiddleware('Login sayfa erişim izni verildi', pathname)
    return NextResponse.next()
  }

  // Protected routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      logMiddleware('Admin - Token yok, login yönlendir', pathname)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      const payload = await decodeJWT(token)
      if (payload.role !== 'admin') {
        logMiddleware('Admin - Yetkisiz erişim', pathname, { role: payload.role })
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
      logMiddleware('Admin erişim izni verildi', pathname, { userId: payload.userId })
    } catch (error) {
      logMiddleware('Admin - Token decode hatası', pathname, { error: (error as any)?.message })
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  if (pathname.startsWith('/business')) {
    if (!token) {
      logMiddleware('Business - Token yok, login yönlendir', pathname)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      const payload = await decodeJWT(token)
      if (payload.role !== 'business') {
        logMiddleware('Business - Yetkisiz erişim', pathname, { role: payload.role })
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
      logMiddleware('Business erişim izni verildi', pathname, { userId: payload.userId })
    } catch (error) {
      logMiddleware('Business - Token decode hatası', pathname, { error: (error as any)?.message })
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/business/:path*',
    '/auth/login',
  ],
}

