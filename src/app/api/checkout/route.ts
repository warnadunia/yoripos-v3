// src/app/api/checkout/route.ts (Full Fixed - Synchronized with schema.prisma)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pendingSales = await prisma.sale.findMany({
      where: {
        status: 'proses',
      },
      include: {
        sale_details: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: pendingSales,
    });
  } catch (error: any) {
    console.error('❌ GET_PENDING_SALES_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memuat daftar pesanan gantung.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cart,
      payment_status,
      payment_method = 'CASH',
      fulfillment_method = 'AMBIL_TOKO',
      customer_name,
      merge_sale_id
    } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json(
        { error: 'Keranjang belanja kosong atau tidak valid.' },
        { status: 400 }
      );
    }

    // Jalankan Database Transaction (All-or-Nothing Isolation Level)
    const transactionResult = await prisma.$transaction(async (tx) => {
      let sale;

      // B. HITUNG TOTAL NILAI TRANSAKSI DI SISI SERVER
      let grandTotal = 0;
      for (const item of cart) {
        grandTotal += Number(item.product.price_sell) * item.quantity;
      }

      if (merge_sale_id) {
        // Logika Penggabungan ke Nota Gantung / Pending yang Sudah Ada
        const parsedSaleId = Number(merge_sale_id);
        const existingSale = await tx.sale.findUnique({
          where: { id: parsedSaleId },
        });

        if (!existingSale) {
          throw new Error('Pesanan gantung tidak ditemukan.');
        }

        if (existingSale.status !== 'proses') {
          throw new Error('Hanya pesanan berstatus gantung (proses) yang dapat digabung.');
        }

        // Update nominal nota lama
        sale = await tx.sale.update({
          where: { id: parsedSaleId },
          data: {
            total_amount: Number(existingSale.total_amount) + grandTotal,
          },
        });
      } else {
        // Logika Pembuatan Transaksi Baru

        // A. GENERATE NOMOR INVOICE UNIK (Format: INV-YYYYMMDD-RANDOM)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const invoiceNo = `INV-${dateStr}-${randomId}`;

        // Hubungkan / Buat Customer jika customer_name dikirimkan
        let customerId = null;
        if (customer_name && customer_name.trim() !== '') {
          const trimmedName = customer_name.trim();
          let customer = await tx.customer.findFirst({
            where: { name: trimmedName },
          });

          if (!customer) {
            customer = await tx.customer.create({
              data: { name: trimmedName },
            });
          }
          customerId = customer.id;
        }

        // Petakan parameter input ke enum Prisma:
        // payment_status: 'lunas' | 'pending' | 'piutang'
        // DocStatus: 'proses' | 'terkirim' | 'piutang' | 'lunas' | 'voided'
        let dbStatus: 'proses' | 'piutang' | 'lunas' = 'lunas';
        let amountPaid = grandTotal;

        if (payment_status === 'pending') {
          dbStatus = 'proses';
          amountPaid = 0;
        } else if (payment_status === 'piutang') {
          dbStatus = 'piutang';
          amountPaid = 0;
        } else if (payment_status === 'lunas') {
          dbStatus = 'lunas';
          amountPaid = grandTotal;
        }

        // fulfillment_method: 'AMBIL_TOKO' | 'DIKIRIM'
        // OrderType: 'dine_in' | 'delivery'
        const dbOrderType: 'dine_in' | 'delivery' =
          fulfillment_method === 'DIKIRIM' ? 'delivery' : 'dine_in';

        // C. SIMPAN NOTA UTAMA (Tabel Sale)
        sale = await tx.sale.create({
          data: {
            invoice_no: invoiceNo,
            total_amount: grandTotal,
            amount_paid: amountPaid,
            status: dbStatus,
            type: dbOrderType,
            payment_method: payment_method,
            customer_id: customerId,
          },
        });
      }

      // D. LOOPING DETAIL PRODUK & EKSEKUSI POTONG STOK BATCH (FIFO METHOD)
      // Gunakan sale.id (baik baru maupun ter-update hasil merge)
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

          // 3. Suntik Data ke Tabel SaleDetail per pecahan batch
          await tx.saleDetail.create({
            data: {
              sale_id: sale.id,
              product_id: productId,
              stock_batch_id: batch.id,
              qty: qtyToDeduct,
              price_buy_at_sale: batch.price_buy,
              price_sell_at_sale: priceSell,
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
      message: merge_sale_id
        ? 'Berhasil menggabungkan item ke dalam nota gantung.'
        : 'Transaksi berhasil disimpan dan stok batch terpotong aman.',
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