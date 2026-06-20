# Implementation Plan - Revamp POS Checkout & Store Settings

This plan describes the frontend and backend modifications to support custom payment flows (Cash, QRIS, Bank Transfer) in the POS module, courier workflow improvements, and store configuration settings. This implementation integrates and delivers features from several steps of the Execution Roadmap.

---

## Roadmap Alignment (v3.STEP.xxx)

Our work directly implements and addresses key requirements from the following steps:
1. **STEP 1 & 2: Foundation, Auth & Core Master Data (`v3.1.xxx` - `v3.2.xxx`)**
   - **Store Settings**: Implement dynamic configuration inputs for static QRIS providers, bank account lists, and WhatsApp message templates.
   - **Customer Records**: Enforce linking every transaction to a `Customer` database record (defaulting to `"Pelanggan Setia"` if no customer info is supplied).
2. **STEP 4: POS & Shift Control (`v3.4.xxx`)**
   - **Checkout Flow Revamp**: Convert the "Proses Struk Penjualan" button into a 4-option modal: *Pesanan (Pending/Antar)*, *Lunas*, *Gabung Pesanan*, and *Piutang*.
   - **Fulfillment & Payment Methods**: Enable dynamic checkout using `CASH`, `QRIS`, or `TRANSFER` methods. For delivery (`DIKIRIM`), capture delivery phone, address, and coordinates (latitude & longitude).
3. **STEP 5: PSAK Audit Trail & Finance (`v3.5.xxx`)**
   - **Document lifecycle (ORD ➔ INV ➔ KWI)**: Implement invoice prefix tracking. Delivery orders start as `ORD-...` (status: `proses`), converting to `INV-...` (status: `piutang` if unpaid) or `KWI-...` (status: `lunas` if fully paid).
   - **Mandatory Payment Proof**: Store base64 upload snapshots in the `payment_proof` field for all non-cash completed transactions.
4. **STEP 7: Kitchen & Logistics (`v3.7.xxx`)**
   - **Courier Delivery App Interface**: A dedicated operator view displaying active delivery orders with a direct WhatsApp message shortcut (using customized store templates) and direct Google Maps coordinate-based route navigation.

---

## User Review Required

> [!IMPORTANT]
> - **Mandatory Customer Records**: Every transaction must link to a `Customer`. If no name is provided, the transaction defaults to a pre-defined customer: `"Pelanggan Setia"`.
> - **Delivery Coordinates (Latitude/Longitude)**: When "Kirim Kurir" (Delivery) is selected, fields for Phone Number, Delivery Address, Latitude, and Longitude are required to enable accurate courier navigation.
> - **Document Lifecycle Transition**:
>   - Pending delivery orders start as **ORD** (status: `proses` or `terkirim`).
>   - Once delivered by the Courier, if marked as unpaid (due to credit/partial), the document evolves into an Invoice (**INV**, status: `piutang`).
>   - If paid (Cash/QRIS/Transfer), it prints a receipt (**KWI**, status: `lunas`).
> - **Payment Proof Requirement**: Uploading a photo proof (base64 string) is **mandatory** for any QRIS or Transfer payments, both at POS Checkout and Courier completion.
> - **Public Receipt Access**: A public digital receipt page will be accessible at `/struk/[invoice_no]`.
> - **Customizable WhatsApp Message Template**: Added a template input in **Setting Toko** supporting placeholders: `[customer_name]`, `[invoice_no]`, `[total_amount]`, and `[receipt_url]`.
> - **Aesthetics (Shadcn/UI & Dark Mode)**:
>   - UI redesigned to use a **Shadcn/UI design language** (zinc/slate neutral colors, borders, shadows, minimalist buttons).
>   - A **Dark Mode** toggle will be integrated into the App Header, controlling a class-based dark toggle state. All components will be styled with `dark:...` variant classes.

---

## Proposed Changes

We will introduce a new setting API endpoint, integrate bank and QRIS configurations inside the checkout modal, revamp the courier screen, construct the Store Settings dashboard view, and build a public digital receipt route.

### 1. API Route Settings & Upgrades

#### [NEW] [route.ts](file:///c:/__D__Data/Projects/yoripos-v3/src/app/api/settings/route.ts)
- Implement `GET` to read all store settings (returns keys: `qris_providers`, `bank_accounts`, `wa_template`).
- Implement `POST` to upsert store settings.

