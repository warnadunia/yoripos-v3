// src/app/api/products/route.ts (Full Fixed - POS Product Catalog Engine)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 1. Ambil query parameter untuk pencarian dan filter dari URL
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    const categoryId = searchParams.get('category_id');

    // 2. Bangun kondisi query dinamis
    const whereCondition: any = {
      // Kasir hanya perlu melihat barang yang siap dijual, bukan bahan baku murni
      type: 'produk_jual', 
    };

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