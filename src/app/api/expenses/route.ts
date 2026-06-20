import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    const where: any = {};
    if (year) {
      const y = parseInt(year, 10);
      const m = month ? parseInt(month, 10) : null;
      const startDate = m ? new Date(y, m - 1, 1) : new Date(y, 0, 1);
      const endDate = m ? new Date(y, m, 1) : new Date(y + 1, 0, 1);
      where.expense_date = { gte: startDate, lt: endDate };
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { expense_date: 'desc' },
    });

    return NextResponse.json({ success: true, data: expenses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal memuat pengeluaran.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expense_date, category, amount, description } = body;

    if (!expense_date || !category || !amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: 'Tanggal, kategori, dan jumlah wajib diisi.' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        expense_date: new Date(expense_date),
        category: category.trim(),
        amount: parseFloat(amount),
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, message: 'Pengeluaran berhasil dicatat.', data: expense }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal mencatat pengeluaran.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID pengeluaran wajib diisi.' }, { status: 400 });
    }

    await prisma.expense.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true, message: 'Pengeluaran berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal menghapus pengeluaran.' }, { status: 500 });
  }
}