#### [MODIFY] [route.ts](file:///c:/__D__Data/Projects/yoripos-v3/src/app/api/checkout/route.ts)
- Update `POST` action to enforce:
  - If `customer_name` is omitted, default/fallback to `"Pelanggan Setia"`.
  - Check if the target `Customer` exists by name. If not, create them. If phone, address, latitude, or longitude are provided in the payload, update or create the customer record with those details.
  - Store payment proofs (`payment_proof` as a base64 image string) if the transaction is QRIS/Transfer.
  - Ensure the invoice prefix behaves according to transaction type:
    - Paid instantly / Cashier Checkout: Prefix starts as `KWI-...` (Receipt) if paid, or `INV-...` (Invoice) if Piutang.
    - Delivery Order: Starts as `ORD-...` (Order / status: `proses`).
- Add a new `PUT` method `/api/checkout` or `/api/checkout/[id]` to handle courier delivery completion:
  - Updates order status from `proses` to `terkirim` (or `lunas` / `piutang`).
  - Sets `payment_method`, `payment_proof` (mandatory for QRIS/Transfer), and final status (`lunas` or `piutang`).
  - Automatically transforms the invoice number prefix from `ORD-...` to `INV-...` (if Piutang) or `KWI-...` (if Lunas).

### 2. Public Digital Receipt Screen

#### [NEW] [page.tsx](file:///c:/__D__Data/Projects/yoripos-v3/src/app/struk/%5Binvoice_no%5D/page.tsx)
- Create a dynamic public route `/struk/[invoice_no]` that fetches and displays the sale transaction details.
- Show a beautifully formatted digital receipt (styled like a clean thermal paper invoice) with:
  - Header (Store name, receipt number, date/time, and status badge `ORD`/`INV`/`KWI`).
  - Itemized table of products, quantities, prices, and subtotal.
  - Payment method, payment proof status, and coordinates of delivery address (if applicable).
  - Full support for light and dark modes matching Shadcn/UI palette.

### 3. POS Component UI/UX Revamp

#### [MODIFY] [page.tsx](file:///c:/__D__Data/Projects/yoripos-v3/src/app/pos/page.tsx)
- **Settings & Data State**:
  - Load `qrisProviders`, `bankAccounts`, and `waTemplate` (default: `"Halo [customer_name], berikut link struk belanja [invoice_no] Anda senilai [total_amount]: [receipt_url]"`) on mount.
  - Maintain coordinate states `latitude`, `longitude`, `phone`, and `address` for delivery inputs.
  - Track `isDarkMode` state and toggles.
- **Checkout Modal UI**:
  - Dynamically display **Phone Number**, **Delivery Address**, **Latitude**, and **Longitude** inputs in the modal if the user selects "Kirim Kurir" (`DIKIRIM`).
  - **Lunas Step**: If payment method is QRIS or Transfer, display a file upload interface (or simulated camera snapshot) to upload the **Bukti Pembayaran** (mandatory before submission).
- **Courier View (`operatorRole === 'KURIR'`)**:
  - Refetch active delivery orders (`OrderType: delivery` and `status: proses`).
  - Show invoice cards with format: `[Invoice No (ORD-xxx)] [Total Amount]`
  - Display Customer Name, Phone (with clickable WhatsApp direct URL `https://wa.me/[phone]`), Address, and a Google Maps navigation button using coordinates `https://www.google.com/maps/search/?api=1&query=[lat],[lng]`.
  - Add a **Selesaikan Pengiriman** (Complete Delivery) action button:
    - Opens a dialog to select final payment: **Lunas** (Cash / QRIS / Transfer) or **Piutang**.
    - If QRIS or Transfer is chosen, mandate uploading/taking a photo of the receipt/screen.
    - Trigger PUT update to transition the document to `INV` or `KWI`.
- **Business Mode Sidebar**:
  - Add the **Setting Toko** tab.
  - Design forms to configure QRIS providers, Bank Account numbers, and the WhatsApp direct message template, saving to `/api/settings`.
- **Shadcn UI & Dark Mode Layout**:
  - Structure wrapper styles to support zinc/slate styling (`bg-background text-foreground`).
  - Dark mode button switcher in header.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify clean build and TypeScript compliance.

### Manual Verification
1. Toggle Dark Mode and verify that all POS pages, popups, and the digital receipt render correctly in dark mode.
2. Open settings dashboard, input QRIS, Bank details, and WA template, click save.
3. Open POS, checkout with "Kirim Kurir", provide address, lat/long, and click save.
4. Check database to ensure Customer "Pelanggan Setia" or custom customer is correctly saved with coordinates.
5. Switch to Courier role. Verify order appears with:
   - WA button opening `wa.me` in a new window with formatted message containing the dynamic `/struk/[invoice_no]` link.
   - Google Maps button pointing to the lat/long coordinates.
6. Complete delivery, select Transfer, upload a mock base64 image proof, and verify status shifts to `lunas` (prefix transitions to `KWI-...`).
