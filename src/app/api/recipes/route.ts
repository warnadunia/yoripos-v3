import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/recipes?menu_id=X — lihat daftar bahan/resep untuk produk tertentu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get('menu_id');

    if (!menuId) {
      return NextResponse.json({ success: false, error: 'Parameter menu_id wajib diisi.' }, { status: 400 });
    }

    const ingredients = await prisma.productRecipe.findMany({
      where: { menu_id: parseInt(menuId, 10) },
      include: {
        material: {
          select: { id: true, name: true, sku: true, unit: true, total_stock: true, price_sell: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Hitung HPP per komponen: qty_required × harga beli rata-rata dari batch FIFO aktif
    const hppBreakdown: { materialId: number; materialName: string; qtyRequired: number; unit: string; avgCost: number; subTotal: number }[] = [];
    let totalHpp = 0;

    for (const ing of ingredients) {
      const qty = Number(ing.qty_required);

      const batches = await prisma.stockBatch.findMany({
        where: { product_id: ing.material_id, qty_remaining: { gt: 0 } },
        select: { price_buy: true, qty_remaining: true, qty_initial: true },
        orderBy: { id: 'asc' },
      });

      let avgCost = 0;
      if (batches.length > 0) {
        const totalQty = batches.reduce((s, b) => s + b.qty_remaining, 0);
        const totalCost = batches.reduce((s, b) => {
          const unitCost = b.qty_initial > 0 ? Number(b.price_buy) / b.qty_initial : 0;
          return s + unitCost * b.qty_remaining;
        }, 0);
        avgCost = totalQty > 0 ? totalCost / totalQty : 0;
      }

      const unitLower = (ing.material.unit || '').toLowerCase();
      let smallestUnitCost = avgCost;
      if (unitLower === 'kg' || unitLower === 'liter') {
        smallestUnitCost = avgCost / 1000;
      }

      const subTotal = smallestUnitCost * qty;
      totalHpp += subTotal;

      hppBreakdown.push({
        materialId: ing.material_id,
        materialName: ing.material.name,
        qtyRequired: qty,
        unit: ing.material.unit,
        avgCost,
        subTotal,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ingredients,
        hppBreakdown,
        totalHpp,
      },
    });
  } catch (error: any) {
    console.error('❌ RECIPES_GET_ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal memuat resep.' }, { status: 500 });
  }
}

// POST /api/recipes — tambah bahan ke resep
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { menu_id, material_id, qty_required } = body;

    if (!menu_id || !material_id || !qty_required || Number(qty_required) <= 0) {
      return NextResponse.json({ success: false, error: 'menu_id, material_id, dan qty_required wajib diisi.' }, { status: 400 });
    }

    // Cek duplikat
    const existing = await prisma.productRecipe.findFirst({
      where: { menu_id: parseInt(menu_id, 10), material_id: parseInt(material_id, 10) },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Bahan ini sudah ada di resep. Gunakan edit atau hapus dulu.' }, { status: 400 });
    }

    const recipe = await prisma.productRecipe.create({
      data: {
        menu_id: parseInt(menu_id, 10),
        material_id: parseInt(material_id, 10),
        qty_required: parseFloat(qty_required),
      },
    });

    return NextResponse.json({ success: true, message: 'Bahan berhasil ditambahkan ke resep.', data: recipe }, { status: 201 });
  } catch (error: any) {
    console.error('❌ RECIPES_POST_ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menambah bahan.' }, { status: 500 });
  }
}

// DELETE /api/recipes?id=X — hapus bahan dari resep
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Parameter id wajib diisi.' }, { status: 400 });
    }

    await prisma.productRecipe.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true, message: 'Bahan berhasil dihapus dari resep.' });
  } catch (error: any) {
    console.error('❌ RECIPES_DELETE_ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menghapus bahan.' }, { status: 500 });
  }
}
