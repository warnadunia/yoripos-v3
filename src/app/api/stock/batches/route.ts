import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    const where: any = {};
    if (productId) where.product_id = parseInt(productId, 10);

    const batches = await prisma.stockBatch.findMany({
      where,
      include: { product: { select: { id: true, name: true, sku: true } } },
      orderBy: [{ product_id: 'asc' }, { id: 'asc' }],
    });

    return NextResponse.json({ success: true, data: batches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal memuat batch stok.' }, { status: 500 });
  }
}
