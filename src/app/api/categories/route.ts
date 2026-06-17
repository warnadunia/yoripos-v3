// src/app/api/categories/route.ts (Full Fixed - POS Category Navigation)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ POS_CATEGORIES_GET_ERROR:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar kategori.' },
      { status: 500 }
    );
  }
}