import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the user is accessing dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check if user has a token in localStorage (this will be handled by the AuthProvider)
    // For now, we'll let the AuthProvider handle the redirect
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
