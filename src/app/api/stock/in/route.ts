import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { product_id, qty, price_buy, batch_no, supplier, supplier_id } = await request.json();

    if (!product_id || !qty || qty < 1) {
      return NextResponse.json({ success: false, error: 'Produk dan jumlah wajib diisi.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: parseInt(product_id) } });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    // Resolve supplier_id / supplier name
    let resolvedSupplierId: number | null = null;
    let resolvedSupplierName: string | undefined = undefined;

    if (supplier_id) {
      resolvedSupplierId = parseInt(supplier_id, 10);
      const dbSupplier = await prisma.supplier.findUnique({ where: { id: resolvedSupplierId } });
      if (dbSupplier) {
        resolvedSupplierName = dbSupplier.name;
      }
    } else if (supplier && supplier.trim()) {
      const name = supplier.trim();
      resolvedSupplierName = name;
      // Auto-lookup or create supplier if name is provided but no ID (backward compatibility / quick entry)
      const dbSupplier = await prisma.supplier.findUnique({ where: { name } });
      if (dbSupplier) {
        resolvedSupplierId = dbSupplier.id;
      } else {
        const newSupplier = await prisma.supplier.create({ data: { name } });
        resolvedSupplierId = newSupplier.id;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create stock batch
      const batchNo = batch_no || `BATCH-${Date.now()}`;
      const stockBatch = await tx.stockBatch.create({
        data: {
          product_id: parseInt(product_id),
          batch_no: batchNo,
          price_buy: price_buy || 0,
          qty_initial: parseInt(qty),
          qty_remaining: parseInt(qty),
          date_received: new Date(),
        },
      });

      // Record stock-in
      await tx.stockIn.create({
        data: {
          product_id: parseInt(product_id),
          qty: parseInt(qty),
          price_buy: price_buy || 0,
          supplier: resolvedSupplierName,
          supplier_id: resolvedSupplierId,
        },
      });

      // Record price history if supplier is associated
      if (resolvedSupplierId) {
        await tx.supplierPriceHistory.create({
          data: {
            supplier_id: resolvedSupplierId,
            product_id: parseInt(product_id),
            price_buy: price_buy || 0,
            batch_no: batchNo,
            change_date: new Date(),
          },
        });
      }

      // Update product total_stock
      await tx.product.update({
        where: { id: parseInt(product_id) },
        data: { total_stock: { increment: parseInt(qty) } },
      });

      return stockBatch;
    });

    return NextResponse.json({ success: true, message: 'Stok berhasil ditambahkan.', data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal menambah stok.' }, { status: 500 });
  }
}
