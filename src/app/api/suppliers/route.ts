import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const suppliers = await prisma.supplier.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {},
      include: {
        _count: {
          select: { stock_ins: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: suppliers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal memuat supplier.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, address } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Nama supplier wajib diisi.' }, { status: 400 });
    }

    const existing = await prisma.supplier.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Supplier dengan nama ini sudah ada.' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Supplier berhasil ditambahkan.', data: supplier }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal menambahkan supplier.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, email, address } = body;

    if (!id || !name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'ID dan nama supplier wajib diisi.' }, { status: 400 });
    }

    const existing = await prisma.supplier.findFirst({
      where: {
        name: name.trim(),
        NOT: { id: parseInt(id, 10) },
      },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Supplier dengan nama ini sudah ada.' }, { status: 400 });
    }

    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id, 10) },
      data: {
        name: name.trim(),
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Supplier berhasil diperbarui.', data: supplier });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal memperbarui supplier.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID supplier wajib diisi.' }, { status: 400 });
    }

    await prisma.supplier.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true, message: 'Supplier berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal menghapus supplier.' }, { status: 500 });
  }
}
