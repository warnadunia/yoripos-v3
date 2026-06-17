// prisma/seed.ts (Full Fixed - Perfect Seeding for POS & Stock Batches)
import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Fungsi enkripsi password yang identik dengan sistem lib/crypto
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hashedPassword}`;
}

async function main() {
  console.log('🌱 Dimulai: Pembersihan data lama & Penyuntikan amunisi stok YoriPOS V3...');

  // 1. CLEAR OLD DATA (Urusan relasi aman karena diurutkan dari detail ke master)
  await prisma.saleDetail.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.stockBatch.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  console.log('🧹 Database dibersihkan secara higienis.');

  // 2. SEED ROLES
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      permissions: ['pos', 'products', 'inventory', 'reports', 'settings'],
    },
  });

  await prisma.role.create({
    data: {
      name: 'cashier',
      permissions: ['pos'],
    },
  });

  // 3. SEED USER SUPER ADMIN
  const plainPassword = 'password123';
  const securePassword = hashPassword(plainPassword);

  const adminUser = await prisma.user.create({
    data: {
      username: 'admin_asayori',
      name: 'Super Admin Asayori',
      password: securePassword,
      role_id: adminRole.id,
    },
  });

  // 4. SEED CATEGORIES
  const catSnack = await prisma.category.create({ data: { name: 'Cemilan / Snack' } });
  const catMakanan = await prisma.category.create({ data: { name: 'Makanan Utama' } });
  const catMinuman = await prisma.category.create({ data: { name: 'Minuman' } });

  console.log('📁 Kategori menu berhasil dipetakan.');

  // 5. DATA MENU & SIMULASI BATCH STOK (FIFO INJECTOR)
  // Kita buat skema tiap produk punya 2 batch stok (Batch Lama & Batch Baru) dengan harga kulakan berbeda!
  const targetProducts = [
    {
      sku: 'SN003',
      name: 'Platter Cireng Bumbu Rujak',
      price_sell: 16000,
      category_id: catSnack.id,
      batches: [
        { batch_no: 'BATCH-CRG-001', price_buy: 7000, qty: 5, daysAgo: 3 }, // Batch lama sisa 5 pcs
        { batch_no: 'BATCH-CRG-002', price_buy: 7500, qty: 20, daysAgo: 0 }, // Batch baru masuk 20 pcs
      ]
    },
    {
      sku: 'KP001',
      name: 'Kopi Susu Gula Aren Asayori',
      price_sell: 22000,
      category_id: catMinuman.id,
      batches: [
        { batch_no: 'BATCH-KSG-01', price_buy: 9000, qty: 10, daysAgo: 4 },
        { batch_no: 'BATCH-KSG-02', price_buy: 9500, qty: 30, daysAgo: 1 },
      ]
    },
    {
      sku: 'KP002',
      name: 'Americano Ice',
      price_sell: 18000,
      category_id: catMinuman.id,
      batches: [
        { batch_no: 'BATCH-AME-01', price_buy: 6000, qty: 15, daysAgo: 2 },
      ]
    },
    {
      sku: 'SN001',
      name: 'Croissant Butter Mentega',
      price_sell: 15000,
      category_id: catSnack.id,
      batches: [
        { batch_no: 'BATCH-CRO-01', price_buy: 6500, qty: 8, daysAgo: 2 },
      ]
    },
    {
      sku: 'MK002',
      name: 'Mie Goreng Dok-Dok Jogja',
      price_sell: 20000,
      category_id: catMakanan.id,
      batches: [
        { batch_no: 'BATCH-MIE-01', price_buy: 8000, qty: 12, daysAgo: 1 },
      ]
    },
    {
      sku: 'MK001',
      name: 'Nasi Goreng Spesial Asayori',
      price_sell: 28000,
      category_id: catMakanan.id,
      batches: [
        { batch_no: 'BATCH-NAS-01', price_buy: 11000, qty: 10, daysAgo: 2 },
      ]
    }
  ];

  for (const item of targetProducts) {
    // Hitung akumulasi total stock dari kumpulan rencana batch
    const totalStockAccumulated = item.batches.reduce((sum, b) => sum + b.qty, 0);

    // Insert Master Produk
    const product = await prisma.product.create({
      data: {
        sku: item.sku,
        name: item.name,
        price_sell: item.price_sell,
        category_id: item.category_id,
        total_stock: totalStockAccumulated,
        unit: 'pcs',
        type: 'produk_jual'
      }
    });

    // Insert Pecahan Batch untuk Produk Ini
    for (const b of item.batches) {
      const receivedDate = new Date();
      receivedDate.setDate(receivedDate.getDate() - b.daysAgo);

      await prisma.stockBatch.create({
        data: {
          product_id: product.id,
          batch_no: b.batch_no,
          price_buy: b.price_buy,
          qty_initial: b.qty,
          qty_remaining: b.qty,
          date_received: receivedDate
        }
      });
    }
  }

  console.log('📦 Produk master beserta jajaran antrean Batch FIFO berhasil disuntikkan!');
  console.log('--------------------------------------------------');
  console.log('✅ DATABASE SEEDING BERHASIL 100%!');
  console.log('--------------------------------------------------');
  console.log(`Gunakan akun berikut untuk masuk ke Command Center:`);
  console.log(`➔ URL      : http://localhost:3000/login`);
  console.log(`➔ Username : ${adminUser.username}`);
  console.log(`➔ Password : ${plainPassword}`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });