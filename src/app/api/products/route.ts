// src/app/api/products/route.ts (Full Fixed - POS Product Catalog Engine)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 1. Ambil query parameter untuk pencarian dan filter dari URL
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    const categoryId = searchParams.get('category_id');
    const showAll = searchParams.get('all') === 'true';

    // 2. Bangun kondisi query dinamis
    const whereCondition: any = {};
    if (!showAll) {
      whereCondition.type = 'produk_jual';
    }

    // Jika kasir mengetik sesuatu di kolom pencarian
    if (searchQuery) {
      whereCondition.OR = [
        { name: { contains: searchQuery } },
        { code: { contains: searchQuery } }, // Bisa scan via Barcode Scanner langsung!
      ];
    }

    // Jika kasir memilih filter kategori tertentu
    if (categoryId) {
      whereCondition.category_id = parseInt(categoryId, 10);
    }

    // 3. Tarik data dari TiDB Cloud, urutkan berdasarkan nama teratas
    const products = await prisma.product.findMany({
      where: whereCondition,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // 4. Kembalikan data siap saji ke Frontend Kasir Minimalis lu
    return NextResponse.json(
      {
        success: true,
        count: products.length,
        data: products,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ POS_PRODUCTS_GET_ERROR:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil katalog produk dari server database.' },
      { status: 500 }
    );
  }
}

// POST /api/products — Create a new product (menu or material)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sku, name, price_sell, category_id, type, unit, image_url } = body;

    if (!sku || !name || price_sell === undefined) {
      return NextResponse.json({ success: false, error: 'SKU, Nama, dan Harga wajib diisi.' }, { status: 400 });
    }

    // Check duplicate SKU
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'SKU sudah terdaftar: ' + sku }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        price_sell: parseFloat(price_sell),
        category_id: category_id ? parseInt(category_id, 10) : null,
        type: type || 'produk_jual',
        unit: unit || 'pcs',
        image_url: image_url || null,
        total_stock: 0,
      },
    });

    return NextResponse.json({ success: true, message: 'Produk berhasil dibuat.', data: product }, { status: 201 });
  } catch (error: any) {
    console.error('❌ POS_PRODUCTS_POST_ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal membuat produk.' }, { status: 500 });
  }
}

// PUT /api/products — Edit existing product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, sku, name, price_sell, category_id, unit, image_url } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID produk wajib diisi.' }, { status: 400 });
    }

    const productId = parseInt(id, 10);
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    // Check duplicate SKU if changed
    if (sku && sku !== existingProduct.sku) {
      const skuConflict = await prisma.product.findUnique({ where: { sku } });
      if (skuConflict) {
        return NextResponse.json({ success: false, error: 'SKU sudah digunakan: ' + sku }, { status: 400 });
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(sku !== undefined ? { sku } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(price_sell !== undefined ? { price_sell: parseFloat(price_sell) } : {}),
        ...(category_id !== undefined ? { category_id: category_id ? parseInt(category_id, 10) : null } : {}),
        ...(unit !== undefined ? { unit } : {}),
        ...(image_url !== undefined ? { image_url } : {}),
      },
    });

    return NextResponse.json({ success: true, message: 'Produk berhasil diperbarui.', data: updated });
  } catch (error: any) {
    console.error('❌ POS_PRODUCTS_PUT_ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal memperbarui produk.' }, { status: 500 });
  }
}

// DELETE /api/products?id=X — Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Parameter id wajib diisi.' }, { status: 400 });
    }

    const productId = parseInt(id, 10);
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    // Delete related records first
    await prisma.productRecipe.deleteMany({ where: { menu_id: productId } });
    await prisma.productRecipe.deleteMany({ where: { material_id: productId } });
    await prisma.stockBatch.deleteMany({ where: { product_id: productId } });
    await prisma.stockIn.deleteMany({ where: { product_id: productId } });
    await prisma.stockAdjustment.deleteMany({ where: { product_id: productId } });

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus.' });
  } catch (error: any) {
    console.error('❌ POS_PRODUCTS_DELETE_ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menghapus produk.' }, { status: 500 });
  }
}