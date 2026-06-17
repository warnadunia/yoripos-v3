// src/proxy.ts (Full Fixed)
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'asayori_super_secret_key_2026_v3');

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('asayori_auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Izinkan akses tanpa hambatan untuk halaman login dan API autentikasi
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 2. Jika token tidak ditemukan, tendang user kembali ke halaman login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // 3. Verifikasi validitas token JWT aman
    await jwtVerify(token, SECRET_KEY);
    return NextResponse.next();
  } catch (error) {
    // 4. Jika token rusak/kedaluwarsa, hapus cookie dan paksa login ulang
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('asayori_auth_token');
    return response;
  }
}

// Konfigurasi rute mana saja yang wajib diawasi oleh sistem keamanan Proxy
export const config = {
  matcher: [
    /*
     * Proteksi semua halaman, kecuali:
     * - _next/static (file build internal)
     * - _next/image (optimasi gambar)
     * - favicon.ico (icon browser)
     * - folder public (logo, gambar asset statis)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};