'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Category { id: number; name: string; }
interface Product { id: number; sku: string; name: string; price_sell: string | number; category_id: number; total_stock: number; image_url?: string | null; }
interface CartItem { product: Product; quantity: number; }

export default function PosView({ onBack }: { onBack: () => void }) {
    // ─── STATE DATA API ───
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ─── STATE FILTER & SEARCH ───
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // ─── STATE UI & CHECKOUT ───
    const [activeModal, setActiveModal] = useState('none'); // 'none' | 'cart_checkout' | 'success'
    const [fulfillmentMethod, setFulfillmentMethod] = useState<'AMBIL_TOKO' | 'DIKIRIM'>('AMBIL_TOKO');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [lastInvoice, setLastInvoice] = useState('');

    // ─── FUNGSI FORMAT ───
    const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    // ─── FUNGSI FETCH API LOKAL ───
    const loadInitialData = useCallback(async () => {
        try {
            setLoading(true);
            const [catRes, prodRes] = await Promise.all([
                fetch('/api/categories?exclude_bahan=true'),
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
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // ─── FUNGSI KERANJANG ───
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: number, amount: number) => {
        setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + amount } : i).filter(i => i.quantity > 0));
    };

    const calculateTotal = () => cart.reduce((t, i) => t + Number(i.product.price_sell) * i.quantity, 0);
    const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);

    // ─── FUNGSI SUBMIT KE API CHECKOUT ───
    const handleCheckoutSubmit = async () => {
        if (cart.length === 0 || isSubmitting) return;
        try {
            setIsSubmitting(true);
            const payload: any = { cart, fulfillment_method: fulfillmentMethod };
            if (customerName.trim()) payload.customer_name = customerName;
            if (customerPhone.trim()) payload.customer_phone = customerPhone;
            if (deliveryAddress.trim()) payload.delivery_address = deliveryAddress;

            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (res.ok && result.success) {
                setLastInvoice(result.data.invoice_no);
                setCart([]);
                setCustomerName('');
                setCustomerPhone('');
                setDeliveryAddress('');
                setActiveModal('success');
            } else {
                alert('Gagal: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Kendala jaringan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── FILTER LOKAL ───
    const filteredProducts = products.filter(p => {
        const matchCat = selectedCategory ? p.category_id === selectedCategory : true;
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="fixed inset-0 z-50 bg-stone-50 flex flex-col h-screen overflow-hidden animate-slideUp">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* ─── HEADER POS ─── */}
            <header className="bg-emerald-500 pt-4 pb-3 px-4 flex items-center gap-3 text-white shadow-sm shrink-0">
                <button onClick={onBack} className="p-2 bg-emerald-600 rounded-full hover:bg-emerald-700 active:scale-95 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex-1">
                    <h1 className="text-base font-bold">POS / Kasir</h1>
                    <p className="text-[10px] text-emerald-100 font-medium tracking-wide uppercase">Pilih Menu Pesanan</p>
                </div>
            </header>

            {/* ─── SEARCH & KATEGORI ─── */}
            <div className="bg-white px-4 py-3 shadow-sm z-10 shrink-0 border-b border-stone-100">
                <div className="relative mb-3">
                    <input
                        type="text"
                        placeholder="Cari nama menu / SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                    <svg className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                <div className="flex overflow-x-auto gap-2 hide-scrollbar">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${selectedCategory === null ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-500 border border-stone-200'}`}
                    >
                        Semua
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${selectedCategory === cat.id ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-500 border border-stone-200'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── GRID KATALOG PRODUK ─── */}
            <div className="flex-1 overflow-y-auto p-4 bg-stone-50 pb-28">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-stone-400 animate-pulse">
                        <span className="text-2xl mb-2">🍽️</span>
                        <p className="text-xs font-bold uppercase tracking-widest">Memuat Menu...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-stone-400">
                        <p className="text-xs font-bold uppercase tracking-widest">Menu tidak ditemukan</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {filteredProducts.map(product => {
                            const cartItem = cart.find(c => c.product.id === product.id);
                            return (
                                <div key={product.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm flex flex-col active:scale-[0.98] transition-transform">
                                    <div className="aspect-square bg-stone-100 flex items-center justify-center relative overflow-hidden">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl opacity-20">🍽️</span>
                                        )}
                                        {/* Badge Stok */}
                                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] font-bold text-stone-600 border border-white/50 shadow-sm">
                                            Stok: <span className={product.total_stock > 5 ? 'text-emerald-600' : 'text-rose-500'}>{product.total_stock}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 flex-1 flex flex-col justify-between">
                                        <div>
                                            <span className="text-[9px] font-mono font-bold text-stone-400 tracking-wider block">{product.sku}</span>
                                            <h3 className="text-xs font-bold text-stone-800 leading-tight mt-0.5 line-clamp-2">{product.name}</h3>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-xs font-black text-emerald-600 font-mono">{formatRupiah(Number(product.price_sell))}</span>

                                            {cartItem ? (
                                                <div className="flex items-center bg-emerald-50 rounded-lg border border-emerald-100 overflow-hidden">
                                                    <button onClick={() => updateQuantity(product.id, -1)} className="w-6 h-6 flex items-center justify-center text-emerald-600 font-bold active:bg-emerald-200">-</button>
                                                    <span className="text-[10px] font-bold w-4 text-center text-emerald-800">{cartItem.quantity}</span>
                                                    <button onClick={() => updateQuantity(product.id, 1)} className="w-6 h-6 flex items-center justify-center text-emerald-600 font-bold active:bg-emerald-200">+</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => addToCart(product)} className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg active:bg-emerald-600 shadow-sm">
                                                    + TAMBAH
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─── FLOATING CART BUTTON ─── */}
            {totalCartItems > 0 && activeModal === 'none' && (
                <div className="fixed bottom-6 left-4 right-4 z-40 animate-slideUp">
                    <button
                        onClick={() => setActiveModal('cart_checkout')}
                        className="w-full bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-[0_8px_20px_rgba(5,150,105,0.4)] active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 px-3 py-1 rounded-xl text-xs font-bold font-mono border border-white/20">
                                {totalCartItems} ITEM
                            </div>
                            <span className="text-sm font-bold">Lanjut Proses</span>
                        </div>
                        <span className="text-base font-black font-mono tracking-wide">{formatRupiah(calculateTotal())} ➔</span>
                    </button>
                </div>
            )}

            {/* ========================================================================= */}
            {/* OVERLAYS / BOTTOM SHEETS SECTION (KERANJANG & CHECKOUT)                   */}
            {/* ========================================================================= */}
            {activeModal !== 'none' && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center">
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => activeModal === 'cart_checkout' && setActiveModal('none')}></div>

                    {/* 1. M O D A L : K E R A N J A N G   &   C H E C K O U T */}
                    {activeModal === 'cart_checkout' && (
                        <div className="relative w-full h-[90vh] max-w-md bg-white rounded-t-3xl shadow-2xl animate-slideUp flex flex-col">
                            {/* Drag Handle */}
                            <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto my-4 shrink-0"></div>

                            <div className="flex justify-between items-center px-5 pb-4 border-b border-stone-100 shrink-0">
                                <h3 className="text-lg font-bold text-stone-800">Keranjang Pesanan</h3>
                                <button onClick={() => setActiveModal('none')} className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center font-bold">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto hide-scrollbar p-5 space-y-6">
                                {/* Daftar Item */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Rincian Menu</h4>
                                    <div className="space-y-3 border border-stone-100 rounded-2xl p-4 bg-stone-50/50">
                                        {cart.map(item => (
                                            <div key={item.product.id} className="flex justify-between items-center pb-3 border-b border-stone-100 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="text-xs font-bold text-stone-800">{item.product.name}</p>
                                                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">{formatRupiah(Number(item.product.price_sell))} / item</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center bg-white rounded-lg border border-stone-200 overflow-hidden shadow-sm">
                                                        <button onClick={() => updateQuantity(item.product.id, -1)} className="w-7 h-7 flex items-center justify-center text-stone-600 font-bold hover:bg-stone-100">-</button>
                                                        <span className="text-xs font-bold w-6 text-center text-stone-800">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.product.id, 1)} className="w-7 h-7 flex items-center justify-center text-emerald-600 font-bold hover:bg-emerald-50">+</button>
                                                    </div>
                                                    <span className="text-xs font-bold font-mono w-20 text-right text-stone-800">
                                                        {formatRupiah(Number(item.product.price_sell) * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Form Pelanggan & Pengiriman */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Detail Penyerahan</h4>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <button
                                            onClick={() => setFulfillmentMethod('AMBIL_TOKO')}
                                            className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${fulfillmentMethod === 'AMBIL_TOKO' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-stone-100 text-stone-500 hover:bg-stone-50'}`}
                                        >
                                            Ambil Toko
                                        </button>
                                        <button
                                            onClick={() => setFulfillmentMethod('DIKIRIM')}
                                            className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${fulfillmentMethod === 'DIKIRIM' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-stone-100 text-stone-500 hover:bg-stone-50'}`}
                                        >
                                            Dikirim (Delivery)
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Nama Pelanggan (Opsional)"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="No WhatsApp (Opsional)"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500"
                                        />
                                        {fulfillmentMethod === 'DIKIRIM' && (
                                            <textarea
                                                placeholder="Alamat Lengkap Pengiriman *"
                                                value={deliveryAddress}
                                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                                rows={2}
                                                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 resize-none"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-stone-100 bg-white shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Total Tagihan</span>
                                    <span className="text-xl font-black text-emerald-600 font-mono">{formatRupiah(calculateTotal())}</span>
                                </div>
                                <button
                                    onClick={handleCheckoutSubmit}
                                    disabled={isSubmitting || (fulfillmentMethod === 'DIKIRIM' && !deliveryAddress.trim())}
                                    className="w-full bg-emerald-600 text-white rounded-xl py-3.5 text-sm font-bold shadow-md hover:bg-emerald-700 active:scale-95 transition-transform disabled:opacity-50 disabled:bg-stone-400"
                                >
                                    {isSubmitting ? 'MEMPROSES...' : 'KIRIM KE DAPUR'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. M O D A L : S U C C E S S   O R D E R */}
                    {activeModal === 'success' && (
                        <div className="relative w-full max-w-md bg-emerald-500 rounded-t-3xl p-8 pb-28 shadow-2xl flex flex-col items-center justify-center animate-slideUp text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                                <span className="text-4xl">✅</span>
                            </div>
                            <h2 className="text-white text-2xl font-black mb-2">Pesanan Masuk!</h2>
                            <p className="text-emerald-100 text-xs mb-6">Pesanan telah berhasil diteruskan ke Dapur untuk disiapkan.</p>

                            <div className="bg-white/20 border border-white/30 backdrop-blur-md rounded-2xl p-4 w-full mb-8">
                                <p className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold mb-1">Nomor Pesanan</p>
                                <p className="text-xl font-mono font-black text-white">{lastInvoice}</p>
                            </div>

                            <button
                                onClick={() => {
                                    setActiveModal('none');
                                    onBack(); // Kembali ke Dashboard setelah sukses
                                }}
                                className="w-full bg-white text-emerald-700 rounded-xl py-3.5 text-sm font-bold shadow-md active:scale-95 transition-transform"
                            >
                                Kembali ke Dashboard
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}