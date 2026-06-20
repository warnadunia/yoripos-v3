# 📘 BUKU PUTIH YORIPOSNEX (V3)

**Dokumen:** PRD, ERD, dan Peta Jalan (Roadmap) Eksekusi

**Arsitektur Inti:** Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, TiDB Serverless, Capacitor, JWT Auth.

## 📑 BAGIAN 1: ROADMAP EKSEKUSI (Acuan Versi `v3.STEP.xxx`)

Peta jalan ini adalah urutan kerja kita. Dilarang melompat ke step berikutnya sebelum step saat ini beres dan stabil.

* **STEP 1: Foundation & Auth (`v3.1.xxx`)**
* Inisialisasi Next.js, Prisma, Tailwind, dan koneksi TiDB.
* Setup JWT Authentication & IP/Wi-Fi Lock Security.
* Pembuatan Global Layout & Safe-Area Mobile.


* **STEP 2: Core Master Data (`v3.2.xxx`)**
* RBAC Engine (Role & Permissions).
* Manajemen Users, Kategori, Produk Jual, dan Bahan Baku.
* Manajemen Setting Toko & Pelanggan.


* **STEP 3: Inventory & Costing Engine (`v3.3.xxx`)**
* CRUD Stok Masuk & Batch (HPP) yang digembok RBAC.
* Setup Bill of Materials (Resep Produk).
* Modul *Waste / Stock Adjustment* (Susut/Opname).


* **STEP 4: POS & Shift Control (`v3.4.xxx`)**
* Siklus Shift Kasir (Buka/Tutup Laci, Expected vs Actual Cash).
* Keranjang Belanja, Live HPP Deduct, Pemilihan *Dine-In/Delivery*.
* Sticky Checkout & Split Payment.


* **STEP 5: PSAK Audit Trail & Finance (`v3.5.xxx`)**
* Pipa Mutasi Dokumen: `ORD` ➔ `INV` ➔ `KWI`.
* Modul Pelacakan Cicilan Piutang (Partial Payment).
* Pencatatan OPEX (Beban Operasional).


* **STEP 6: Executive Command Center (`v3.6.xxx`)**
* Dashboard BOSS: Live P&L, Cashflow Heatmap.
* Sistem Budgeting & Target Omset (Pencapaian ala SIXTY).
* Manajemen Aset & Jadwal Maintenance.
* Menu Engineering Matrix & Waste Leakage Alert.


* **STEP 7: PWA, Kitchen & Logistics (`v3.7.xxx`)**
* Build APK/PWA via Capacitor.
* Setup Firebase Cloud Messaging (FCM) untuk Push Notification.
* Antarmuka Kurir (Delivery) dan integrasi Kitchen App.



---

## 📋 BAGIAN 2: PRODUCT REQUIREMENT DOCUMENT (In-Depth PRD)

### A. Aturan Bisnis Super Ketat (Anti-Halusinasi)

1. **No Hard Delete Transactions:** Tabel `Sale` dan `SaleDetail` tidak boleh memiliki fitur hapus. Pembatalan menggunakan metode *Void* (status = `voided`).
2. **Sistem Cicilan (Gantung):** Nota berstatus `piutang` (INV) hanya akan berubah menjadi `lunas` (KWI) JIKA nilai `amount_paid` >= `total_amount`. Selama belum terpenuhi, nota tertahan di modul *Receivables*.
3. **HPP Otomatis FIFO:** Saat POS menyimpan `SaleDetail`, kueri berjalan membaca `StockBatch` dari yang paling tua (`date_received` terlama). Jika 1 pesanan memotong 2 batch berbeda, HPP akan diakumulasi rata-rata tertimbang (*Weighted FIFO*).
4. **Optimalisasi Latency TiDB:** Menggunakan `unstable_cache` Next.js untuk tabel statis (`Category`, `Setting`, `Role`) agar performa dashboard ngebut.
5. **Multi-Language (i18n):** Aplikasi dibungkus *dictionary* translasi (EN/ID). Backend murni menggunakan Bahasa Inggris (*invoice, amount, stock*) agar API konsisten.

---

## 🗄️ BAGIAN 3: ENTITY RELATIONSHIP DIAGRAM (Prisma Schema)

Ini adalah *Source of Truth* struktur *database* kita. Jika saat ngoding ada tabel/kolom yang tidak ada di sini, AI dilarang membuatnya tanpa izin (Mencegah halusinasi).

