import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch pending proses + ready orders
export async function GET() {
  try {
    const pendingSales = await prisma.sale.findMany({
      where: {
        OR: [{ status: 'proses' }, { status: 'ready' }],
      },
      include: {
        sale_details: { include: { product: true } },
        customer: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json({ success: true, data: pendingSales });
  } catch (error: any) {
    console.error('❌ GET_ORDERS_ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat pesanan.' },
      { status: 500 }
    );
  }
}

// POST: Create new order — ALWAYS ORD- prefix → goes to Kitchen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cart,
      fulfillment_method = 'AMBIL_TOKO',
      customer_name,
      customer_phone,
      delivery_address, // replaces lat/lng — Google Place address text
      payment_proof,
      merge_sale_id,
      sale_date, // VIP admin: custom transaction date
    } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keranjang belanja kosong.' },
        { status: 400 }
      );
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      let sale;

      // Calculate grand total
      let grandTotal = 0;
      for (const item of cart) {
        grandTotal += Number(item.product.price_sell) * item.quantity;
      }

      if (merge_sale_id) {
        // Merge into existing pending order
        const parsedSaleId = Number(merge_sale_id);
        const existingSale = await tx.sale.findUnique({ where: { id: parsedSaleId } });
        if (!existingSale) throw new Error('Pesanan tidak ditemukan.');
        if (existingSale.status !== 'proses') throw new Error('Hanya pesanan proses yang dapat digabung.');

        sale = await tx.sale.update({
          where: { id: parsedSaleId },
          data: { total_amount: Number(existingSale.total_amount) + grandTotal },
        });
      } else {
        // ALWAYS ORD- prefix — all orders go to kitchen first
        const targetCustomerName = (customer_name && customer_name.trim() !== '')
          ? customer_name.trim() : 'Pelanggan Setia';

        let customer = await tx.customer.findFirst({ where: { name: targetCustomerName } });
        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: targetCustomerName,
              phone: customer_phone || null,
              address: delivery_address || null,
            },
          });
        } else {
          if (customer_phone || delivery_address) {
            customer = await tx.customer.update({
              where: { id: customer.id },
              data: {
                phone: customer_phone || customer.phone,
                address: delivery_address || customer.address,
              },
            });
          }
        }

        // Generate ORD- prefix (always — goes to Kitchen)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const invoiceNo = `ORD-${dateStr}-${randomId}`;

        const dbOrderType: 'dine_in' | 'delivery' =
          fulfillment_method === 'DIKIRIM' ? 'delivery' : 'dine_in';

        sale = await tx.sale.create({
          data: {
            invoice_no: invoiceNo,
            total_amount: grandTotal,
            amount_paid: 0,
            status: 'proses', // always proses → ORD- → Kitchen
            type: dbOrderType,
            payment_method: 'PENDING',
            payment_proof: null,
            delivery_address: delivery_address || null,
            sale_date: sale_date ? new Date(sale_date) : null,
            customer_id: customer.id,
          },
        });
      }

      // FIFO Stock Deduction
      for (const item of cart) {
        const productId = item.product.id;
        let qtyNeeded = item.quantity;
        const priceSell = Number(item.product.price_sell);

        const recipeIngredients = await tx.productRecipe.findMany({
          where: { menu_id: productId },
          include: { material: true },
        });

        if (recipeIngredients.length > 0) {
          let totalItemHpp = 0;

          for (const ing of recipeIngredients) {
            const qtyNeededForIng = Number(ing.qty_required) * item.quantity;
            const unitLower = (ing.material.unit || '').toLowerCase();
            const qtyNeededInStockUnit = (unitLower === 'kg' || unitLower === 'liter') ? qtyNeededForIng / 1000 : qtyNeededForIng;

            const activeBatches = await tx.stockBatch.findMany({
              where: { product_id: ing.material_id, qty_remaining: { gt: 0 } },
              orderBy: { id: 'asc' },
            });

            const totalAvailableStock = activeBatches.reduce((sum, b) => sum + b.qty_remaining, 0);
            if (totalAvailableStock < qtyNeededInStockUnit) {
              throw new Error(`Stok bahan baku "${ing.material.name}" tidak mencukupi untuk membuat "${item.product.name}"! Butuh: ${qtyNeededInStockUnit} ${ing.material.unit}, Ada: ${totalAvailableStock} ${ing.material.unit}`);
            }

            let remainingToDeduct = qtyNeededInStockUnit;
            for (const batch of activeBatches) {
              if (remainingToDeduct <= 0) break;
              const currentBatchQty = batch.qty_remaining;
              let qtyToDeduct = 0;

              if (currentBatchQty >= remainingToDeduct) {
                qtyToDeduct = remainingToDeduct;
                await tx.stockBatch.update({
                  where: { id: batch.id },
                  data: { qty_remaining: currentBatchQty - remainingToDeduct },
                });
                remainingToDeduct = 0;
              } else {
                qtyToDeduct = currentBatchQty;
                await tx.stockBatch.update({
                  where: { id: batch.id },
                  data: { qty_remaining: 0 },
                });
                remainingToDeduct -= currentBatchQty;
              }

              const batchUnitCost = batch.qty_initial > 0 ? Number(batch.price_buy) / batch.qty_initial : 0;
              totalItemHpp += batchUnitCost * qtyToDeduct;
            }

            await tx.product.update({
              where: { id: ing.material_id },
              data: { total_stock: { decrement: qtyNeededInStockUnit } },
            });
          }

          const hppPerUnit = item.quantity > 0 ? totalItemHpp / item.quantity : 0;
          await tx.saleDetail.create({
            data: {
              sale_id: sale.id,
              product_id: productId,
              stock_batch_id: 0,
              qty: item.quantity,
              price_buy_at_sale: hppPerUnit,
              price_sell_at_sale: priceSell,
            },
          });

        } else {
          const activeBatches = await tx.stockBatch.findMany({
            where: { product_id: productId, qty_remaining: { gt: 0 } },
            orderBy: { id: 'asc' },
          });

          const totalAvailableStock = activeBatches.reduce((sum, b) => sum + b.qty_remaining, 0);
          if (totalAvailableStock < qtyNeeded) {
            throw new Error(`Stok "${item.product.name}" tidak mencukupi! Butuh: ${qtyNeeded}, Ada: ${totalAvailableStock}`);
          }

          for (const batch of activeBatches) {
            if (qtyNeeded <= 0) break;
            const currentBatchQty = batch.qty_remaining;
            let qtyToDeduct = 0;

            if (currentBatchQty >= qtyNeeded) {
              qtyToDeduct = qtyNeeded;
              await tx.stockBatch.update({
                where: { id: batch.id },
                data: { qty_remaining: currentBatchQty - qtyNeeded },
              });
              qtyNeeded = 0;
            } else {
              qtyToDeduct = currentBatchQty;
              await tx.stockBatch.update({
                where: { id: batch.id },
                data: { qty_remaining: 0 },
              });
              qtyNeeded -= currentBatchQty;
            }

            const batchUnitCost = batch.qty_initial > 0 ? Number(batch.price_buy) / batch.qty_initial : 0;
            await tx.saleDetail.create({
              data: {
                sale_id: sale.id,
                product_id: productId,
                stock_batch_id: batch.id,
                qty: qtyToDeduct,
                price_buy_at_sale: batchUnitCost,
                price_sell_at_sale: priceSell,
              },
            });
          }

          await tx.product.update({
            where: { id: productId },
            data: { total_stock: { decrement: item.quantity } },
          });
        }
      }

      return sale;
    });

    return NextResponse.json({
      success: true,
      message: merge_sale_id ? 'Item digabungkan ke nota.' : 'Pesanan diterima! Menunggu dapur.',
      data: transactionResult,
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ CHECKOUT_ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses transaksi.' },
      { status: 500 }
    );
  }
}

