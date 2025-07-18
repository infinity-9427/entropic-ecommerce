import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Temporarily disable authentication for dashboard routes
  // This allows access to the dashboard without authentication
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Allow access to dashboard without authentication checks
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
