import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/register', '/verify-otp']

function decodeTokenPayload(token: string): { user_id?: string; role?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    return payload
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value

  // Public routes - redirect authenticated users to appropriate page
  if (publicRoutes.some(route => pathname === route)) {
    if (accessToken) {
      const payload = decodeTokenPayload(accessToken)
      const role = payload?.role || 'client'
      
      if (role === 'client') {
        return NextResponse.redirect(new URL('/', request.url))
      } else if (role === 'consultant') {
        return NextResponse.redirect(new URL('/consultant/dashboard', request.url))
      } else if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Protected routes - require authentication
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route protection
  const payload = decodeTokenPayload(accessToken)
  const role = payload?.role || 'client'

  // Consultant-only routes
  if (pathname.startsWith('/consultant') && role !== 'consultant') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Client-only routes (prevent consultant/admin from accessing client routes)
  if (pathname.startsWith('/client') && role === 'client') {
    return NextResponse.next()
  }
  if (pathname.startsWith('/client') && role !== 'client') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}