// PUT: Kasir pickup + payment OR Kurir delivery complete
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sale_id,
      action,          // 'kasir_pickup' | 'kurir_deliver'
      payment_status,  // 'lunas' | 'piutang'
      payment_method,  // 'CASH' | 'QRIS - ...' | 'TRANSFER - ...'
      payment_proof,   // base64 string
    } = body;

    if (!sale_id) {
      return NextResponse.json({ success: false, error: 'sale_id wajib.' }, { status: 400 });
    }

    const saleIdParsed = Number(sale_id);
    const sale = await prisma.sale.findUnique({ where: { id: saleIdParsed } });
    if (!sale) {
      return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan.' }, { status: 404 });
    }

    if (sale.status !== 'ready') {
      return NextResponse.json({
        success: false,
        error: 'Pesanan harus berstatus READY/SIAP sebelum diproses kasir/kurir.'
      }, { status: 400 });
    }

    // Kasir Pickup Flow: customer receives → payment at kasir
    if (action === 'kasir_pickup') {
      if (!payment_status) {
        return NextResponse.json({ success: false, error: 'payment_status wajib.' }, { status: 400 });
      }

      const methodUpper = (payment_method || '').toUpperCase();
      const isQrisOrTransfer = methodUpper.includes('QRIS') || methodUpper.includes('TRANSFER');
      if (isQrisOrTransfer && (!payment_proof || payment_proof.trim() === '')) {
        return NextResponse.json({
          success: false, error: 'Bukti bayar wajib untuk QRIS/Transfer!'
        }, { status: 400 });
      }

      const newStatus = payment_status === 'lunas' ? 'lunas' : 'piutang';
      const newPrefix = newStatus === 'lunas' ? 'KWI' : 'INV';
      const newInvoiceNo = sale.invoice_no.replace('ORD-', `${newPrefix}-`);

      const updated = await prisma.sale.update({
        where: { id: saleIdParsed },
        data: {
          status: newStatus,
          payment_method: payment_method || 'CASH',
          payment_proof: payment_proof || null,
          amount_paid: newStatus === 'lunas' ? sale.total_amount : 0,
          invoice_no: newInvoiceNo,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Pesanan ${newInvoiceNo} — ${newStatus === 'lunas' ? 'LUNAS' : 'PIUTANG'}`,
        data: updated,
      });
    }

    // Kurir Delivery Flow: deliver → INV- (piutang) or KWI- (cash/paid)
    if (action === 'kurir_deliver') {
      if (!payment_status) {
        return NextResponse.json({ success: false, error: 'payment_status wajib.' }, { status: 400 });
      }

      const methodUpper = (payment_method || '').toUpperCase();
      const isQrisOrTransfer = methodUpper.includes('QRIS') || methodUpper.includes('TRANSFER');
      if (isQrisOrTransfer && (!payment_proof || payment_proof.trim() === '')) {
        return NextResponse.json({
          success: false, error: 'Bukti bayar wajib untuk QRIS/Transfer!'
        }, { status: 400 });
      }

      const newStatus = payment_status === 'lunas' ? 'lunas' : 'piutang';
      const newPrefix = newStatus === 'lunas' ? 'KWI' : 'INV';
      const newInvoiceNo = sale.invoice_no.replace('ORD-', `${newPrefix}-`);

      const updated = await prisma.sale.update({
        where: { id: saleIdParsed },
        data: {
          status: newStatus,
          payment_method: payment_method || 'CASH',
          payment_proof: payment_proof || null,
          amount_paid: newStatus === 'lunas' ? sale.total_amount : 0,
          invoice_no: newInvoiceNo,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Pesanan ${newInvoiceNo} — ${newStatus === 'lunas' ? 'LUNAS' : 'PIUTANG'}`,
        data: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenal.' }, { status: 400 });

  } catch (error: any) {
    console.error('❌ PUT_ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memperbarui.' },
      { status: 500 }
    );
  }
}
