import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // Redirect to login if no token is present
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = decodeJwt(token);
      
      // Check expiration
      if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(loginUrl);
        // Clear the expired cookie
        response.cookies.delete('token');
        return response;
      }
    } catch (error) {
      // Invalid token
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      return response;
    }
  }

  // Also protect the root path and redirect it to dashboard based on role?
  // Let the root page handle it or just let it pass
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
