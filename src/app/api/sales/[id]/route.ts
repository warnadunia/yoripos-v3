import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const saleId = parseInt(id);

    const sale = await prisma.sale.findUnique({ where: { id: saleId } });
    if (!sale) {
      return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan.' }, { status: 404 });
    }

    // Restore stock
    const details = await prisma.saleDetail.findMany({ where: { sale_id: saleId } });
    for (const d of details) {
      const recipeIngredients = await prisma.productRecipe.findMany({
        where: { menu_id: d.product_id },
        include: { material: true },
      });

      if (recipeIngredients.length > 0) {
        for (const ing of recipeIngredients) {
          const qtyToRestore = Number(ing.qty_required) * d.qty;
          const unitLower = (ing.material.unit || '').toLowerCase();
          const qtyToRestoreInStockUnit = (unitLower === 'kg' || unitLower === 'liter') ? qtyToRestore / 1000 : qtyToRestore;

          const latestBatch = await prisma.stockBatch.findFirst({
            where: { product_id: ing.material_id },
            orderBy: { id: 'desc' },
          });

          if (latestBatch) {
            await prisma.stockBatch.update({
              where: { id: latestBatch.id },
              data: { qty_remaining: { increment: qtyToRestoreInStockUnit } },
            });
          }

          await prisma.product.update({
            where: { id: ing.material_id },
            data: { total_stock: { increment: qtyToRestoreInStockUnit } },
          });
        }
      } else {
        if (d.stock_batch_id > 0) {
          await prisma.stockBatch.update({
            where: { id: d.stock_batch_id },
            data: { qty_remaining: { increment: d.qty } },
          });
        }
        await prisma.product.update({
          where: { id: d.product_id },
          data: { total_stock: { increment: d.qty } },
        });
      }
    }

    await prisma.saleDetail.deleteMany({ where: { sale_id: saleId } });
    await prisma.sale.delete({ where: { id: saleId } });

    return NextResponse.json({ success: true, message: 'Transaksi ' + sale.invoice_no + ' berhasil dihapus.' });
  } catch (error: any) {
    console.error('❌ DELETE_SALE_ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menghapus transaksi.' },
      { status: 500 }
    );
  }
}
