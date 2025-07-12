import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const userToken = req.cookies.get('authToken')?.value;
  const adminToken = req.cookies.get('adminAuthToken')?.value;
  const { pathname } = req.nextUrl;

  // Melindungi halaman admin (rekapitulasi, riwayat, dll.)
  if (pathname.startsWith('/admindashboard/') && pathname !== '/admindashboard') {
    if (!adminToken) return NextResponse.redirect(new URL('/admindashboard', req.url));
  }

  // Melindungi halaman dashboard user
  if (pathname.startsWith('/dashboard')) {
    if (!userToken) return NextResponse.redirect(new URL('/', req.url));
  }
  
  // Jika sudah login sebagai user, jangan biarkan ke halaman login user
  if (pathname === '/' && userToken) {
     return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Jika sudah login sebagai admin, jangan biarkan ke halaman login admin
  if (pathname === '/admindashboard' && adminToken) {
    return NextResponse.redirect(new URL('/admindashboard/rekapitulasi', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admindashboard/:path*', '/', '/admindashboard'],
};