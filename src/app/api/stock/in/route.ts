import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { product_id, qty, price_buy, batch_no, supplier } = await request.json();

    if (!product_id || !qty || qty < 1) {
      return NextResponse.json({ success: false, error: 'Produk dan jumlah wajib diisi.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: parseInt(product_id) } });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create stock batch
      const batchNo = batch_no || `BATCH-${Date.now()}`;
      const stockBatch = await tx.stockBatch.create({
        data: {
          product_id: parseInt(product_id),
          batch_no: batchNo,
          price_buy: price_buy || 0,
          qty_initial: parseInt(qty),
          qty_remaining: parseInt(qty),
          date_received: new Date(),
        },
      });

      // Record stock-in
      await tx.stockIn.create({
        data: {
          product_id: parseInt(product_id),
          qty: parseInt(qty),
          price_buy: price_buy || 0,
          supplier: supplier || null,
        },
      });

      // Update product total_stock
      await tx.product.update({
        where: { id: parseInt(product_id) },
        data: { total_stock: { increment: parseInt(qty) } },
      });

      return stockBatch;
    });

    return NextResponse.json({ success: true, message: 'Stok berhasil ditambahkan.', data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal menambah stok.' }, { status: 500 });
  }
}