```prisma
datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "prisma" 
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// ENUMS (Tipe Data Terkunci)
// ==========================================
enum ItemType { produk_jual, bahan_baku }
enum OrderType { dine_in, delivery }
enum DocStatus { proses, terkirim, piutang, lunas, voided }
enum ShiftStatus { open, closed }
enum AdjustType { waste, opname, destruction }
enum AssetStatus { active, maintenance, broken, retired }

// ==========================================
// CORE & MASTER DATA (Step 1 & 2)
// ==========================================
model User {
  id             Int            @id @default(autoincrement())
  username       String         @unique
  password       String
  name           String
  role_id        Int?
  device_token   String?        @db.Text 
  role           Role?          @relation(fields: [role_id], references: [id])
  cashier_shifts CashierShift[]
  @@index([role_id])
}

model Role {
  id          Int      @id @default(autoincrement())
  name        String
  permissions Json     // ex: ["pos", "products", "reports"]
  users       User[]
}

model Category {
  id         Int       @id @default(autoincrement())
  name       String
  created_at DateTime  @default(now())
  products   Product[]
}

model Setting {
  setting_key   String  @id
  setting_value String? @db.Text
}

// ==========================================
// INVENTORY & COSTING (Step 3)
// ==========================================
model Product {
  id             Int               @id @default(autoincrement())
  category_id    Int?
  sku            String            @unique
  category_name  String?           @map("category")
  type           ItemType          @default(produk_jual)
  unit           String            @default("pcs")
  image_url      String?           @db.Text
  name           String
  price_sell     Decimal           @db.Decimal(15, 2)
  total_stock    Int               @default(0)
  created_at     DateTime          @default(now())
  
  category       Category?         @relation(fields: [category_id], references: [id])
  stock_batches  StockBatch[]
  stock_ins      StockIn[]
  sale_details   SaleDetail[]
  adjustments    StockAdjustment[]
  
  as_menu        ProductRecipe[]   @relation("MenuToRecipe")
  as_material    ProductRecipe[]   @relation("MaterialToRecipe")
  @@index([category_id])
}

model ProductRecipe {
  id           Int      @id @default(autoincrement())
  menu_id      Int
  material_id  Int
  qty_required Decimal  @db.Decimal(10, 2)
  
  menu         Product  @relation("MenuToRecipe", fields: [menu_id], references: [id])
  material     Product  @relation("MaterialToRecipe", fields: [material_id], references: [id])
  @@index([menu_id])
  @@index([material_id])
}

model StockBatch {
  id            Int      @id @default(autoincrement())
  product_id    Int
  batch_no      String
  price_buy     Decimal  @db.Decimal(15, 2)
  qty_initial   Int
  qty_remaining Int
  date_received DateTime
  
  product       Product  @relation(fields: [product_id], references: [id], onDelete: Cascade)
  @@index([product_id])
}

model StockIn {
  id         Int      @id @default(autoincrement())
  product_id Int
  qty        Int
  price_buy  Decimal  @db.Decimal(15, 2)
  supplier   String?
  date_in    DateTime @default(now())
  
  product    Product  @relation(fields: [product_id], references: [id], onDelete: Cascade)
  @@index([product_id])
}

model StockAdjustment {
  id            Int        @id @default(autoincrement())
  product_id    Int
  type          AdjustType @default(waste)
  qty_adjusted  Int        
  cost_lost     Decimal    @db.Decimal(15, 2) 
  reason        String?    @db.Text
  adjusted_at   DateTime   @default(now())
  
  product       Product    @relation(fields: [product_id], references: [id])
  @@index([product_id])
}

// ==========================================
// POS, TRANSACTIONS & AUDIT TRAIL (Step 4 & 5)
// ==========================================
model CashierShift {
  id            Int         @id @default(autoincrement())
  user_id       Int
  user_name     String?
  open_time     DateTime    @default(now())
  close_time    DateTime?
  starting_cash Decimal     @default(0) @db.Decimal(15, 2)
  actual_cash   Decimal     @default(0) @db.Decimal(15, 2)
  expected_cash Decimal     @default(0) @db.Decimal(15, 2)
  notes         String?     @db.Text
  status        ShiftStatus @default(open)
  
  user          User        @relation(fields: [user_id], references: [id])
  @@index([user_id])
}

model Customer {
  id         Int      @id @default(autoincrement())
  name       String
  phone      String?
  address    String?  @db.Text
  latitude   String?
  longitude  String?
  created_at DateTime @default(now())
  sales      Sale[]
}

model Sale {
  id             Int         @id @default(autoincrement())
  invoice_no     String      @unique
  reference_no   String?     
  customer_id    Int?
  type           OrderType   @default(dine_in)
  status         DocStatus   @default(lunas)
  shipping_proof String?     @db.Text
  total_amount   Decimal     @db.Decimal(15, 2)
  amount_paid    Decimal     @default(0) @db.Decimal(15, 2)
  payment_method String      @default("CASH")
  payment_proof  String?     @db.MediumText
  created_at     DateTime    @default(now())
  
  customer       Customer?   @relation(fields: [customer_id], references: [id])
  sale_details   SaleDetail[]
  @@index([customer_id])
}

model SaleDetail {
  id                 Int      @id @default(autoincrement())
  sale_id            Int
  product_id         Int
  stock_batch_id     Int      @default(0)
  qty                Int
  price_buy_at_sale  Decimal  @db.Decimal(15, 2)
  price_sell_at_sale Decimal  @db.Decimal(15, 2)
  
  sale               Sale     @relation(fields: [sale_id], references: [id], onDelete: Cascade)
  product            Product  @relation(fields: [product_id], references: [id])
  @@index([sale_id])
  @@index([product_id])
}

// ==========================================
// EXECUTIVE COMMAND CENTER (Step 6)
// ==========================================
model Expense {
  id           Int      @id @default(autoincrement())
  expense_date DateTime @db.Date
  category     String
  amount       Decimal  @db.Decimal(15, 2)
  description  String?  @db.Text
  asset_id     Int?     
  
  asset        Asset?   @relation(fields: [asset_id], references: [id])
  created_at   DateTime @default(now())
  @@index([asset_id])
}

model BudgetGoal {
  id            Int      @id @default(autoincrement())
  period_month  Int      
  period_year   Int      
  target_type   String   // "revenue" atau "expense_cap"
  category_name String   
  target_amount Decimal  @db.Decimal(15, 2)
  created_at    DateTime @default(now())
}

model Asset {
  id              Int         @id @default(autoincrement())
  name            String
  code            String      @unique 
  purchase_date   DateTime    @db.Date
  purchase_cost   Decimal     @db.Decimal(15, 2)
  monthly_deprec  Decimal     @db.Decimal(15, 2) 
  next_service    DateTime?   @db.Date 
  status          AssetStatus @default(active) 
  created_at      DateTime    @default(now())
  
  expenses        Expense[]
}

model SystemLog {
  id          Int      @id @default(autoincrement())
  level       String
  source      String
  message     String   @db.Text
  stack_trace String?  @db.Text
  created_at  DateTime @default(now())
}

```

