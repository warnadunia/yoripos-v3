'use client';

// src/app/pos/page.tsx (Full Fixed - POS Minimalist Cashier Core Interface)
import { useState, useEffect } from 'react';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Ambil Data Kategori & Produk Awal dari API (Fixed Syntax Typo Here)
  useEffect(() => {
    async function initPOS() {
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
    initPOS();
  }, []); // <-- Sudah aman, murni, dan dijamin lolos build compiler!

  // 2. Fetch Ulang Produk Jika Filter Kategori / Pencarian Berubah
  useEffect(() => {
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
    
    // Berikan sedikit jeda waktu panggil jika user sedang mengetik (basic debounce)
    const delayDebounce = setTimeout(() => {
      filterProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery]);

  // 3. Logika Manajemen Keranjang Belanja (Cart Logic)
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
            const newQty = item.quantity + amount;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0) // Jika qty 0, otomatis ditendang dari keranjang
    );
  };

  // 4. Kalkulasi Total Belanjaan
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number(item.product.price_sell);
      return total + price * item.quantity;
    }, 0);
  };

  // Helper Format Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col md:flex-row font-sans">
      
      {/* BAGIAN KIRI: KATALOG & NAVIGASI (70% Lebar Layar) */}
      <div className="flex-1 p-6 flex flex-col space-y-6">
        
        {/* Header & Kolom Pencarian */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">YoriPOS V3</h1>
            <p className="text-sm text-stone-500">Layar Utama Kasir Penjualan</p>
          </div>
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Cari menu atau scan barcode SKU..."
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Filter Kategori */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition ${
              selectedCategory === null
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white border border-stone-200 hover:bg-stone-100 text-stone-600'
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white border border-stone-200 hover:bg-stone-100 text-stone-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid Item Katalog Produk */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20 text-stone-400 text-sm">
            Sedang mengambil amunisi menu dari TiDB Cloud...
          </div>
        ) : products.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20 text-stone-400 text-sm">
            Menu tidak ditemukan atau kosong.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white border border-stone-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-600/40 hover:shadow-md cursor-pointer transition group"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase block">
                    {product.sku}
                  </span>
                  <h3 className="font-medium text-sm text-stone-800 line-clamp-2 group-hover:text-emerald-700 transition">
                    {product.name}
                  </h3>
                </div>
                <div className="mt-4 pt-2 border-t border-stone-50 flex items-center justify-between">
                  <span className="font-semibold text-sm text-stone-900">
                    {formatRupiah(Number(product.price_sell))}
                  </span>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium opacity-0 group-hover:opacity-100 transition">
                    + Tambah
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BAGIAN KANAN: SIDEBAR KERANJANG BELANJA (30% Lebar Layar) */}
      <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-stone-200 flex flex-col h-auto md:h-screen sticky top-0">
        
        {/* Header Keranjang */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-stone-900">Keranjang Belanja</h2>
            <span className="bg-stone-100 text-stone-600 text-xs px-2 py-0.5 rounded-full font-semibold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs text-stone-400 hover:text-red-500 transition">
              Bersihkan
            </button>
          )}
        </div>

        {/* List Item Belanjaan */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px] md:min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2 py-10">
              <span className="text-2xl">🛒</span>
              <p className="text-xs">Keranjang masih kosong, klik menu di kiri.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex items-start justify-between gap-2 border-b border-stone-50 pb-3 last:border-0">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-medium text-stone-800 line-clamp-2">{item.product.name}</h4>
                  <p className="text-[11px] text-stone-500">{formatRupiah(Number(item.product.price_sell))}</p>
                </div>
                
                {/* Tombol Pengatur Jumlah Kuantitas */}
                <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="px-2.5 py-1 text-xs font-semibold hover:bg-stone-200 transition text-stone-600"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-medium text-stone-800 font-mono w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="px-2.5 py-1 text-xs font-semibold hover:bg-stone-200 transition text-stone-600"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ringkasan & Tombol Eksekusi Bayar */}
        <div className="p-4 bg-stone-50/80 border-t border-stone-200/60 space-y-4">
          <div className="flex items-center justify-between font-semibold text-stone-900">
            <span>Total Bayar</span>
            <span className="text-lg text-emerald-700 font-mono">{formatRupiah(calculateTotal())}</span>
          </div>
          
          <button
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-xl font-medium text-sm transition shadow-sm ${
              cart.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99]'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
            onClick={() => alert('Siap merakit API Simpan Nota & Potong Stok Batches!')}
          >
            Proses Transaksi (Checkout)
          </button>
        </div>

      </div>
    </div>
  );
}