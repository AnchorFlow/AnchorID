import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_COOKIE, ROLE_COOKIE } from './lib/cookie-names';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Anchor-portal authorization is per-AnchorOrganization (AnchorMember row),
  // checked server-side by the API — not a global role — so any
  // authenticated user may reach /anchor (that's also how org registration,
  // i.e. becoming an anchor admin, works in the first place).
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/anchor/:path*', '/admin/:path*'],
};
