import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { _count: { select: { sales: true } } },
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal memuat data pelanggan.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, address, latitude, longitude } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Nama pelanggan wajib diisi.' }, { status: 400 });
    }

    const existing = await prisma.customer.findFirst({ where: { name: name.trim() } });
    if (existing) {
      // Update existing
      const updated = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          phone: phone || existing.phone,
          address: address || existing.address,
          latitude: latitude || existing.latitude,
          longitude: longitude || existing.longitude,
        },
      });
      return NextResponse.json({ success: true, message: 'Data pelanggan diperbarui.', data: updated });
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone || null,
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Pelanggan baru ditambahkan.', data: customer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal menambah pelanggan.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, phone, address, latitude, longitude } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID pelanggan wajib diisi.' }, { status: 400 });
    }

    const data: any = {};
    if (name?.trim()) data.name = name.trim();
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (latitude !== undefined) data.latitude = latitude;
    if (longitude !== undefined) data.longitude = longitude;

    const updated = await prisma.customer.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json({ success: true, message: 'Data pelanggan diperbarui.', data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal memperbarui pelanggan.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID pelanggan wajib diisi.' }, { status: 400 });
    }

    await prisma.customer.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true, message: 'Pelanggan berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal menghapus pelanggan.' }, { status: 500 });
  }
}
