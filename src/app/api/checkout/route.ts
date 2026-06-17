// src/app/api/checkout/route.ts (Full Fixed - Synchronized with schema.prisma)
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

      // B. HITUNG TOTAL NILAI TRANSAKSI DI SISI SERVER
      let grandTotal = 0;
      for (const item of cart) {
        grandTotal += Number(item.product.price_sell) * item.quantity;
      }

      // C. SIMPAN NOTA UTAMA (Tabel Sale - Sesuai Skema Kolom Prisma Lu)
      const sale = await tx.sale.create({
        data: {
          invoice_no: invoiceNo,
          total_amount: grandTotal,
          amount_paid: grandTotal, // Dianggap langsung lunas bayar cash pas
          status: 'lunas',         // Menggunakan Enum DocStatus
          type: 'dine_in',         // Menggunakan nama kolom asli 'type' (Enum OrderType)
          payment_method: 'CASH',
        },
      });

      // D. LOOPING DETAIL PRODUK & EKSEKUSI POTONG STOK BATCH (FIFO METHOD)
      for (const item of cart) {
        const productId = item.product.id;
        let qtyNeeded = item.quantity;
        const priceSell = Number(item.product.price_sell);

        // 1. Ambil Antrean Batch Stok Berdasarkan ID Terlama / Tanggal Masuk (FIFO)
        const activeBatches = await tx.stockBatch.findMany({
          where: {
            product_id: productId,
            qty_remaining: { gt: 0 }, 
          },
          orderBy: {
            id: 'asc', // ID terkecil/terlama diproses duluan (FIFO)
          },
        });

        // Hitung total stok tersedia dari seluruh kumpulan batch aktif
        const totalAvailableStock = activeBatches.reduce((sum, b) => sum + b.qty_remaining, 0);
        if (totalAvailableStock < qtyNeeded) {
          throw new Error(`Stok produk "${item.product.name}" tidak mencukupi! Dibutuhkan: ${qtyNeeded}, Tersedia: ${totalAvailableStock}`);
        }

        // 2. Kurangi Stok Per Batch Secara Berurutan (FIFO)
        for (const batch of activeBatches) {
          if (qtyNeeded <= 0) break;

          const currentBatchQty = batch.qty_remaining;
          let qtyToDeduct = 0;

          if (currentBatchQty >= qtyNeeded) {
            qtyToDeduct = qtyNeeded;
            // Sisa stok di batch saat ini sangat cukup
            await tx.stockBatch.update({
              where: { id: batch.id },
              data: { qty_remaining: currentBatchQty - qtyNeeded },
            });
            qtyNeeded = 0; // Kebutuhan terpenuhi total
          } else {
            qtyToDeduct = currentBatchQty;
            // Stok di batch ini kurang, habiskan isi batch ini lalu lanjut ke batch berikutnya
            await tx.stockBatch.update({
              where: { id: batch.id },
              data: { qty_remaining: 0 },
            });
            qtyNeeded -= currentBatchQty; // Kurangi sisa utang kuantitas
          }

          // 3. Suntik Data ke Tabel SaleDetail per pecahan batch (Sangat presisi untuk Audit HPP/COGS)
          await tx.saleDetail.create({
            data: {
              sale_id: sale.id,
              product_id: productId,
              stock_batch_id: batch.id,            // Mencatat ID Batch asal muasal barang
              qty: qtyToDeduct,                    // Kolom asli: qty
              price_buy_at_sale: batch.price_buy,  // Mengunci HPP historis dari batch terkait
              price_sell_at_sale: priceSell,       // Mengunci harga jual saat transaksi
            },
          });
        }

        // 4. Update Agregat Total Stok Utama Pada Tabel Master Product
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