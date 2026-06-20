import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearStr = searchParams.get('year') || new Date().getFullYear().toString();
    const year = parseInt(yearStr, 10);

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    // Fetch all sales for this year
    const sales = await prisma.sale.findMany({
      where: {
        created_at: { gte: startDate, lt: endDate },
        status: { not: 'voided' },
      },
      include: {
        sale_details: true,
      },
    });

    // Fetch all expenses for this year
    const expenses = await prisma.expense.findMany({
      where: {
        expense_date: { gte: startDate, lt: endDate },
      },
    });

    // Calculate yearly totals
    let totalSales = 0;
    let totalPiutang = 0;
    let totalGrossProfit = 0;

    sales.forEach((s) => {
      totalSales += Number(s.total_amount);
      if (s.status === 'piutang') {
        totalPiutang += Number(s.total_amount) - Number(s.amount_paid);
      }
      s.sale_details.forEach((d) => {
        const profit = Number(d.price_sell_at_sale) - Number(d.price_buy_at_sale);
        totalGrossProfit += profit * d.qty;
      });
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalGrossProfit - totalExpenses;

    // Fetch total active batches count for Ringkasan info
    const batchesCount = await prisma.stockBatch.count({
      where: { qty_remaining: { gt: 0 } },
    });

    // Build monthly data for charts (1-12)
    const monthlySales = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);

    sales.forEach((s) => {
      const m = new Date(s.created_at).getMonth();
      monthlySales[m] += Number(s.total_amount);
    });

    expenses.forEach((e) => {
      const m = new Date(e.expense_date).getMonth();
      monthlyExpenses[m] += Number(e.amount);
    });

    return NextResponse.json({
      success: true,
      year,
      summary: {
        totalSales,
        totalExpenses,
        totalPiutang,
        totalGrossProfit,
        netProfit,
        transactionCount: sales.length,
        batchesCount,
      },
      chart: {
        sales: monthlySales,
        expenses: monthlyExpenses,
      },
    });
  } catch (error: any) {
    console.error('❌ DASHBOARD_GET_ERROR:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal memuat dashboard.' }, { status: 500 });
  }
}
