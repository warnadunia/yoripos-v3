'use client';

// src/app/pos/page.tsx (Full Fixed - Elegant Minimalist UX with Store Pickup & Delivery Rule)
import { useState, useEffect } from 'react';

type ViewMode = 'OPERATOR' | 'BISNIS';
type OperatorRole = 'KASIR' | 'DAPUR' | 'KURIR';
type MobileTab = 'KATALOG' | 'KERANJANG';
type FulfillmentMethod = 'AMBIL_TOKO' | 'DIKIRIM';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  price_sell: string | number;
  category_id: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function PosPage() {
  // Guard anti Hydration Mismatch dari extension/autofill browser
  const [hasMounted, setHasMounted] = useState(false);

  // Core Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI/UX & Context Rules Controls
  const [viewMode, setViewMode] = useState<ViewMode>('OPERATOR');
  const [operatorRole, setOperatorRole] = useState<OperatorRole>('KASIR');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('AMBIL_TOKO');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>('KATALOG');

  // Checkout Modal States
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'MENU' | 'PESANAN' | 'LUNAS' | 'GABUNG' | 'PIUTANG'>('MENU');
  const [customerName, setCustomerName] = useState('');
  const [selectedFulfillment, setSelectedFulfillment] = useState<FulfillmentMethod>('AMBIL_TOKO');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
  const [pendingSales, setPendingSales] = useState<any[]>([]);
  const [selectedPendingSaleId, setSelectedPendingSaleId] = useState<number | null>(null);
  const [isLoadingPendingSales, setIsLoadingPendingSales] = useState(false);
  const [cashReceived, setCashReceived] = useState('');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 1. Data Fetcher dari TiDB Cloud
  async function loadInitialData() {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products')
      ]);
      const catData = await catRes.json();
      const prodData = await prodRes.json();

      if (catData.success) setCategories(catData.data);
      if (prodData.success) setProducts(prodData.data);
    } catch (error) {
      console.error('Gagal memuat data POS:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasMounted) {
      loadInitialData();
    }
  }, [hasMounted]);

  // 2. Filter & Debounced Live Search
  useEffect(() => {
    if (!hasMounted) return;

    async function filterProducts() {
      let url = '/api/products?';
      if (selectedCategory) url += `category_id=${selectedCategory}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;

      try {
        const res = await fetch(url);
        const result = await res.json();
        if (result.success) setProducts(result.data);
      } catch (error) {
        console.error('Gagal memfilter produk:', error);
      }
    }

    const delayDebounce = setTimeout(() => {
      filterProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery, hasMounted]);

  // 3. Cart Mechanics
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, amount: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: item.quantity + amount };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + Number(item.product.price_sell) * item.quantity, 0);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 4. Fetch Daftar Pesanan Gantung dari API
  const fetchPendingSales = async () => {
    try {
      setIsLoadingPendingSales(true);
      const response = await fetch('/api/checkout');
      const result = await response.json();
      if (result.success) {
        setPendingSales(result.data);
      } else {
        console.error('Gagal mengambil daftar pesanan gantung:', result.error);
      }
    } catch (error) {
      console.error('Terjadi kesalahan memuat pesanan gantung:', error);
    } finally {
      setIsLoadingPendingSales(false);
    }
  };

  // 5. Hitung Kembalian Tunai
  const calculateChange = () => {
    const total = calculateTotal();
    const received = Number(cashReceived);
    if (!received || received < total) return 0;
    return received - total;
  };

  // 6. Submit Order Handler dengan Payload Dinamis
  const handleCheckoutSubmit = async (type: 'PESANAN' | 'LUNAS' | 'GABUNG' | 'PIUTANG') => {
    if (cart.length === 0 || isSubmitting) return;

    if (type === 'PIUTANG' && (!customerName || customerName.trim() === '')) {
      alert('Nama pelanggan wajib diisi untuk transaksi Piutang!');
      return;
    }
    if (type === 'GABUNG' && !selectedPendingSaleId) {
      alert('Pilih salah satu pesanan gantung untuk digabungkan!');
      return;
    }

    try {
      setIsSubmitting(true);

      let payload: any = { cart };

      if (type === 'PESANAN') {
        payload.payment_status = 'pending';
        payload.fulfillment_method = selectedFulfillment;
        if (customerName.trim() !== '') {
          payload.customer_name = customerName;
        }
      } else if (type === 'LUNAS') {
        payload.payment_status = 'lunas';
        payload.payment_method = selectedPaymentMethod;
        payload.fulfillment_method = selectedFulfillment;
        if (customerName.trim() !== '') {
          payload.customer_name = customerName;
        }
      } else if (type === 'GABUNG') {
        payload.merge_sale_id = selectedPendingSaleId;
      } else if (type === 'PIUTANG') {
        payload.payment_status = 'piutang';
        payload.customer_name = customerName;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        let msg = '';
        if (type === 'PESANAN') {
          msg = `🎉 NOTA GANTUNG BERHASIL DISIMPAN!\nNomor Invoice: ${result.data.invoice_no}\nPelanggan: ${customerName || '-'}\nMetode: ${selectedFulfillment === 'DIKIRIM' ? '🏍️ DIKIRIM' : '🏬 AMBIL DI TOKO'}`;
        } else if (type === 'LUNAS') {
          const kembalian = calculateChange();
          msg = `🎉 PEMBAYARAN LUNAS BERHASIL!\nNomor Invoice: ${result.data.invoice_no}\nMetode: ${selectedPaymentMethod}\n${selectedPaymentMethod === 'CASH' && kembalian > 0 ? `Kembalian: ${formatRupiah(kembalian)}` : ''}`;
        } else if (type === 'GABUNG') {
          msg = `🎉 BERHASIL DIGABUNGKAN!\nItem keranjang berhasil digabungkan ke Nota Gantung.`;
        } else if (type === 'PIUTANG') {
          msg = `🎉 PIUTANG BERHASIL DICATAT (SIXTY)!\nNomor Invoice: ${result.data.invoice_no}\nPelanggan: ${customerName}`;
        }

        alert(msg);

        // Reset states
        setCart([]);
        setIsCheckoutModalOpen(false);
        setCheckoutStep('MENU');
        setCustomerName('');
        setCashReceived('');
        setSelectedPendingSaleId(null);
        setMobileActiveTab('KATALOG');
        await loadInitialData();
      } else {
        alert(`❌ Gagal Memproses Transaksi:\n${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kendala jaringan ke database server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center font-sans">
        <p className="text-xs text-stone-400 uppercase tracking-widest animate-pulse">Menyiapkan Engine Asayori Tech...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans overflow-hidden h-screen select-none">

      {/* ─── APP HEADER: DANA STYLE MODE SWITCHER ─── */}
      <header className="bg-white border-b border-stone-200/70 px-5 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-stone-950 text-stone-50 font-mono text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-lg shadow-inner">
            YoriPOS <span className="text-emerald-500">V3</span>
          </div>

          {viewMode === 'OPERATOR' && (
            <div className="relative">
              <select
                value={operatorRole}
                onChange={(e) => {
                  setOperatorRole(e.target.value as OperatorRole);
                  setMobileActiveTab('KATALOG');
                }}
                className="appearance-none bg-stone-100 hover:bg-stone-200/80 border border-stone-200/60 rounded-xl pl-3 pr-8 py-1.5 text-xs font-semibold text-stone-600 focus:outline-none cursor-pointer transition"
              >
                <option value="KASIR">🏬 Operator: Kasir Jual</option>
                <option value="DAPUR">🍳 Operator: Layar Dapur</option>
                <option value="KURIR">🏍️ Operator: Logistik Kurir</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-stone-400">▼</span>
            </div>
          )}
        </div>

        {/* TAB SAKELAR INTEGRASI MODEL CAPSULE ALA DANA */}
        <div className="bg-stone-100 p-1 rounded-xl flex items-center shadow-inner border border-stone-200/40">
          <button
            onClick={() => setViewMode('OPERATOR')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${viewMode === 'OPERATOR' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
              }`}
          >
            📱 Operator
          </button>
          <button
            onClick={() => setViewMode('BISNIS')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${viewMode === 'BISNIS' ? 'bg-emerald-600 text-white shadow-sm font-semibold' : 'text-stone-400 hover:text-stone-600'
              }`}
          >
            💼 Bisnis
          </button>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-[10px] font-mono tracking-wider text-stone-400 font-medium">ASAYORI TECH</span>
        </div>
      </header>

      {/* ─── MAIN APP GRID CONTROLLER ─── */}
      <div className="flex-1 flex flex-row overflow-hidden relative">

        {/* ─── SIDEBAR DESKTOP & TABLET (MINIMIZABLE) ─── */}
        {(viewMode === 'BISNIS' || (viewMode === 'OPERATOR' && operatorRole === 'KASIR')) && (
          <aside
            className={`hidden md:flex flex-col bg-white border-r border-stone-200/80 shrink-0 transition-all duration-300 shadow-sm ${isSidebarMinimized ? 'w-20' : 'w-64'
              }`}
          >
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              {!isSidebarMinimized && (
                <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase font-bold">
                  {viewMode === 'BISNIS' ? 'Business Center' : 'Kasir System'}
                </span>
              )}
              <button
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className="p-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-400 hover:text-stone-700 mx-auto transition"
              >
                {isSidebarMinimized ? '❯' : '❮'}
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1.5">
              {viewMode === 'BISNIS' ? (
                <>
                  <SidebarItem icon="📈" label="Omset & Profit" minimized={isSidebarMinimized} active={true} />
                  <SidebarItem icon="📦" label="Stok FIFO Batches" minimized={isSidebarMinimized} />
                  <SidebarItem icon="🧾" label="Piutang (SIXTY)" minimized={isSidebarMinimized} />
                  <SidebarItem icon="👥" label="AbsenPWA Pegawai" minimized={isSidebarMinimized} />
                </>
              ) : (
                <>
                  <SidebarItem icon="🛒" label="Mesin Jual POS" minimized={isSidebarMinimized} active={true} />
                  <SidebarItem icon="⏱️" label="Arsip Riwayat Struk" minimized={isSidebarMinimized} />
                </>
              )}
            </nav>
          </aside>
        )}

        {/* ─── MAIN CONTENT VIEWPORT ─── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-stone-50/50 relative">

          {/* VIEW: MODE BISNIS */}
          {viewMode === 'BISNIS' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-emerald-50/60 border border-emerald-100 text-emerald-900 p-4 rounded-xl text-xs font-medium shadow-sm">
                💼 Anda masuk dalam <b>Dashboard Manajemen Bisnis</b>. Seluruh pemantauan laba bersih berjalan dinamis.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                  <p className="text-[10px] text-stone-400 font-bold tracking-wider uppercase">Omset Penjualan</p>
                  <p className="text-xl font-bold font-mono text-stone-900 mt-1">Rp 4.250.000</p>
                </div>
                <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                  <p className="text-[10px] text-stone-400 font-bold tracking-wider uppercase">Batch Antrean FIFO</p>
                  <p className="text-xl font-bold font-mono text-stone-900 mt-1">68 Batches</p>
                </div>
                <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-sm border-b-2 border-b-red-500 hover:shadow-md transition">
                  <p className="text-[10px] text-stone-400 font-bold tracking-wider uppercase">Beban Piutang (SIXTY)</p>
                  <p className="text-xl font-bold font-mono text-red-600 mt-1">Rp 1.890.000</p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: OPERATOR KASIR */}
          {viewMode === 'OPERATOR' && operatorRole === 'KASIR' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-full">

              {/* LAYAR UTAMA KATALOG BARANG */}
              <div className={`flex-1 p-5 sm:p-6 flex flex-col space-y-4 overflow-hidden h-full ${mobileActiveTab === 'KERANJANG' ? 'hidden md:flex' : 'flex'
                }`}>
                {/* Search & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                  <div>
                    <h1 className="text-xl font-bold text-stone-900 tracking-tight">Katalog Menu</h1>
                    <p className="text-xs text-stone-400">Tekan item menu untuk dimasukkan keranjang belanja</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari masakan / scan SKU..."
                    className="bg-white border border-stone-200/80 rounded-xl px-4 py-2 text-xs w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40 transition shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Kategori Horizontal Scroll */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 shrink-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition shadow-sm ${selectedCategory === null ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-100'
                      }`}
                  >
                    ✨ Semua Menu
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition shadow-sm ${selectedCategory === cat.id ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-100'
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Grid Item Cards */}
                <div className="flex-1 overflow-y-auto pr-1">
                  {loading ? (
                    <div className="text-center py-16 text-xs text-stone-400 font-mono animate-pulse">Menghubungkan ke TiDB Server...</div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-16 text-xs text-stone-400">Menu masakan belum terdaftar.</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-24 md:pb-6">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="bg-white border border-stone-200/70 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-600/40 hover:shadow-md cursor-pointer transition duration-200 group active:scale-[0.97]"
                        >
                          <div>
                            <span className="text-[9px] font-mono font-bold text-stone-400 block tracking-wider uppercase">{product.sku}</span>
                            <h3 className="font-semibold text-xs text-stone-800 line-clamp-2 mt-1 group-hover:text-emerald-700 transition">{product.name}</h3>
                          </div>
                          <div className="mt-4 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-900 font-mono">{formatRupiah(Number(product.price_sell))}</span>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg opacity-0 sm:group-hover:opacity-100 transition">+ ADD</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🛒 FLOATING MOBILE CART BAR (HP ONLY) */}
                {totalCartItems > 0 && (
                  <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
                    <button
                      onClick={() => setMobileActiveTab('KERANJANG')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xl shadow-emerald-900/10 font-semibold text-xs active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-white/20 px-2 py-0.5 rounded-md font-mono">🛒 {totalCartItems}</span>
                        <span>Item ({fulfillmentMethod === 'DIKIRIM' ? 'Kirim' : 'Ambil'})</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                        <span>{formatRupiah(calculateTotal())}</span>
                        <span>➔</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* SIDEBAR KERANJANG BELANJA (DESKTOP / MOBILE FULL PAGE) */}
              <div className={`w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-stone-200 flex flex-col h-full shrink-0 ${mobileActiveTab === 'KERANJANG' ? 'flex animate-in fade-in slide-in-from-right duration-200' : 'hidden md:flex'
                }`}>
                {/* Header Keranjang */}
                <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/40 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMobileActiveTab('KATALOG')}
                      className="md:hidden bg-stone-100 p-1.5 text-stone-600 rounded-xl text-xs font-bold mr-1 active:scale-95 transition"
                    >
                      ❮ Katalog
                    </button>
                    <h2 className="font-bold text-sm text-stone-900">Keranjang Belanja</h2>
                  </div>
                  {cart.length > 0 && (
                    <button onClick={() => setCart([])} className="text-xs text-stone-400 hover:text-red-500 font-medium transition">
                      Kosongkan
                    </button>
                  )}
                </div>

                {/* List Item Belanja */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-stone-300 py-20 text-center space-y-2">
                      <span className="text-3xl">🛒</span>
                      <p className="text-xs font-medium text-stone-400">Keranjang belanja kosong.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between gap-3 border-b border-stone-50 pb-3 last:border-0">
                        <div className="space-y-0.5 flex-1">
                          <h4 className="text-xs font-semibold text-stone-800 line-clamp-2 leading-relaxed">{item.product.name}</h4>
                          <p className="text-[10px] text-stone-400 font-mono font-medium">{formatRupiah(Number(item.product.price_sell))}</p>
                        </div>

                        {/* +/- Controls Counter */}
                        <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50 shrink-0 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="px-2.5 py-1 text-xs font-bold hover:bg-stone-200 text-stone-500 transition"
                          >
                            -
                          </button>
                          <span className="px-1 text-xs font-bold text-stone-800 font-mono w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="px-2.5 py-1 text-xs font-bold hover:bg-stone-200 text-stone-500 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 🏬 INTERFACES: OPSI RULE AMBIL TOKO ATAU DIKIRIM (SANGAT DESIGNER LOOK) */}
                <div className="p-4 bg-stone-50 border-t border-stone-200/60 space-y-4 shrink-0">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-stone-400 font-bold block">
                      Metode Penyerahan Pesanan
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-stone-200/40 p-1 rounded-xl border border-stone-200/20">
                      <button
                        type="button"
                        onClick={() => setFulfillmentMethod('AMBIL_TOKO')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${fulfillmentMethod === 'AMBIL_TOKO'
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-400 hover:text-stone-600'
                          }`}
                      >
                        🏬 Ambil Toko
                      </button>
                      <button
                        type="button"
                        onClick={() => setFulfillmentMethod('DIKIRIM')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${fulfillmentMethod === 'DIKIRIM'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-stone-400 hover:text-stone-600'
                          }`}
                      >
                        🏍️ Kirim Kurir
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-stone-200/50 my-1"></div>

                  {/* Summary & Checkout Button */}
                  <div className="flex items-center justify-between font-semibold text-stone-900 text-xs">
                    <span className="text-stone-400 uppercase tracking-wider text-[10px] font-bold">Total Tagihan</span>
                    <span className="text-base text-emerald-700 font-mono font-bold">{formatRupiah(calculateTotal())}</span>
                  </div>

                  <button
                    disabled={cart.length === 0}
                    onClick={() => {
                      setIsCheckoutModalOpen(true);
                      setCheckoutStep('MENU');
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition duration-200 tracking-wider uppercase shadow-sm ${cart.length > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99]'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                  >
                    Proses Struk Penjualan
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* VIEW: OPERATOR LAYAR DAPUR */}
          {viewMode === 'OPERATOR' && operatorRole === 'DAPUR' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-20 md:pb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">🍳 MONITORING ANTREAN MASAK</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between border-b border-stone-100 pb-2 mb-2 text-xs">
                    <span className="font-mono font-bold text-stone-900">ORDER #1042</span>
                    <span className="text-[10px] font-mono font-bold text-stone-400 uppercase bg-stone-100 px-2 py-0.5 rounded-md">🏬 AMBIL TOKO</span>
                  </div>
                  <p className="text-xs font-bold text-stone-800 leading-relaxed">4x Platter Cireng Crispy Daun Jeruk</p>
                  <p className="text-[10px] text-stone-400 font-medium mt-2">Lokasi Tunggu: Meja Bar No. 03</p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: OPERATOR LOGISTIK KURIR */}
          {viewMode === 'OPERATOR' && operatorRole === 'KURIR' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-20 md:pb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">🏍️ MANAGEMENT DISTRIBUSI KURIR</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-sm border-l-4 border-l-emerald-500">
                  <div className="flex justify-between border-b border-stone-100 pb-2 mb-2 text-xs">
                    <span className="font-mono font-bold text-stone-900">ORDER #1043</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">🏍️ DIKIRIM</span>
                  </div>
                  <p className="text-xs font-bold text-stone-800 leading-relaxed">2x Kopi Susu Aren Gede Asayori</p>
                  <p className="text-[10px] text-stone-400 mt-2 font-medium">Status Pengiriman: Menunggu kurir mengambil barang.</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── 1.a. BOTTOM NAVIGATION BAR (HP ONLY: AKTIF JIKA ROLE BUKAN KASIR) ─── */}
          {viewMode === 'OPERATOR' && (operatorRole === 'DAPUR' || operatorRole === 'KURIR') && (
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200/80 px-4 py-2 flex items-center justify-around z-40 shadow-xl shrink-0">
              {operatorRole === 'DAPUR' ? (
                <>
                  <BottomNavItem icon="🍳" label="Antrean Masak" active={true} />
                  <BottomNavItem icon="✅" label="Selesai Diolah" />
                </>
              ) : (
                <>
                  <BottomNavItem icon="🏍️" label="Siap Berangkat" active={true} />
                  <BottomNavItem icon="🏁" label="Sampai Tujuan" />
                </>
              )}
            </nav>
          )}

        </main>
      </div>

      {/* ─── MODAL CHECKOUT ESTETIK ─── */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div className="bg-white border border-stone-200/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all transform scale-100 animate-in zoom-in-95 duration-200 text-stone-800">

            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-stone-900 tracking-tight">Pilih Cara Pembayaran</h3>
                <p className="text-[10px] text-stone-400 font-medium">Selesaikan transaksi keranjang belanja Anda</p>
              </div>
              <button
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  setCheckoutStep('MENU');
                  setCashReceived('');
                }}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Total Display */}
            <div className="bg-stone-950 p-6 text-center shrink-0">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block mb-1">TOTAL TAGIHAN</span>
              <span className="text-3xl font-black font-mono text-white tracking-tight">{formatRupiah(calculateTotal())}</span>
            </div>

            {/* Modal Body / Steps */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* STEP 1: MAIN MENU SELECTION */}
              {checkoutStep === 'MENU' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setSelectedFulfillment(fulfillmentMethod);
                      setCheckoutStep('PESANAN');
                    }}
                    className="p-5 border border-amber-200 hover:border-amber-400 bg-amber-50/20 hover:bg-amber-50/60 rounded-2xl flex flex-col items-center text-center group transition duration-200 active:scale-[0.97]"
                  >
                    <span className="text-3xl mb-2.5 transition duration-200 group-hover:scale-110">📝</span>
                    <span className="font-bold text-xs text-stone-900">Pesanan</span>
                    <span className="text-[9px] text-stone-400 mt-1 font-medium leading-normal">Simpan nota pending / antrean</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFulfillment(fulfillmentMethod);
                      setCheckoutStep('LUNAS');
                    }}
                    className="p-5 border border-emerald-200 hover:border-emerald-400 bg-emerald-50/20 hover:bg-emerald-50/60 rounded-2xl flex flex-col items-center text-center group transition duration-200 active:scale-[0.97]"
                  >
                    <span className="text-3xl mb-2.5 transition duration-200 group-hover:scale-110">💰</span>
                    <span className="font-bold text-xs text-stone-900">Lunas</span>
                    <span className="text-[9px] text-stone-400 mt-1 font-medium leading-normal">Bayar langsung lunas</span>
                  </button>

                  <button
                    onClick={() => {
                      setCheckoutStep('GABUNG');
                      fetchPendingSales();
                    }}
                    className="p-5 border border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/60 rounded-2xl flex flex-col items-center text-center group transition duration-200 active:scale-[0.97]"
                  >
                    <span className="text-3xl mb-2.5 transition duration-200 group-hover:scale-110">🔗</span>
                    <span className="font-bold text-xs text-stone-900">Gabung Pesanan</span>
                    <span className="text-[9px] text-stone-400 mt-1 font-medium leading-normal">Merge dengan nota gantung</span>
                  </button>

                  <button
                    onClick={() => setCheckoutStep('PIUTANG')}
                    className="p-5 border border-rose-200 hover:border-rose-400 bg-rose-50/20 hover:bg-rose-50/60 rounded-2xl flex flex-col items-center text-center group transition duration-200 active:scale-[0.97]"
                  >
                    <span className="text-3xl mb-2.5 transition duration-200 group-hover:scale-110">📒</span>
                    <span className="font-bold text-xs text-stone-900">Piutang</span>
                    <span className="text-[9px] text-stone-400 mt-1 font-medium leading-normal">Catat tagihan / SIXTY</span>
                  </button>
                </div>
              )}

              {/* STEP 2: PESANAN OPTIONS */}
              {checkoutStep === 'PESANAN' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-stone-400 font-bold block">Fulfillment Method</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200/50">
                      <button
                        onClick={() => setSelectedFulfillment('AMBIL_TOKO')}
                        className={`py-2 text-xs font-bold rounded-lg transition ${selectedFulfillment === 'AMBIL_TOKO' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                          }`}
                      >
                        🏬 Ambil Toko
                      </button>
                      <button
                        onClick={() => setSelectedFulfillment('DIKIRIM')}
                        className={`py-2 text-xs font-bold rounded-lg transition ${selectedFulfillment === 'DIKIRIM' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'
                          }`}
                      >
                        🏍️ Kirim Kurir
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-stone-400 font-bold block">Nama Pelanggan (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama pelanggan / no. meja..."
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition shadow-sm text-stone-850"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-stone-100">
                    <button
                      onClick={() => setCheckoutStep('MENU')}
                      className="flex-1 py-3 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 font-bold text-xs transition"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={() => handleCheckoutSubmit('PESANAN')}
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400"
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan Pesanan'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: LUNAS OPTIONS */}
              {checkoutStep === 'LUNAS' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-stone-400 font-bold block">Metode Pembayaran</label>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200/50">
                      <button
                        onClick={() => setSelectedPaymentMethod('CASH')}
                        className={`py-2 text-[10px] font-bold rounded-lg transition ${selectedPaymentMethod === 'CASH' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                          }`}
                      >
                        💵 Tunai
                      </button>
                      <button
                        onClick={() => setSelectedPaymentMethod('QRIS')}
                        className={`py-2 text-[10px] font-bold rounded-lg transition ${selectedPaymentMethod === 'QRIS' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                          }`}
                      >
                        📱 QRIS
                      </button>
                      <button
                        onClick={() => setSelectedPaymentMethod('TRANSFER')}
                        className={`py-2 text-[10px] font-bold rounded-lg transition ${selectedPaymentMethod === 'TRANSFER' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                          }`}
                      >
                        🏦 Transfer
                      </button>
                    </div>
                  </div>

                  {selectedPaymentMethod === 'CASH' && (
                    <div className="space-y-3 p-4 bg-stone-50 border border-stone-200/60 rounded-2xl">
                      <label className="text-[9px] uppercase font-mono tracking-widest text-stone-400 font-bold block">Kalkulator Uang Diterima</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Masukkan jumlah uang..."
                          className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition shadow-sm text-stone-850"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                        />
                        <button
                          onClick={() => setCashReceived(String(calculateTotal()))}
                          className="px-3 bg-white border border-stone-200 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 transition"
                        >
                          Uang Pas
                        </button>
                      </div>

                      {/* Tombol Nominal Cepat */}
                      <div className="grid grid-cols-3 gap-2">
                        {[50000, 100000, 200000].map((nominal) => (
                          <button
                            key={nominal}
                            onClick={() => setCashReceived(String(nominal))}
                            className="py-1.5 bg-white border border-stone-200/80 rounded-lg text-[10px] font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition"
                          >
                            {formatRupiah(nominal)}
                          </button>
                        ))}
                      </div>

                      {/* Kembalian Real-time */}
                      {Number(cashReceived) >= calculateTotal() && (
                        <div className="flex justify-between items-center pt-2.5 border-t border-stone-200/50 text-xs">
                          <span className="text-stone-500">Uang Kembalian:</span>
                          <span className="font-bold text-sm text-emerald-700 font-mono">{formatRupiah(calculateChange())}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-stone-400 font-bold block">Nama Pelanggan (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama pelanggan / no. meja..."
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition shadow-sm text-stone-850"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-stone-100">
                    <button
                      onClick={() => setCheckoutStep('MENU')}
                      className="flex-1 py-3 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 font-bold text-xs transition"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={() => handleCheckoutSubmit('LUNAS')}
                      disabled={isSubmitting || (selectedPaymentMethod === 'CASH' && Number(cashReceived) < calculateTotal())}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Memproses...' : 'Bayar Lunas'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: GABUNG PESANAN OPTIONS */}
              {checkoutStep === 'GABUNG' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-stone-400 font-bold block">Pilih Nota Gantung / Meja</label>

                    {isLoadingPendingSales ? (
                      <div className="text-center py-8 text-xs text-stone-400 font-mono animate-pulse">Memuat pesanan gantung...</div>
                    ) : pendingSales.length === 0 ? (
                      <div className="border border-dashed border-stone-200 rounded-2xl p-8 text-center text-xs text-stone-400">
                        Tidak ada pesanan gantung aktif.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {pendingSales.map((saleItem) => (
                          <div
                            key={saleItem.id}
                            onClick={() => setSelectedPendingSaleId(saleItem.id)}
                            className={`p-3.5 border rounded-2xl cursor-pointer text-left transition ${selectedPendingSaleId === saleItem.id
                                ? 'border-indigo-600 bg-indigo-50/30'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                              }`}
                          >
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-stone-900 font-mono">{saleItem.invoice_no}</span>
                              <span className="text-indigo-700 font-mono">{formatRupiah(Number(saleItem.total_amount))}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1 font-medium">
                              <span>Pelanggan: {saleItem.customer?.name || '-'}</span>
                              <span>{new Date(saleItem.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            {/* Ringkasan Item */}
                            <div className="text-[9px] text-stone-500/85 mt-2 border-t border-stone-100 pt-1.5 truncate">
                              {saleItem.sale_details.map((sd: any) => `${sd.qty}x ${sd.product?.name}`).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-stone-100">
                    <button
                      onClick={() => setCheckoutStep('MENU')}
                      className="flex-1 py-3 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 font-bold text-xs transition"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={() => handleCheckoutSubmit('GABUNG')}
                      disabled={isSubmitting || !selectedPendingSaleId}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Menggabungkan...' : 'Gabung ke Nota'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: PIUTANG OPTIONS */}
              {checkoutStep === 'PIUTANG' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-stone-400 font-bold block">
                      Nama Pelanggan / Entitas <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama pelanggan (Wajib untuk Piutang)..."
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition shadow-sm text-stone-850"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-[10px] text-rose-800 leading-relaxed">
                    📒 Transaksi ini akan ditandai sebagai <b>Piutang</b>. Jumlah dibayarkan diset <b>Rp 0</b> dan tagihan didaftarkan atas nama pelanggan di atas dalam modul keuangan/SIXTY.
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-stone-100">
                    <button
                      onClick={() => setCheckoutStep('MENU')}
                      className="flex-1 py-3 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 font-bold text-xs transition"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={() => handleCheckoutSubmit('PIUTANG')}
                      disabled={isSubmitting || !customerName.trim()}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Mencatat...' : 'Catat sebagai Piutang'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-Komponen Desktop Sidebar Item
function SidebarItem({ icon, label, minimized, active = false }: { icon: string; label: string; minimized: boolean; active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all duration-150 ${active
        ? 'bg-stone-900 text-white shadow-sm'
        : 'text-stone-500 hover:bg-stone-100/70 hover:text-stone-900 active:scale-[0.98]'
      }`}>
      <span className="text-sm shrink-0">{icon}</span>
      {!minimized && <span className="truncate tracking-wide font-medium">{label}</span>}
    </button>
  );
}

// Sub-Komponen Mobile Bottom Navigation Item
function BottomNavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <button className="flex flex-col items-center justify-center py-1 px-3 text-center transition active:scale-95">
      <span className="text-base">{icon}</span>
      <span className={`text-[9px] font-bold tracking-tight mt-1 ${active ? 'text-emerald-700' : 'text-stone-400'}`}>
        {label}
      </span>
    </button>
  );
}