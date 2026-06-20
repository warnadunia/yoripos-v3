import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/availability
// Returns for each produk_jual: how many portions can be made from current stock
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id'); // optional, single product

    const where: any = { type: 'produk_jual' };
    if (productId) where.id = parseInt(productId, 10);

    const products = await prisma.product.findMany({
      where,
      include: {
        as_menu: {
          include: {
            material: {
              select: { id: true, name: true, unit: true, total_stock: true },
            },
          },
        },
      },
    });

    const result: any[] = [];

    for (const product of products) {
      if (product.as_menu.length === 0) {
        // No recipe → availability based on total_stock (fallback)
        result.push({
          product_id: product.id,
          sku: product.sku,
          name: product.name,
          max_portions: product.total_stock,
          has_recipe: false,
        });
        continue;
      }

      let maxPortions = Infinity;
      const details: { materialName: string; stock: number; required: number; portions: number }[] = [];

      for (const recipe of product.as_menu) {
        const qtyRequired = Number(recipe.qty_required);
        if (qtyRequired <= 0) continue;

        // Get actual stock from batches for this material
        const batches = await prisma.stockBatch.findMany({
          where: { product_id: recipe.material_id, qty_remaining: { gt: 0 } },
          select: { qty_remaining: true },
        });
        let availableStock = batches.reduce((s, b) => s + b.qty_remaining, 0);

        const unitLower = (recipe.material.unit || '').toLowerCase();
        if (unitLower === 'kg' || unitLower === 'liter') {
          availableStock = availableStock * 1000;
        }

        const portions = Math.floor(availableStock / qtyRequired);
        maxPortions = Math.min(maxPortions, portions);

        details.push({
          materialName: recipe.material.name,
          stock: availableStock,
          required: qtyRequired,
          portions,
        });
      }

      result.push({
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        max_portions: maxPortions === Infinity ? 0 : maxPortions,
        has_recipe: true,
        details,
      });
    }

    return NextResponse.json({ success: true, data: productId ? result[0] || null : result });
  } catch (error: any) {
    console.error('❌ AVAILABILITY_ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal.' }, { status: 500 });
  }
}
