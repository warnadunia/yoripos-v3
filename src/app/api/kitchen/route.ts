import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.sale.findMany({
      where: {
        OR: [
          { status: 'proses' },
          { status: 'ready' },
        ],
      },
      include: {
        sale_details: {
          include: { product: true },
        },
        customer: true,
      },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error('❌ KITCHEN_GET_ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat pesanan dapur.' },
      { status: 500 }
    );
  }
}

// PUT /api/kitchen → Mark order as READY/SIAP
export async function PUT(request: NextRequest) {
  try {
    const { sale_id } = await request.json();

    if (!sale_id) {
      return NextResponse.json(
        { success: false, error: 'sale_id wajib dilampirkan.' },
        { status: 400 }
      );
    }

    const saleId = Number(sale_id);
    const sale = await prisma.sale.findUnique({ where: { id: saleId } });

    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (sale.status !== 'proses') {
      return NextResponse.json(
        { success: false, error: 'Hanya pesanan berstatus ORD yang dapat diselesaikan dapur.' },
        { status: 400 }
      );
    }

    const updated = await prisma.sale.update({
      where: { id: saleId },
      data: {
        status: 'ready',
        ready_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Pesanan ${sale.invoice_no} siap!`,
      data: updated,
    });
  } catch (error: any) {
    console.error('❌ KITCHEN_PUT_ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memperbarui status pesanan.' },
      { status: 500 }
    );
  }
}
