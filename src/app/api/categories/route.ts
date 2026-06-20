// src/app/api/categories/route.ts (Full Fixed - POS Category Navigation)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeBahan = searchParams.get('exclude_bahan') === 'true';

    const whereClause: any = {};
    if (excludeBahan) {
      whereClause.name = { not: 'Bahan Baku' };
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ POS_CATEGORIES_GET_ERROR:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil daftar kategori.' },
      { status: 500 }
    );
  }
}

// POST /api/categories — Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Nama kategori wajib diisi.' }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.category.findFirst({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Kategori sudah ada.' }, { status: 400 });
    }

    const category = await prisma.category.create({ data: { name: name.trim() } });
    return NextResponse.json({ success: true, message: 'Kategori berhasil dibuat.', data: category }, { status: 201 });
  } catch (error: any) {
    console.error('❌ CATEGORIES_POST_ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal membuat kategori.' }, { status: 500 });
  }
}

// PUT /api/categories — Edit category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'ID dan nama kategori wajib diisi.' }, { status: 400 });
    }

    const existing = await prisma.category.findFirst({ where: { name: name.trim(), NOT: { id: parseInt(id, 10) } } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Nama kategori sudah digunakan.' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: { name: name.trim() },
    });
    return NextResponse.json({ success: true, message: 'Kategori berhasil diperbarui.', data: category });
  } catch (error: any) {
    console.error('❌ CATEGORIES_PUT_ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal memperbarui kategori.' }, { status: 500 });
  }
}

// DELETE /api/categories?id=X — Delete category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Parameter id wajib diisi.' }, { status: 400 });
    }

    // Check if category has products
    const productCount = await prisma.product.count({ where: { category_id: parseInt(id, 10) } });
    if (productCount > 0) {
      return NextResponse.json({ success: false, error: 'Kategori memiliki ' + productCount + ' produk. Pindahkan produk dulu sebelum menghapus.' }, { status: 400 });
    }

    await prisma.category.delete({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (error: any) {
    console.error('❌ CATEGORIES_DELETE_ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menghapus kategori.' }, { status: 500 });
  }
}