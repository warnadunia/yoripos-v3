import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const piutang = await prisma.sale.findMany({
      where: {
        status: 'piutang',
      },
      include: {
        sale_details: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: piutang,
    });
  } catch (error: any) {
    console.error('❌ GET_PIUTANG_ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat daftar piutang.' },
      { status: 500 }
    );
  }
}
