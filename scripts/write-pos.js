const fs = require('fs');
const path = require('path');
const targetPath = path.resolve(__dirname, '../src/app/pos/page.tsx');
const content = `'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
type ViewMode = 'OPERATOR' | 'BISNIS';
type OperatorRole = 'KASIR' | 'DAPUR' | 'KURIR';
type MobileTab = 'KATALOG' | 'KERANJANG';
type FulfillmentMethod = 'AMBIL_TOKO' | 'DIKIRIM';
type BizTab = 'RINGKASAN' | 'STOK' | 'PIUTANG' | 'PENGATURAN';
interface Category { id: number; name: string; }
interface Product { id: number; sku: string; name: string; price_sell: string | number; category_id: number; category?: { id: number; name: string }; }
interface CartItem { product: Product; quantity: number; }
interface StoreSettings { qris_providers: string; bank_accounts: string; wa_template: string; [key: string]: string; }
const DEFAULT_WA_TEMPLATE = 'Halo [customer_name], berikut link struk belanja [invoice_no] Anda senilai [total_amount]: [receipt_url]';
export default function PosPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('OPERATOR');
  const [operatorRole, setOperatorRole] = useState<OperatorRole>('KASIR');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('AMBIL_TOKO');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>('KATALOG');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bizTab, setBizTab] = useState<BizTab>('RINGKASAN');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({ qris_providers: '', bank_accounts: '', wa_template: DEFAULT_WA_TEMPLATE });
  const [settingsForm, setSettingsForm] = useState({ ...storeSettings });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'MENU' | 'PESANAN' | 'LUNAS' | 'GABUNG' | 'PIUTANG'>('MENU');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerLatitude, setCustomerLatitude] = useState('');
  const [customerLongitude, setCustomerLongitude] = useState('');
  const [selectedFulfillment, setSelectedFulfillment] = useState<FulfillmentMethod>('AMBIL_TOKO');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
  const [paymentProofBase64, setPaymentProofBase64] = useState('');
  const [paymentProofFileName, setPaymentProofFileName] = useState('');
  const [pendingSales, setPendingSales] = useState<any[]>([]);
  const [selectedPendingSaleId, setSelectedPendingSaleId] = useState<number | null>(null);
  const [isLoadingPendingSales, setIsLoadingPendingSales] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completingSaleId, setCompletingSaleId] = useState<number | null>(null);
  const [completePaymentMethod, setCompletePaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
  const [completePaymentStatus, setCompletePaymentStatus] = useState<'lunas' | 'piutang'>('lunas');
  const [completePaymentProof, setCompletePaymentProof] = useState('');
  const [completePaymentProofName, setCompletePaymentProofName] = useState('');
  const [deliveryOrders, setDeliveryOrders] = useState<any[]>([]);
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completeFileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const saved = localStorage.getItem('yoripos_dark_mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(saved !== null ? saved === 'true' : prefersDark);
    setHasMounted(true);
  }, []);
  useEffect(() => {
    if (!hasMounted) return;
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('yoripos_dark_mode', String(isDarkMode));
  }, [isDarkMode, hasMounted]);
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        const merged: StoreSettings = { qris_providers: data.data.qris_providers || '', bank_accounts: data.data.bank_accounts || '', wa_template: data.data.wa_template || DEFAULT_WA_TEMPLATE };
        setStoreSettings(merged); setSettingsForm(merged);
      }
    } catch { /* silent */ }
  }, []);
  async function loadInitialData() {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([fetch('/api/categories'), fetch('/api/products')]);
      const catData = await catRes.json();
      const prodData = await prodRes.json();
      if (catData.success) setCategories(catData.data);
      if (prodData.success) setProducts(prodData.data);
    } catch (error) { console.error('Gagal memuat data POS:', error); } finally { setLoading(false); }
  }
  useEffect(() => { if (hasMounted) { loadInitialData(); loadSettings(); } }, [hasMounted, loadSettings]);
  // Filter Products
  useEffect(() => {
    if (!hasMounted) return;
    async function filterProducts() {
      let url = '/api/products?';
      if (selectedCategory) url += 'category_id=' + selectedCategory + '&';
      if (searchQuery) url += 'search=' + encodeURIComponent(searchQuery);
      try { const res = await fetch(url); const result = await res.json(); if (result.success) setProducts(result.data); } catch { /* silent */ }
    }
    const delay = setTimeout(filterProducts, 300);
    return () => clearTimeout(delay);
  }, [selectedCategory, searchQuery, hasMounted]);
  const fetchDeliveryOrders = useCallback(async () => {
    try { setIsLoadingDelivery(true); const res = await fetch('/api/checkout'); const result = await res.json(); if (result.success) setDeliveryOrders(result.data); } catch { /* silent */ }
    finally { setIsLoadingDelivery(false); }
  }, []);
  const addToCart = (product: Product) => {
    setCart(prev => { const existing = prev.find(i => i.product.id === product.id); if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i); return [...prev, { product, quantity: 1 }]; });
  };
  const updateQuantity = (productId: number, amount: number) => { setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + amount } : i).filter(i => i.quantity > 0)); };
  const calculateTotal = () => cart.reduce((t, i) => t + Number(i.product.price_sell) * i.quantity, 0);
  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);
  const calculateChange = () => { const total = calculateTotal(); const received = Number(cashReceived); if (!received || received < total) return 0; return received - total; };
  const handlePaymentProofFile = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setPaymentProofFileName(file.name); const reader = new FileReader(); reader.onload = () => setPaymentProofBase64(reader.result as string); reader.readAsDataURL(file); };
  const handleCompleteProofFile = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setCompletePaymentProofName(file.name); const reader = new FileReader(); reader.onload = () => setCompletePaymentProof(reader.result as string); reader.readAsDataURL(file); };
  const fetchPendingSales = async () => {
    try { setIsLoadingPendingSales(true); const res = await fetch('/api/checkout'); const result = await res.json(); if (result.success) setPendingSales(result.data); } catch { /* silent */ }
    finally { setIsLoadingPendingSales(false); }
  };
  const handleCheckoutSubmit = async (type: 'PESANAN' | 'LUNAS' | 'GABUNG' | 'PIUTANG') => {
    if (cart.length === 0 || isSubmitting) return;
    if (type === 'PIUTANG' && (!customerName || !customerName.trim())) { alert('Nama pelanggan wajib diisi untuk Piutang!'); return; }
    if (type === 'GABUNG' && !selectedPendingSaleId) { alert('Pilih pesanan gantung!'); return; }
    if (type === 'LUNAS' && (selectedPaymentMethod === 'QRIS' || selectedPaymentMethod === 'TRANSFER') && !paymentProofBase64) { alert('Bukti pembayaran wajib diunggah!'); return; }
    try {
      setIsSubmitting(true);
      const payload: any = { cart };
      if (type === 'PESANAN') {
        payload.payment_status = 'pending'; payload.fulfillment_method = selectedFulfillment;
        if (customerName.trim()) payload.customer_name = customerName;
        if (selectedFulfillment === 'DIKIRIM') {
          if (customerPhone.trim()) payload.customer_phone = customerPhone;
          if (customerAddress.trim()) payload.customer_address = customerAddress;
          if (customerLatitude.trim()) payload.customer_latitude = customerLatitude;
          if (customerLongitude.trim()) payload.customer_longitude = customerLongitude;
        }
      } else if (type === 'LUNAS') {
        payload.payment_status = 'lunas'; payload.payment_method = selectedPaymentMethod; payload.fulfillment_method = selectedFulfillment;
        if (customerName.trim()) payload.customer_name = customerName;
        if ((selectedPaymentMethod === 'QRIS' || selectedPaymentMethod === 'TRANSFER') && paymentProofBase64) payload.payment_proof = paymentProofBase64;
        if (selectedFulfillment === 'DIKIRIM') {
          if (customerPhone.trim()) payload.customer_phone = customerPhone;
          if (customerAddress.trim()) payload.customer_address = customerAddress;
          if (customerLatitude.trim()) payload.customer_latitude = customerLatitude;
          if (customerLongitude.trim()) payload.customer_longitude = customerLongitude;
        }
      } else if (type === 'GABUNG') { payload.merge_sale_id = selectedPendingSaleId; }
      else if (type === 'PIUTANG') { payload.payment_status = 'piutang'; payload.customer_name = customerName; }
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (res.ok && result.success) {
        let msg = '';
        if (type === 'PESANAN') msg = 'NOTA GANTUNG! Invoice: ' + result.data.invoice_no;
        else if (type === 'LUNAS') msg = 'LUNAS! Invoice: ' + result.data.invoice_no;
        else if (type === 'GABUNG') msg = 'DIGABUNGKAN!';
        else msg = 'PIUTANG TERCATAT!';
        alert(msg);
        setCart([]); setIsCheckoutModalOpen(false); setCheckoutStep('MENU');
        setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); setCustomerLatitude(''); setCustomerLongitude('');
        setCashReceived(''); setPaymentProofBase64(''); setPaymentProofFileName('');
        setSelectedPendingSaleId(null); setMobileActiveTab('KATALOG');
        await loadInitialData();
      } else { alert('Gagal: ' + result.error); }
    } catch (error) { console.error(error); alert('Kendala jaringan.'); }
    finally { setIsSubmitting(false); }
  };
  const handleCompleteDelivery = async () => {
    if (!completingSaleId) return;
    if ((completePaymentMethod === 'QRIS' || completePaymentMethod === 'TRANSFER') && !completePaymentProof) { alert('Bukti bayar wajib!'); return; }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/checkout', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_id: completingSaleId, payment_status: completePaymentStatus, payment_method: completePaymentMethod, payment_proof: (completePaymentMethod === 'QRIS' || completePaymentMethod === 'TRANSFER') ? completePaymentProof : null }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert(result.message); setIsCompleteDialogOpen(false); setCompletingSaleId(null);
        setCompletePaymentProof(''); setCompletePaymentProofName('');
        await fetchDeliveryOrders();
      } else { alert('Gagal: ' + result.error); }
    } catch (error) { console.error(error); alert('Gagal.'); }
    finally { setIsSubmitting(false); }
  };
  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settingsForm) });
      const result = await res.json();
      if (result.success) { setStoreSettings({ ...settingsForm }); setSettingsDirty(false); alert('Tersimpan!'); }
      else { alert('Gagal: ' + result.error); }
    } catch { alert('Gagal menyimpan.'); }
    finally { setIsSavingSettings(false); }
  };
  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  const buildWaUrl = (phone: string, invoiceNo: string, totalAmount: number, customerName: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const receiptUrl = baseUrl + '/struk/' + invoiceNo;
    const template = storeSettings.wa_template || DEFAULT_WA_TEMPLATE;
    const msg = template.replace('[customer_name]', customerName).replace('[invoice_no]', invoiceNo).replace('[total_amount]', formatRupiah(totalAmount)).replace('[receipt_url]', receiptUrl);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return 'https://wa.me/' + (cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone.replace(/^0/, '')) + '?text=' + encodeURIComponent(msg);
  };
  if (!hasMounted) { return <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950"><p className="text-xs text-stone-400 animate-pulse">Menyiapkan...</p></div>; }
  return (
    <div className="min-h-screen flex flex-col overflow-hidden h-screen select-none transition-colors duration-200 bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 font-sans">
      <header className="flex items-center justify-between sticky top-0 z-40 shrink-0 px-5 py-2.5 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="font-mono text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-lg bg-stone-950 dark:bg-stone-800 text-stone-50 shadow-inner">YoriPOS <span className="text-emerald-500">V3</span></div>
          {viewMode === 'OPERATOR' && (
            <div className="relative">
              <select value={operatorRole} onChange={e => { setOperatorRole(e.target.value as OperatorRole); setMobileActiveTab('KATALOG'); }}
                className="appearance-none text-xs font-semibold cursor-pointer rounded-xl pl-3 pr-8 py-1.5 border focus:outline-none transition bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400">
                <option value="KASIR">Kasir</option><option value="DAPUR">Dapur</option><option value="KURIR">Kurir</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-stone-400">▼</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} title={isDarkMode ? 'Terang' : 'Gelap'}
            className="p-2 rounded-xl text-sm transition bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">{isDarkMode ? '☀️' : '🌙'}</button>
          <div className="flex items-center p-1 rounded-xl border shadow-inner bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700/40">
            <button onClick={() => setViewMode('OPERATOR')} className={'px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ' + (viewMode === 'OPERATOR' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300')}>Operator</button>
            <button onClick={() => setViewMode('BISNIS')} className={'px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ' + (viewMode === 'BISNIS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300')}>Bisnis</button>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {(viewMode === 'BISNIS' || (viewMode === 'OPERATOR' && operatorRole === 'KASIR')) && (
          <aside className={'hidden md:flex flex-col shrink-0 transition-all duration-300 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 shadow-sm ' + (isSidebarMinimized ? 'w-20' : 'w-64')}>
            <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-800">
              {!isSidebarMinimized && <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400 dark:text-stone-500">{viewMode === 'BISNIS' ? 'Business Center' : 'Kasir System'}</span>}
              <button onClick={() => setIsSidebarMinimized(!isSidebarMinimized)} className="p-1.5 rounded-xl mx-auto transition bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200">{isSidebarMinimized ? '❯' : '❮'}</button>
            </div>
            <nav className="flex-1 p-3 space-y-1.5">
              {viewMode === 'BISNIS' ? (
                <><SidebarItem icon="📈" label="Ringkasan" minimized={isSidebarMinimized} active={bizTab === 'RINGKASAN'} onClick={() => setBizTab('RINGKASAN')} /><SidebarItem icon="📦" label="Stok FIFO" minimized={isSidebarMinimized} active={bizTab === 'STOK'} onClick={() => setBizTab('STOK')} /><SidebarItem icon="🧾" label="Piutang" minimized={isSidebarMinimized} active={bizTab === 'PIUTANG'} onClick={() => setBizTab('PIUTANG')} /><SidebarItem icon="⚙️" label="Pengaturan" minimized={isSidebarMinimized} active={bizTab === 'PENGATURAN'} onClick={() => setBizTab('PENGATURAN')} /></>
              ) : (
                <><SidebarItem icon="🛒" label="POS" minimized={isSidebarMinimized} active={true} onClick={() => {}} /><SidebarItem icon="⏱️" label="Riwayat" minimized={isSidebarMinimized} onClick={() => {}} /></>
              )}
            </nav>
          </aside>
        )}
        <main className="flex-1 flex flex-col overflow-hidden bg-stone-50/50 dark:bg-stone-950/50 relative">
          {viewMode === 'BISNIS' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {bizTab === 'RINGKASAN' && (
                <><div className="p-4 rounded-xl text-xs font-medium bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300 shadow-sm">Dashboard Manajemen Bisnis</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm"><p className="text-[10px] font-bold tracking-wider uppercase text-stone-400 dark:text-stone-500">Omset</p><p className="text-xl font-bold font-mono mt-1 text-stone-900 dark:text-stone-100">Rp 4.250.000</p></div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm"><p className="text-[10px] font-bold tracking-wider uppercase text-stone-400 dark:text-stone-500">FIFO Batches</p><p className="text-xl font-bold font-mono mt-1 text-stone-900 dark:text-stone-100">68</p></div>
                  <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 border-b-2 border-b-red-500 shadow-sm"><p className="text-[10px] font-bold tracking-wider uppercase text-stone-400 dark:text-stone-500">Piutang</p><p className="text-xl font-bold font-mono mt-1 text-red-600 dark:text-red-400">Rp 1.890.000</p></div>
                </div></>
              )}
              {bizTab === 'PENGATURAN' && (
                <div className="max-w-2xl mx-auto w-full space-y-6">
                  <div><h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Pengaturan Toko</h2><p className="text-xs mt-1 text-stone-500 dark:text-stone-400">Konfigurasi metode pembayaran dan template komunikasi</p></div>
                  <div className="p-5 space-y-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                    <label className="text-xs font-bold text-stone-900 dark:text-stone-100">Penyedia QRIS</label>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Pisahkan dengan koma</p>
                    <input type="text" value={settingsForm.qris_providers} onChange={e => { setSettingsForm(p => ({ ...p, qris_providers: e.target.value })); setSettingsDirty(true); }} placeholder="DANA, GoPay, ShopeePay" className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600/40" />
                  </div>
                  <div className="p-5 space-y-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                    <label className="text-xs font-bold text-stone-900 dark:text-stone-100">Rekening Bank</label>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Format: Bank - No Rek - Atas Nama</p>
                    <textarea value={settingsForm.bank_accounts} onChange={e => { setSettingsForm(p => ({ ...p, bank_accounts: e.target.value })); setSettingsDirty(true); }} placeholder="BCA - 1234567890 - Yori DevHouse" rows={3} className="w-full rounded-xl px-4 py-2.5 text-xs resize-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600/40" />
                  </div>
                  <div className="p-5 space-y-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                    <label className="text-xs font-bold text-stone-900 dark:text-stone-100">Template WhatsApp</label>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Placeholder: [customer_name], [invoice_no], [total_amount], [receipt_url]</p>
                    <textarea value={settingsForm.wa_template} onChange={e => { setSettingsForm(p => ({ ...p, wa_template: e.target.value })); setSettingsDirty(true); }} rows={3} className="w-full rounded-xl px-4 py-2.5 text-xs resize-none font-mono bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600/40" />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleSaveSettings} disabled={isSavingSettings || !settingsDirty}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs active:scale-[0.98] bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400 shadow-sm">{isSavingSettings ? 'Menyimpan...' : settingsDirty ? 'Simpan' : 'Tersimpan'}</button>
                  </div>
                </div>
              )}
              {bizTab === 'STOK' && <div className="rounded-2xl p-8 text-center text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 shadow-sm">Stok FIFO</div>}
              {bizTab === 'PIUTANG' && <div className="rounded-2xl p-8 text-center text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 shadow-sm">Piutang</div>}
            </div>
          )}
          {viewMode === 'OPERATOR' && operatorRole === 'KASIR' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-full">
              <div className={'flex-1 p-5 sm:p-6 flex flex-col space-y-4 overflow-hidden h-full ' + (mobileActiveTab === 'KERANJANG' ? 'hidden md:flex' : 'flex')}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                  <div><h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Katalog Menu</h1><p className="text-xs text-stone-400 dark:text-stone-500">Tekan item untuk ditambahkan</p></div>
                  <input type="text" placeholder="Cari / scan SKU..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="rounded-xl px-4 py-2 text-xs w-full sm:max-w-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40 shadow-sm" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 shrink-0">
                  <button onClick={() => setSelectedCategory(null)} className={'px-4 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition shadow-sm ' + (selectedCategory === null ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800')}>Semua</button>
                  {categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={'px-4 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition shadow-sm ' + (selectedCategory === cat.id ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800')}>{cat.name}</button>))}
                </div>
                <div className="flex-1 overflow-y-auto pr-1">
                  {loading ? <div className="text-center py-16 text-xs text-stone-400 animate-pulse">Memuat...</div>
                  : products.length === 0 ? <div className="text-center py-16 text-xs text-stone-400">Menu belum tersedia.</div>
                  : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-24 md:pb-6">
                      {products.map(product => (
                        <div key={product.id} onClick={() => addToCart(product)} className="p-4 rounded-2xl flex flex-col justify-between cursor-pointer transition duration-200 group active:scale-[0.97] bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-700/70 hover:border-emerald-600/40 dark:hover:border-emerald-500/40 hover:shadow-md">
                          <div><span className="text-[9px] font-mono font-bold block tracking-wider uppercase text-stone-400 dark:text-stone-500">{product.sku}</span>
                          <h3 className="font-semibold text-xs line-clamp-2 mt-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition text-stone-800 dark:text-stone-200">{product.name}</h3></div>
                          <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-stone-100 dark:border-stone-800">
                            <span className="font-bold text-xs font-mono text-stone-900 dark:text-stone-100">{formatRupiah(Number(product.price_sell))}</span>
                            <span className="text-[10px] font-bold rounded-lg px-2 py-0.5 opacity-0 sm:group-hover:opacity-100 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950">+ ADD</span>
                          </div>
                        </div>
                      ))}
                    </div>}
                </div>
                {totalCartItems > 0 && (
                  <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
                    <button onClick={() => setMobileActiveTab('KERANJANG')} className="w-full p-3.5 rounded-2xl flex items-center justify-between shadow-xl font-semibold text-xs active:scale-[0.98] bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/10">
                      <span className="px-2 py-0.5 rounded-md font-mono bg-white/20">Cart {totalCartItems}</span>
                      <span className="font-mono text-sm font-bold">{formatRupiah(calculateTotal())} →</span>
                    </button>
                  </div>
                )}
              </div>
              <div className={'w-full md:w-96 flex flex-col h-full shrink-0 bg-white dark:bg-stone-900 border-t md:border-t-0 md:border-l border-stone-200 dark:border-stone-800 ' + (mobileActiveTab === 'KERANJANG' ? 'flex' : 'hidden md:flex')}>
                <div className="flex items-center justify-between p-4 border-b shrink-0 bg-stone-50/40 dark:bg-stone-800/40 border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMobileActiveTab('KATALOG')} className="md:hidden p-1.5 rounded-xl text-xs font-bold mr-1 active:scale-95 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">Katalog</button>
                    <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">Keranjang</h2>
                  </div>
                  {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs font-medium text-stone-400 hover:text-red-500">Kosongkan</button>}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center py-20 text-stone-300 dark:text-stone-700"><span className="text-3xl">🛒</span><p className="text-xs text-stone-400 dark:text-stone-500 mt-2">Keranjang kosong</p></div>
                  : cart.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between gap-3 pb-3 border-b last:border-0 border-stone-50 dark:border-stone-800">
                        <div className="flex-1"><h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200">{item.product.name}</h4><p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 mt-0.5">{formatRupiah(Number(item.product.price_sell))}</p></div>
                        <div className="flex items-center overflow-hidden rounded-xl border shrink-0 bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 shadow-sm">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2.5 py-1 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400">-</button>
                          <span className="px-1 text-xs font-bold font-mono w-6 text-center text-stone-800 dark:text-stone-200">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2.5 py-1 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400">+</button>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-4 space-y-4 shrink-0 border-t bg-stone-50 dark:bg-stone-800/30 border-stone-200/60 dark:border-stone-800/60">
                  <div className="flex items-center justify-between font-semibold text-xs text-stone-900 dark:text-stone-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Total</span>
                    <span className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-400">{formatRupiah(calculateTotal())}</span>
                  </div>
                  <button disabled={cart.length === 0} onClick={() => { setSelectedFulfillment(fulfillmentMethod); setIsCheckoutModalOpen(true); setCheckoutStep('MENU'); }}
                    className={'w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase shadow-sm ' + (cart.length > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99]' : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed')}>Proses</button>
                </div>
              </div>
            </div>
          )}
          {viewMode === 'OPERATOR' && operatorRole === 'DAPUR' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-20">
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">DAPUR</h2>
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
                <div className="flex justify-between pb-2 mb-2 text-xs border-b border-stone-100 dark:border-stone-800">
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">ORDER #1042</span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500">AMBIL TOKO</span>
                </div>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">4x Platter Cireng</p>
              </div>
              <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around z-40 px-4 py-2 border-t bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xl">
                <BottomNavItem icon="🍳" label="Antrean" active={true} /><BottomNavItem icon="✅" label="Selesai" />
              </nav>
            </div>
          )}
          {viewMode === 'OPERATOR' && operatorRole === 'KURIR' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-20">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">KURIR</h2>
                <button onClick={fetchDeliveryOrders} disabled={isLoadingDelivery} className="text-[10px] px-3 py-1.5 rounded-xl font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">{isLoadingDelivery ? '...' : 'Refresh'}</button>
              </div>
              {isLoadingDelivery ? <div className="text-center py-12 text-xs text-stone-400 animate-pulse">Memuat...</div>
              : deliveryOrders.length === 0 ? <div className="rounded-2xl p-12 text-center text-xs border border-dashed border-stone-200 dark:border-stone-800 text-stone-400">Tidak ada pesanan.</div>
              : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deliveryOrders.filter((o: any) => o.type === 'delivery').map((order: any) => (
                    <div key={order.id} className="p-4 rounded-2xl border-l-4 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 border-l-emerald-500 dark:border-l-emerald-400 shadow-sm">
                      <div className="flex justify-between items-start pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
                        <div><span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">{order.invoice_no}</span>{order.customer?.name && <p className="text-[10px] mt-0.5 text-stone-400 dark:text-stone-500">{order.customer.name}</p>}</div>
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">KIRIM</span>
                      </div>
                      <div className="text-[10px] leading-relaxed mb-3 line-clamp-2 text-stone-700 dark:text-stone-300">{order.sale_details?.map((sd: any) => sd.qty + 'x ' + sd.product?.name).join(', ')}</div>
                      <div className="flex justify-between items-center text-xs mb-3"><span className="text-stone-400 dark:text-stone-500">Total:</span><span className="font-bold font-mono text-stone-900 dark:text-stone-100">{formatRupiah(Number(order.total_amount))}</span></div>
                      <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                        {order.customer?.phone && (
                          <a href={buildWaUrl(order.customer.phone, order.invoice_no, Number(order.total_amount), order.customer?.name || 'Pelanggan')} target="_blank" rel="noopener noreferrer"
                            className="w-full py-2 rounded-xl text-[10px] font-bold text-center active:scale-[0.98] bg-emerald-500 hover:bg-emerald-600 text-white">WhatsApp</a>
                        )}
                        <div className="flex gap-1.5">
                          {order.customer?.latitude && order.customer?.longitude && (
                            <a href={'https://www.google.com/maps/search/?api=1&query=' + order.customer.latitude + ',' + order.customer.longitude} target="_blank" rel="noopener noreferrer"
                              className="flex-1 py-2 rounded-xl text-[10px] font-bold text-center active:scale-[0.98] bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300">Maps</a>
                          )}
                          <button onClick={() => { setCompletingSaleId(order.id); setCompletePaymentMethod('CASH'); setCompletePaymentStatus('lunas'); setCompletePaymentProof(''); setCompletePaymentProofName(''); setIsCompleteDialogOpen(true); }}
                            className="flex-1 py-2 rounded-xl text-[10px] font-bold active:scale-[0.98] bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900">Selesai</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>}
              <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around z-40 px-4 py-2 border-t bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xl">
                <BottomNavItem icon="🏍️" label="Siap Antar" active={true} /><BottomNavItem icon="🏁" label="Sampai Tujuan" />
              </nav>
            </div>
          )}
        </main>
      </div>
      {/* CHECKOUT MODAL */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200">
            <div className="flex items-center justify-between p-5 shrink-0 border-b bg-stone-50/50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800">
              <div><h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Pilih Pembayaran</h3><p className="text-[10px] text-stone-400 dark:text-stone-500">Selesaikan transaksi</p></div>
              <button onClick={() => { setIsCheckoutModalOpen(false); setCheckoutStep('MENU'); setCashReceived(''); setPaymentProofBase64(''); setPaymentProofFileName(''); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200">✕</button>
            </div>
            <div className="p-6 text-center shrink-0 bg-stone-950"><span className="text-[10px] font-mono tracking-widest font-bold uppercase text-emerald-400">TOTAL</span><p className="text-3xl font-black font-mono text-white mt-1">{formatRupiah(calculateTotal())}</p></div>
            <div className="flex-1 overflow-y-auto p-6">
              {checkoutStep === 'MENU' && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { setSelectedFulfillment(fulfillmentMethod); setCheckoutStep('PESANAN'); }} className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900 hover:border-amber-400 dark:hover:border-amber-700 bg-amber-50/20 dark:bg-amber-950/20 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 text-center group active:scale-[0.97]">
                    <span className="text-3xl group-hover:scale-110 transition block mb-2">📝</span><span className="font-bold text-xs text-stone-900 dark:text-stone-100">Pesanan</span></button>
                  <button onClick={() => { setSelectedFulfillment(fulfillmentMethod); setCheckoutStep('LUNAS'); }} className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900 hover:border-emerald-400 dark:hover:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-950/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 text-center group active:scale-[0.97]">
                    <span className="text-3xl group-hover:scale-110 transition block mb-2">💰</span><span className="font-bold text-xs text-stone-900 dark:text-stone-100">Lunas</span></button>
                  <button onClick={() => { setCheckoutStep('GABUNG'); fetchPendingSales(); }} className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 hover:border-indigo-400 dark:hover:border-indigo-700 bg-indigo-50/20 dark:bg-indigo-950/20 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-center group active:scale-[0.97]">
                    <span className="text-3xl group-hover:scale-110 transition block mb-2">🔗</span><span className="font-bold text-xs text-stone-900 dark:text-stone-100">Gabung</span></button>
                  <button onClick={() => setCheckoutStep('PIUTANG')} className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900 hover:border-rose-400 dark:hover:border-rose-700 bg-rose-50/20 dark:bg-rose-950/20 hover:bg-rose-50/60 dark:hover:bg-rose-950/40 text-center group active:scale-[0.97]">
                    <span className="text-3xl group-hover:scale-110 transition block mb-2">📒</span><span className="font-bold text-xs text-stone-900 dark:text-stone-100">Piutang</span></button>
                </div>
              )}
              {checkoutStep === 'PESANAN' && (
                <div className="space-y-5">
                  <div><label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Penyerahan</label>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border bg-stone-100 dark:bg-stone-800 border-stone-200/50 dark:border-stone-700/50 mt-1">
                      <button onClick={() => setSelectedFulfillment('AMBIL_TOKO')} className={'py-2 text-xs font-bold rounded-lg ' + (selectedFulfillment === 'AMBIL_TOKO' ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Ambil Toko</button>
                      <button onClick={() => setSelectedFulfillment('DIKIRIM')} className={'py-2 text-xs font-bold rounded-lg ' + (selectedFulfillment === 'DIKIRIM' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Kirim</button>
                    </div>
                  </div>
                  {selectedFulfillment === 'DIKIRIM' && (
                    <div className="space-y-3 p-4 rounded-2xl border bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700">
                      <p className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Detail Pengiriman</p>
                      <input type="text" placeholder="Telepon" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10" />
                      <textarea placeholder="Alamat" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={2} className="w-full rounded-xl px-4 py-2.5 text-xs resize-none bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10" />
                      <div className="grid grid-cols-2 gap-2"><input type="text" placeholder="Lat" value={customerLatitude} onChange={e => setCustomerLatitude(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-xs font-mono bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10" /><input type="text" placeholder="Lng" value={customerLongitude} onChange={e => setCustomerLongitude(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-xs font-mono bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10" /></div>
                    </div>
                  )}
                  <input type="text" placeholder="Nama Pelanggan" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10" />
                  <div className="flex gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <button onClick={() => setCheckoutStep('MENU')} className="flex-1 py-3 rounded-xl font-bold text-xs border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800">Kembali</button>
                    <button onClick={() => handleCheckoutSubmit('PESANAN')} disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400">{isSubmitting ? '...' : 'Simpan'}</button>
                  </div>
                </div>
              )}
              {checkoutStep === 'LUNAS' && (
                <div className="space-y-5">
                  <div><label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Pembayaran</label>
                    <div className="grid grid-cols-3 gap-2 p-1 rounded-xl border bg-stone-100 dark:bg-stone-800 border-stone-200/50 dark:border-stone-700/50 mt-1">
                      {(['CASH', 'QRIS', 'TRANSFER'] as const).map(m => (
                        <button key={m} onClick={() => setSelectedPaymentMethod(m)} className={'py-2 text-[10px] font-bold rounded-lg ' + (selectedPaymentMethod === m ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>
                          {m === 'CASH' ? 'Tunai' : m === 'QRIS' ? 'QRIS' : 'Transfer'}</button>
                      ))}
                    </div>
                  </div>
                  {(selectedPaymentMethod === 'QRIS' || selectedPaymentMethod === 'TRANSFER') && (
                    <div className="space-y-3 p-4 rounded-2xl border bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700">
                      <label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Bukti Bayar *</label>
                      <div className="flex items-center gap-2">
                        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePaymentProofFile} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-emerald-500">{paymentProofFileName ? paymentProofFileName : '+ Pilih File'}</button>
                        {paymentProofBase64 && <button onClick={() => { setPaymentProofBase64(''); setPaymentProofFileName(''); }} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl text-xs font-bold">✕</button>}
                      </div>
                      {paymentProofBase64 && <div className="w-full h-32 rounded-xl overflow-hidden border bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700"><img src={paymentProofBase64} alt="Bukti" className="w-full h-full object-contain" /></div>}
                    </div>
                  )}
                  {selectedPaymentMethod === 'CASH' && (
                    <div className="space-y-3 p-4 rounded-2xl border bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700">
                      <label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Uang Diterima</label>
                      <div className="flex gap-2"><input type="number" placeholder="Jumlah..." value={cashReceived} onChange={e => setCashReceived(e.target.value)} className="flex-1 rounded-xl px-4 py-2.5 text-xs font-mono font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" /><button onClick={() => setCashReceived(String(calculateTotal()))} className="px-3 rounded-xl text-xs font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800">Pas</button></div>
                      {Number(cashReceived) >= calculateTotal() && <div className="flex justify-between pt-2 border-t border-stone-200/50 dark:border-stone-700/50 text-xs"><span className="text-stone-500 dark:text-stone-400">Kembali:</span><span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatRupiah(calculateChange())}</span></div>}
                    </div>
                  )}
                  <div><label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Penyerahan</label>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border bg-stone-100 dark:bg-stone-800 border-stone-200/50 dark:border-stone-700/50 mt-1">
                      <button onClick={() => setSelectedFulfillment('AMBIL_TOKO')} className={'py-2 text-xs font-bold rounded-lg ' + (selectedFulfillment === 'AMBIL_TOKO' ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Ambil</button>
                      <button onClick={() => setSelectedFulfillment('DIKIRIM')} className={'py-2 text-xs font-bold rounded-lg ' + (selectedFulfillment === 'DIKIRIM' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Kirim</button>
                    </div>
                  </div>
                  {selectedFulfillment === 'DIKIRIM' && (
                    <div className="space-y-3 p-4 rounded-2xl border bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700">
                      <p className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Detail Kirim</p>
                      <input type="text" placeholder="Tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                      <textarea placeholder="Alamat" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={1} className="w-full rounded-xl px-4 py-2.5 text-xs resize-none bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                      <div className="grid grid-cols-2 gap-2"><input type="text" placeholder="Lat" value={customerLatitude} onChange={e => setCustomerLatitude(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-xs font-mono bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none" /><input type="text" placeholder="Lng" value={customerLongitude} onChange={e => setCustomerLongitude(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-xs font-mono bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none" /></div>
                    </div>
                  )}
                  <input type="text" placeholder="Nama Pelanggan" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
                  <div className="flex gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <button onClick={() => setCheckoutStep('MENU')} className="flex-1 py-3 rounded-xl font-bold text-xs border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400">Kembali</button>
                    <button onClick={() => handleCheckoutSubmit('LUNAS')} disabled={isSubmitting || (selectedPaymentMethod === 'CASH' && Number(cashReceived) < calculateTotal())}
                      className="flex-1 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400">{isSubmitting ? '...' : 'Bayar'}</button>
                  </div>
                </div>
              )}
              {checkoutStep === 'GABUNG' && (
                <div className="space-y-5">
                  <label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Pilih Nota</label>
                  {isLoadingPendingSales ? <div className="text-center py-8 text-xs text-stone-400 animate-pulse">Memuat...</div>
                  : pendingSales.length === 0 ? <div className="rounded-2xl p-8 text-center text-xs border border-dashed border-stone-200 dark:border-stone-700 text-stone-400">Kosong</div>
                  : <div className="space-y-2 max-h-60 overflow-y-auto">{pendingSales.map((s: any) => (
                      <div key={s.id} onClick={() => setSelectedPendingSaleId(s.id)} className={'p-3.5 rounded-2xl cursor-pointer border ' + (selectedPendingSaleId === s.id ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900')}>
                        <div className="flex justify-between text-xs font-bold"><span className="font-mono text-stone-900 dark:text-stone-100">{s.invoice_no}</span><span className="text-indigo-700 dark:text-indigo-400 font-mono">{formatRupiah(Number(s.total_amount))}</span></div>
                        <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">{s.customer?.name || '-'}</div>
                      </div>
                    ))}</div>}
                  <div className="flex gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <button onClick={() => setCheckoutStep('MENU')} className="flex-1 py-3 rounded-xl font-bold text-xs border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400">Kembali</button>
                    <button onClick={() => handleCheckoutSubmit('GABUNG')} disabled={isSubmitting || !selectedPendingSaleId} className="flex-1 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-stone-200 dark:disabled:bg-stone-800">{isSubmitting ? '...' : 'Gabung'}</button>
                  </div>
                </div>
              )}
              {checkoutStep === 'PIUTANG' && (
                <div className="space-y-5">
                  <label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Nama *</label>
                  <input type="text" placeholder="Nama Pelanggan" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500/10" />
                  <div className="p-4 rounded-2xl text-[10px] border bg-rose-50/50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-300">Dicatat sebagai Piutang</div>
                  <div className="flex gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <button onClick={() => setCheckoutStep('MENU')} className="flex-1 py-3 rounded-xl font-bold text-xs border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400">Kembali</button>
                    <button onClick={() => handleCheckoutSubmit('PIUTANG')} disabled={isSubmitting || !customerName.trim()} className="flex-1 py-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white disabled:bg-stone-200 dark:disabled:bg-stone-800">{isSubmitting ? '...' : 'Catat'}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* COURIER COMPLETE */}
      {isCompleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between p-5 border-b bg-stone-50/50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Selesaikan</h3>
              <button onClick={() => { setIsCompleteDialogOpen(false); setCompletingSaleId(null); setCompletePaymentProof(''); setCompletePaymentProofName(''); }} className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs font-bold">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div><label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Status</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border bg-stone-100 dark:bg-stone-800 border-stone-200/50 dark:border-stone-700/50 mt-1">
                  <button onClick={() => setCompletePaymentStatus('lunas')} className={'py-2 text-xs font-bold rounded-lg ' + (completePaymentStatus === 'lunas' ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Lunas</button>
                  <button onClick={() => setCompletePaymentStatus('piutang')} className={'py-2 text-xs font-bold rounded-lg ' + (completePaymentStatus === 'piutang' ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Piutang</button>
                </div>
              </div>
              {completePaymentStatus === 'lunas' && (
                <><div><label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Metode</label>
                  <div className="grid grid-cols-3 gap-2 p-1 rounded-xl border bg-stone-100 dark:bg-stone-800 border-stone-200/50 dark:border-stone-700/50 mt-1">
                    {(['CASH', 'QRIS', 'TRANSFER'] as const).map(m => (<button key={m} onClick={() => setCompletePaymentMethod(m)} className={'py-2 text-[10px] font-bold rounded-lg ' + (completePaymentMethod === m ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>{m === 'CASH' ? 'Tunai' : m === 'QRIS' ? 'QRIS' : 'Transfer'}</button>))}
                  </div></div>
                  {(completePaymentMethod === 'QRIS' || completePaymentMethod === 'TRANSFER') && (
                    <div className="space-y-3 p-4 rounded-2xl border bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700">
                      <label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Bukti *</label>
                      <div className="flex gap-2"><input ref={completeFileRef} type="file" accept="image/*" onChange={handleCompleteProofFile} className="hidden" />
                        <button onClick={() => completeFileRef.current?.click()} className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">{completePaymentProofName || '+ Unggah'}</button>
                        {completePaymentProof && <button onClick={() => { setCompletePaymentProof(''); setCompletePaymentProofName(''); }} className="p-2.5 text-red-500">✕</button>}
                      </div>
                      {completePaymentProof && <div className="w-full h-32 rounded-xl overflow-hidden border bg-stone-100 dark:bg-stone-800"><img src={completePaymentProof} alt="Bukti" className="w-full h-full object-contain" /></div>}
                    </div>
                  )}
                </>
              )}
              {completePaymentStatus === 'piutang' && <div className="p-4 rounded-2xl text-[10px] border bg-rose-50/50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-300">Dicatat sebagai Piutang</div>}
              <button onClick={handleCompleteDelivery} disabled={isSubmitting} className="w-full py-3 rounded-xl font-bold text-xs bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400 shadow-sm">{isSubmitting ? '...' : 'Selesaikan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function SidebarItem({ icon, label, minimized, active = false, onClick }: { icon: string; label: string; minimized: boolean; active?: boolean; onClick: () => void }) {
  return (<button onClick={onClick} className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all duration-150 ' + (active ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100/70 dark:hover:bg-stone-800/70 hover:text-stone-900 dark:hover:text-stone-200 active:scale-[0.98]')}><span className="text-sm shrink-0">{icon}</span>{!minimized && <span className="truncate tracking-wide font-medium">{label}</span>}</button>);
}
function BottomNavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (<button className="flex flex-col items-center justify-center py-1 px-3 text-center active:scale-95"><span className="text-base">{icon}</span><span className={'text-[9px] font-bold tracking-tight mt-1 ' + (active ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500')}>{label}</span></button>);
}
`;
try {
  fs.writeFileSync(targetPath, content, 'utf-8');
  console.log('SUCCESS: POS page written. Lines:', content.split('\n').length, 'Bytes:', content.length);
} catch (err) {
  console.error('FAILED:', err.message);
  process.exit(1);
}
