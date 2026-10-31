import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'facyport-hackathon-secret-key-2026';
const encodedKey = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, encodedKey, {
        algorithms: ['HS256'],
      });
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Proteksi route admin
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Jika sudah login dan mencoba akses /login, redirect ke /admin
  if (pathname === '/login') {
    if (isAuthenticated) {
      const adminUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
