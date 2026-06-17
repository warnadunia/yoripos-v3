// src/app/api/auth/login/route.ts (Full Fixed)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/crypto';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'yoripos_super_secret_key_v3_2026_xYz'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi bosku.' },
        { status: 400 }
      );
    }

    // Ambil data user dari TiDB Cloud
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // Verifikasi password dengan Crypto Scrypt
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // Buat JWT Token aman via Jose
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      role: user.role?.name || 'cashier',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(SECRET_KEY);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Akses Command Center dibuka!',
        user: { name: user.name, username: user.username },
      },
      { status: 200 }
    );

    // Set cookie httpOnly ke browser client
    response.cookies.set('asayori_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // Aktif 1 hari
    });

    return response;
  } catch (error: any) {
    console.error('❌ LOGIN_API_ERROR:', error);
    return NextResponse.json(
      { error: 'Gagal memproses autentikasi pada server.' },
      { status: 500 }
    );
  }
}