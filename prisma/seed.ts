// prisma/seed.ts (Full Fixed - Menyesuaikan Skema Asli YoriPOS V3)
import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hashedPassword}`;
}

async function main() {
  console.log('🌱 Dimulai: Mengisi data awal (Seeding) YoriPOS V3...');

  // 1. BERSIHKAN DATA LAMA (Urutan sesuai constraint foreign key agar tidak crash)
  await prisma.productRecipe.deleteMany({});
  await prisma.stockBatch.deleteMany({});
  await prisma.stockIn.deleteMany({});
  await prisma.stockAdjustment.deleteMany({});
  await prisma.saleDetail.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.cashierShift.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  console.log('🗑️  Data lama berhasil dibersihkan dari database.');

  // 2. BUAT ROLE DEFAULT (RBAC System)
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

  // 3. BUAT AKUN UTAMA (Super Admin)
  const securePassword = hashPassword('password123');
  await prisma.user.create({
    data: {
      username: 'admin_asayori',
      name: 'Super Admin Asayori',
      password: securePassword,
      role_id: adminRole.id,
    },
  });

  console.log('👤 Akun Super Admin berhasil dibuat.');

  // 4. BUAT DUMMY KATEGORI
  const catMakanan = await prisma.category.create({ data: { name: 'Makanan Utama' } });
  const catMinuman = await prisma.category.create({ data: { name: 'Minuman Kopi' } });
  const catSnack = await prisma.category.create({ data: { name: 'Cemilan / Snack' } });
  const catNonKopi = await prisma.category.create({ data: { name: 'Non-Kopi' } });

  console.log('📂 Kategori produk kasir berhasil disuntikkan.');

  // 5. BUAT DUMMY PRODUK SIAP JUAL (Sesuai Struktur Model Product Anda!)
  const productsData = [
    // Minuman Kopi
    { name: 'Kopi Susu Gula Aren Asayori', sku: 'KP001', price: 22000, category_id: catMinuman.id },
    { name: 'Americano Ice', sku: 'KP002', price: 18000, category_id: catMinuman.id },
    { name: 'Cafe Latte Hot', sku: 'KP003', price: 25000, category_id: catMinuman.id },
    
    // Non-Kopi
    { name: 'Matcha Latte Premium', sku: 'NK001', price: 24000, category_id: catNonKopi.id },
    { name: 'Choco Signature', sku: 'NK002', price: 23000, category_id: catNonKopi.id },
    
    // Makanan Utama
    { name: 'Nasi Goreng Spesial Asayori', sku: 'MK001', price: 28000, category_id: catMakanan.id },
    { name: 'Mie Goreng Dok-Dok Jogja', sku: 'MK002', price: 20000, category_id: catMakanan.id },
    
    // Cemilan
    { name: 'Croissant Butter Mentega', sku: 'SN001', price: 15000, category_id: catSnack.id },
    { name: 'Kentang Goreng Crispy', sku: 'SN002', price: 14000, category_id: catSnack.id },
    { name: 'Platter Cireng Bumbu Rujak', sku: 'SN003', price: 16000, category_id: catSnack.id },
  ];

  for (const item of productsData) {
    await prisma.product.create({
      data: {
        sku: item.sku,               // Unique Key Utama 
        name: item.name,             // Nama Produk 
        type: 'produk_jual',         // Sesuai Enum ItemType di schema 
        price_sell: item.price,      // Wajib diisi (Decimal) 
        category_id: item.category_id,
        unit: 'pcs',                 // Default value 
        total_stock: 0               // Default value 
      },
    });
  }

  console.log(`📦 Berhasil memasukkan ${productsData.length} item dummy produk siap jual.`);
  console.log('--------------------------------------------------');
  console.log('✅ DATABASE SEEDING YORIPOS V3 SUKSES TOTAL 100%!');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Gagal melakukan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });