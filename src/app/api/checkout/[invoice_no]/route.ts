// src/app/api/checkout/[invoice_no]/route.ts
// Public endpoint to fetch a sale by invoice number for digital receipt display
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoice_no: string }> }
) {
  try {
    const { invoice_no } = await params;

    if (!invoice_no || invoice_no.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Nomor invoice wajib dilampirkan.' },
        { status: 400 }
      );
    }

    const sale = await prisma.sale.findUnique({
      where: { invoice_no: invoice_no.trim() },
      include: {
        customer: true,
        sale_details: {
          include: {
            product: {
              select: { name: true, sku: true },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'Struk tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sale,
    });
  } catch (error: any) {
    console.error('❌ GET_SALE_BY_INVOICE_ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat data struk.' },
      { status: 500 }
    );
  }
}
