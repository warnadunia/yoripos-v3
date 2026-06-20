import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const supplierId = searchParams.get('supplier_id');

    const where: any = {};
    if (productId) where.product_id = parseInt(productId, 10);
    if (supplierId) where.supplier_id = parseInt(supplierId, 10);

    // Fetch history ordered by change_date asc to compute delta sequentially
    const history = await prisma.supplierPriceHistory.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, sku: true, unit: true } },
      },
      orderBy: { change_date: 'asc' },
    });

    // Compute delta sequentially per product-supplier pair
    const lastPriceMap: Record<string, number> = {};
    
    const formattedHistory = history.map((record) => {
      const key = `${record.supplier_id}-${record.product_id}`;
      const price = Number(record.price_buy);
      const prevPrice = lastPriceMap[key];
      
      let deltaPercent = 0;
      if (prevPrice !== undefined && prevPrice > 0) {
        deltaPercent = ((price - prevPrice) / prevPrice) * 100;
      }
      
      // Update map with current price
      lastPriceMap[key] = price;

      return {
        id: record.id,
        supplier_id: record.supplier_id,
        supplier_name: record.supplier.name,
        product_id: record.product_id,
        product_name: record.product.name,
        product_sku: record.product.sku,
        product_unit: record.product.unit,
        price_buy: price,
        change_date: record.change_date,
        batch_no: record.batch_no,
        delta_percent: deltaPercent,
      };
    });

    // Return the formatted history in reverse order (descending by date) for the user display
    formattedHistory.reverse();

    return NextResponse.json({ success: true, data: formattedHistory });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal memuat histori harga.' }, { status: 500 });
  }
}
