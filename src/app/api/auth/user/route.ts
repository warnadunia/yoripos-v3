import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'yoripos_super_secret_key_v3_2026_xYz'
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('asayori_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId as number;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      id: user.id,
      username: user.username,
      role: user.role?.name || 'cashier',
      permissions: user.role?.permissions || [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
