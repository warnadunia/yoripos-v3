// src/app/api/auth/logout/route.ts (Full Fixed)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { success: true, message: 'Sesi berhasil dihapus. Keluar dari sistem.' },
    { status: 200 }
  );

  // Paksa cookie hangus dengan maxAge: 0
  response.cookies.set('asayori_auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}