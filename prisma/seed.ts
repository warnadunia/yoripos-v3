// prisma/seed.ts (Full Rewrite — Konsep Resep & HPP dari Bahan Baku)
import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hashedPassword}`;
}

async function main() {
  console.log('🌱 YoriPOS V3 — Seed: Konsep Resep & Bahan Baku');
  console.log('   Membersihkan data lama...');

  await prisma.productRecipe.deleteMany({});
  await prisma.saleDetail.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.stockBatch.deleteMany({});
  await prisma.stockIn.deleteMany({});
  await prisma.stockAdjustment.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.customer.deleteMany({});

  console.log('✅ Database bersih.');

  const adminRole = await prisma.role.create({
    data: { name: 'admin', permissions: ['pos', 'products', 'inventory', 'reports', 'settings'] },
  });
  await prisma.role.create({ data: { name: 'cashier', permissions: ['pos'] } });

  const plainPassword = 'password123';
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin_asayori',
      name: 'Super Admin Asayori',
      password: hashPassword(plainPassword),
      role_id: adminRole.id,
    },
  });

  const catBahan   = await prisma.category.create({ data: { name: 'Bahan Baku' } });
  const catSnack   = await prisma.category.create({ data: { name: 'Cemilan / Snack' } });
  const catMakanan = await prisma.category.create({ data: { name: 'Makanan Utama' } });
  const catMinuman = await prisma.category.create({ data: { name: 'Minuman' } });

  const settings = [
    { key: 'qris_providers', value: 'DANA, GoPay, ShopeePay, QRIS Standard' },
    { key: 'qris_image', value: '' },
    { key: 'bank_accounts', value: 'BCA - 1234567890 - Yori DevHouse\nMandiri - 9876543210 - Yori DevHouse' },
    { key: 'wa_template', value: 'Halo [customer_name], berikut link struk belanja [invoice_no] Anda senilai [total_amount]: [receipt_url]' },
    { key: 'store_name', value: 'YoriPOS V3 — Warung Asayori' },
    { key: 'store_logo', value: '' },
    { key: 'receipt_design', value: 'mono' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { setting_key: s.key },
      create: { setting_key: s.key, setting_value: s.value },
      update: {},
    });
  }
  console.log('⚙️ Pengaturan toko tersimpan.');

  const bahanBaku = [
    { sku: 'BB-KOPI',  name: 'Kopi Bubuk Arabika',  unit: 'gram',   price_sell: 0,    category_id: catBahan.id, batch: { batch_no: 'BATCH-KOPI-01', price_buy: 100000, qty: 1000 } },
    { sku: 'BB-SUSU',  name: 'Susu Cair UHT',        unit: 'ml',    price_sell: 0,    category_id: catBahan.id, batch: { batch_no: 'BATCH-SUSU-01', price_buy: 25000, qty: 1000 } },
    { sku: 'BB-GULA',  name: 'Gula Aren Cair',       unit: 'ml',    price_sell: 0,    category_id: catBahan.id, batch: { batch_no: 'BATCH-GULA-01', price_buy: 30000, qty: 1000 } },
    { sku: 'BB-TELUR', name: 'Telur Ayam Negeri',     unit: 'butir', price_sell: 0,    category_id: catBahan.id, batch: { batch_no: 'BATCH-TLR-01', price_buy: 75000, qty: 30 } },
    { sku: 'BB-TERIGU',name: 'Tepung Terigu Protein', unit: 'gram',  price_sell: 0,    category_id: catBahan.id, batch: { batch_no: 'BATCH-TRG-01', price_buy: 15000, qty: 1000 } },
    { sku: 'BB-MENTE', name: 'Mentega Butter',        unit: 'gram',  price_sell: 0,    category_id: catBahan.id, batch: { batch_no: 'BATCH-MTE-01', price_buy: 25000, qty: 500 } },
    { sku: 'BB-CIRENG',name: 'Cireng Frozen',         unit: 'pcs',   price_sell: 0,    category_id: catBahan.id, batch: { batch_no: 'BATCH-CRG-01', price_buy: 100000, qty: 50 } },
    { sku: 'BB-MIE',   name: 'Mie Telur Cap 3 Ayam',  unit: 'pcs',   price_sell: 0,    category_id: catBahan.id, batch: { batch_no: 'BATCH-MIE-01', price_buy: 150000, qty: 30 } },
    { sku: 'BB-NASI',  name: 'Nasi Putih Matang',     unit: 'gram',  price_sell: 0,    category_id: catBahan.id, batch: { batch_no: 'BATCH-NSI-01', price_buy: 30000, qty: 2000 } },
    { sku: 'BB-MIKA',  name: 'Mika Pack 10x10',       unit: 'pcs',   price_sell: 0,    category_id: catBahan.id, batch: { batch_no: 'BATCH-MIKA-01', price_buy: 30000, qty: 20 } },
    { sku: 'BB-LABEL', name: 'Stiker Label',          unit: 'pcs',   price_sell: 0,    category_id: catBahan.id, batch: { batch_no: 'BATCH-LBL-01', price_buy: 25000, qty: 50 } },
  ];

  const bahanMap: Record<string, any> = {};
  for (const b of bahanBaku) {
    const product = await prisma.product.create({
      data: {
        sku: b.sku, name: b.name, type: 'bahan_baku', unit: b.unit,
        price_sell: b.price_sell, category_id: b.category_id,
        total_stock: b.batch.qty,
      },
    });
    await prisma.stockBatch.create({
      data: {
        product_id: product.id, batch_no: b.batch.batch_no,
        price_buy: b.batch.price_buy, qty_initial: b.batch.qty,
        qty_remaining: b.batch.qty, date_received: new Date(),
      },
    });
    bahanMap[b.sku] = product;
  }
  console.log('📦 ' + bahanBaku.length + ' bahan baku + stok batch tersimpan.');

  interface MenuDef {
    sku: string; name: string; price_sell: number; category_id: number;
    image_url?: string;
    recipe: { sku: string; qty: number }[];
  }

  const menus: MenuDef[] = [
    {
      sku: 'KP001', name: 'Kopi Susu Gula Aren', price_sell: 22000, category_id: catMinuman.id,
      recipe: [
        { sku: 'BB-KOPI',  qty: 4 },
        { sku: 'BB-SUSU',  qty: 50 },
        { sku: 'BB-GULA',  qty: 15 },
      ],
    },
    {
      sku: 'KP002', name: 'Americano Ice', price_sell: 18000, category_id: catMinuman.id,
      recipe: [
        { sku: 'BB-KOPI', qty: 4 },
      ],
    },
    {
      sku: 'MK001', name: 'Nasi Goreng Spesial', price_sell: 28000, category_id: catMakanan.id,
      recipe: [
        { sku: 'BB-NASI',  qty: 200 },
        { sku: 'BB-TELUR', qty: 2 },
      ],
    },
    {
      sku: 'MK002', name: 'Mie Goreng Dok-Dok', price_sell: 20000, category_id: catMakanan.id,
      recipe: [
        { sku: 'BB-MIE',   qty: 1 },
        { sku: 'BB-TELUR', qty: 1 },
      ],
    },
    {
      sku: 'SN001', name: 'Croissant Butter', price_sell: 15000, category_id: catSnack.id,
      recipe: [
        { sku: 'BB-TERIGU', qty: 100 },
        { sku: 'BB-MENTE',  qty: 50 },
      ],
    },
    {
      sku: 'SN002', name: 'Platter Cireng Bumbu Rujak', price_sell: 16000, category_id: catSnack.id,
      recipe: [
        { sku: 'BB-CIRENG', qty: 5 },
      ],
    },
    {
      sku: 'SN003', name: 'Telur Herbal Pack 10', price_sell: 35000, category_id: catSnack.id,
      recipe: [
        { sku: 'BB-TELUR', qty: 10 },
        { sku: 'BB-MIKA',  qty: 1 },
        { sku: 'BB-LABEL', qty: 1 },
      ],
    },
  ];

  for (const m of menus) {
    const product = await prisma.product.create({
      data: {
        sku: m.sku, name: m.name, type: 'produk_jual', unit: 'pcs',
        price_sell: m.price_sell, category_id: m.category_id,
        total_stock: 0, image_url: m.image_url || null,
      },
    });
    for (const r of m.recipe) {
      const material = bahanMap[r.sku];
      await prisma.productRecipe.create({
        data: { menu_id: product.id, material_id: material.id, qty_required: r.qty },
      });
    }
  }
  console.log('🍽️ ' + menus.length + ' menu dengan resep tersimpan.');

  await prisma.customer.create({ data: { name: 'Pelanggan Setia', phone: '081234567890', address: 'Jl. Anggrek No. 1, Yogyakarta' } });
  await prisma.customer.create({ data: { name: 'Budi Santoso', phone: '087654321098', address: 'Jl. Melati No. 5, Sleman' } });
  console.log('👥 Data konsumen contoh tersimpan.');

  console.log('');
  console.log('══════════════════════════════════════');
  console.log('✅ SEEDING BERHASIL!');
  console.log('══════════════════════════════════════');
  console.log('');
 
  console.log('🔐 Login: admin_asayori / password123');
  console.log('══════════════════════════════════════');
}

main()
  .catch((e) => { console.error('❌ Seeding Gagal:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
