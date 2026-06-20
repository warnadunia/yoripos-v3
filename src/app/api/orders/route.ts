import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Unified Orders API
// ?type=pesanan|piutang|riwayat&year=2026&month=3&search=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'pesanan'; // pesanan | piutang | riwayat
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const search = searchParams.get('search') || '';

    // Build status filter
    let statusFilter: any;
    if (type === 'pesanan') {
      statusFilter = { in: ['proses', 'ready'] };
    } else if (type === 'piutang') {
      statusFilter = 'piutang';
    } else if (type === 'riwayat') {
      statusFilter = { in: ['lunas', 'terkirim', 'voided'] };
    }

    // Build date filter (for the entire year)
    const dateFilter: any = {};
    if (year) {
      const y = parseInt(year, 10);
      const startDate = new Date(y, 0, 1);
      const endDate = new Date(y + 1, 0, 1);
      dateFilter.gte = startDate;
      dateFilter.lt = endDate;
    }

    // Build search filter
    const searchFilter: any = {};
    if (search) {
      searchFilter.OR = [
        { invoice_no: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const where: any = {
      status: statusFilter,
      ...(year ? { created_at: dateFilter } : {}),
      ...(search ? searchFilter : {}),
    };

    // For pesanan, we want all ORD- prefixed (including proses and ready)
    // For riwayat, also show them ordered by date desc
    const orderBy: any = type === 'pesanan'
      ? [{ status: 'asc' as const }, { created_at: 'desc' as const }]
      : { created_at: 'desc' as const };

    const orders = await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        sale_details: {
          include: { product: { select: { name: true, sku: true } } },
        },
      },
      orderBy,
    });

    // Calculate monthly summary for the 12 months of the year
    const monthlySummary = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: 0,
      total: 0,
    }));

    orders.forEach((o) => {
      const mIdx = new Date(o.created_at).getMonth();
      monthlySummary[mIdx].count += 1;
      monthlySummary[mIdx].total += Number(o.total_amount);
    });

    // Filter to selected month
    const filteredOrders = orders.filter((o) => {
      if (!month) return true;
      return new Date(o.created_at).getMonth() + 1 === parseInt(month, 10);
    });

    // Add computed prefix field
    const enriched = filteredOrders.map((o) => ({
      ...o,
      prefix: o.invoice_no.startsWith('KWI') ? 'KWI' : o.invoice_no.startsWith('INV') ? 'INV' : 'ORD',
    }));

    return NextResponse.json({ success: true, data: enriched, monthlySummary });
  } catch (error: any) {
    console.error('❌ ORDERS_GET_ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat data pesanan.' },
      { status: 500 }
    );
  }
}
