// src/app/api/checkout/route.ts (Full Fixed - FIFO Stock Batch Checkout Engine)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json(
        { error: 'Keranjang belanja kosong atau tidak valid.' },
        { status: 400 }
      );
    }

    // Jalankan Database Transaction (All-or-Nothing Isolation Level)
    const transactionResult = await prisma.$transaction(async (tx) => {
      
      // A. GENERATE NOMOR INVOICE UNIK (Format: INV-YYYYMMDD-RANDOM)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const invoiceNo = `INV-${dateStr}-${randomId}`;

      // B. HITUNG TOTAL NILAI TRANSAKSI DI SISI SERVER (Mencegah Manipulasi Harga Client-side)
      let grandTotal = 0;
      for (const item of cart) {
        grandTotal += Number(item.product.price_sell) * item.quantity;
      }

      // C. SIMPAN NOTA UTAMA (Tabel Sale)
      // Mencocokkan nilai enum dari schema.prisma: DocStatus (lunas) & OrderType (dine_in)
      const sale = await tx.sale.create({
        data: {
          invoice_no: invoiceNo,
          total_amount: grandTotal,
          status: 'lunas',
          order_type: 'dine_in',
        },
      });

      // D. LOOPING DETAIL PRODUK & EKSEKUSI POTONG STOK BATCH (FIFO METHOD)
      for (const item of cart) {
        const productId = item.product.id;
        let qtyNeeded = item.quantity;
        const priceSell = Number(item.product.price_sell);
        const subtotal = priceSell * qtyNeeded;

        // 1. Suntik Data ke Tabel SaleDetail
        await tx.saleDetail.create({
          data: {
            sale_id: sale.id,
            product_id: productId,
            quantity: qtyNeeded,
            price_sell: priceSell,
            subtotal: subtotal,
          },
        });

        // 2. Ambil Antrean Batch Stok Berdasarkan Tanggal Masuk / ID Terlama (FIFO)
        // Catatan: Jika nama kolom sisa stok di skema asli kamu bukan 'qty_remaining', sesuaikan bagian ini.
        const activeBatches = await tx.stockBatch.findMany({
          where: {
            product_id: productId,
            qty_remaining: { gt: 0 }, 
          },
          orderBy: {
            id: 'asc', // ID terkecil/terlama diproses duluan
          },
        });

        // Hitung total stok tersedia dari seluruh batch yang aktif
        const totalAvailableStock = activeBatches.reduce((sum, b) => sum + Number(b.qty_remaining), 0);
        if (totalAvailableStock < qtyNeeded) {
          throw new Error(`Stok produk "${item.product.name}" tidak mencukupi! Dibutuhkan: ${qtyNeeded}, Tersedia: ${totalAvailableStock}`);
        }

        // 3. Kurangi Stok Per Batch Secara Berurutan
        for (const batch of activeBatches) {
          if (qtyNeeded <= 0) break;

          const currentBatchQty = Number(batch.qty_remaining);

          if (currentBatchQty >= qtyNeeded) {
            // Sisa stok di batch saat ini sangat cukup
            await tx.stockBatch.update({
              where: { id: batch.id },
              data: { qty_remaining: currentBatchQty - qtyNeeded },
            });
            qtyNeeded = 0; // Kebutuhan terpenuhi total
          } else {
            // Stok di batch ini kurang, habiskan batch ini lalu lanjut ke batch berikutnya
            await tx.stockBatch.update({
              where: { id: batch.id },
              data: { qty_remaining: 0 },
            });
            qtyNeeded -= currentBatchQty; // Kurangi sisa utang kuantitas
          }
        }

        // 4. Update Agregat Total Stok Utama Pada Tabel Product
        await tx.product.update({
          where: { id: productId },
          data: {
            total_stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return sale;
    });

    return NextResponse.json({
      success: true,
      message: 'Transaksi lunas berhasil disimpan dan stok batch terpotong aman.',
      data: transactionResult,
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ POS_CHECKOUT_TRANSACTION_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses transaksi simpan nota.' },
      { status: 500 }
    );
  }
}