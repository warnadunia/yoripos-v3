import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { product_id, qty_adjusted, type, reason, batch_id } = await request.json();

    if (!product_id || !qty_adjusted || qty_adjusted < 1) {
      return NextResponse.json({ success: false, error: 'Produk dan jumlah wajib diisi.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: parseInt(product_id) } });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    const adjustType = type || 'waste';
    const qty = parseInt(qty_adjusted);

    // Calculate cost_lost: find oldest batch price_buy * qty
    const batches = await prisma.stockBatch.findMany({
      where: { product_id: parseInt(product_id), qty_remaining: { gt: 0 } },
      orderBy: { id: 'asc' },
    });

    let remainingQty = qty;
    let totalCost = 0;
    for (const batch of batches) {
      if (remainingQty <= 0) break;
      const used = Math.min(remainingQty, batch.qty_remaining);
      totalCost += used * Number(batch.price_buy);

      if (batch_id && batch.id === parseInt(batch_id)) {
        // Adjust specific batch
        await prisma.stockBatch.update({
          where: { id: batch.id },
          data: { qty_remaining: batch.qty_remaining - used },
        });
      } else if (!batch_id) {
        // FIFO adjustment across all batches
        await prisma.stockBatch.update({
          where: { id: batch.id },
          data: { qty_remaining: batch.qty_remaining - used },
        });
      }
      remainingQty -= used;
    }

    await prisma.stockAdjustment.create({
      data: {
        product_id: parseInt(product_id),
        type: adjustType,
        qty_adjusted: qty,
        cost_lost: totalCost,
        reason: reason || null,
      },
    });

    // Update product total_stock
    await prisma.product.update({
      where: { id: parseInt(product_id) },
      data: { total_stock: { decrement: qty } },
    });

    return NextResponse.json({ success: true, message: 'Penyesuaian stok berhasil.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal menyesuaikan stok.' }, { status: 500 });
  }
}