Rombak UI Tombol Checkout (page.tsx): Tombol "Proses Struk Penjualan" di bawah keranjang nggak boleh langsung tembak API. Tombol itu harus ngebuka Modal/Popup estetik yang isinya 4 menu utama:

📝 Pesanan (Simpan nota ngutang/pending -> Pilih: Ambil / Antar)

💰 Lunas (Langsung bayar lunas -> Pilih: Tunai / QRIS / Transfer)

🔗 Gabung Pesanan (Buka list meja/nota gantung buat di-merge)

📒 Piutang (Masuk modul tagihan/SIXTY)

Penyesuaian Skema API (route.ts): API kita yang sekarang berasumsi bahwa semua transaksi yang masuk itu selalu status: 'lunas' dan amount_paid: grandTotal. Kita harus rombak API-nya biar bisa nerima parameter payment_status (lunas/pending/piutang) dan payment_method (CASH/QRIS/TRANSFER).


---

### **Instruksi Final Kepada Boss:**

Silakan *Copy* keseluruhan **Buku Putih** ini.

Lalu buat Chatroom Baru dengan Judul:
👉 **`Project YoriPOS V3 - Setup & Prisma Schema`**

Tempel buku putih ini di pesan pertama lu, dan perintahkan gue: *"Mulai eksekusi STEP 1 sesuai Blueprint!"*. Kita hajar sistem ERP ini secara terstruktur, rapi, dan sistematis bosku! Ditunggu di sebelah! 🚀🔥😎