'use client';

import React, { useState, useEffect, useRef } from 'react';

type CheckoutStage = 'cart' | 'prep' | 'payment' | 'delivery_success' | 'sukses_bayar' | null;
type ViewMode = 'list' | 'grid';

export default function PosView({ onBack }: { onBack: () => void }) {
    // === STATES ===
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [cart, setCart] = useState<{ id: number, name: string, price: number, qty: number }[]>([]);

    // Checkout States
    const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>(null);
    const [searchCustomer, setSearchCustomer] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [backdate, setBackdate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const dropdownRef = useRef<HTMLDivElement>(null);

    // === DUMMY DATA ===
    const categories = ['Semua', 'Minuman', 'Makanan', 'Snack', 'Paket'];

    const products = [
        { id: 1, sku: 'KP002', name: 'Americano Ice', price: 18000, category: 'Minuman' },
        { id: 2, sku: 'SN001', name: 'Croissant Butter', price: 15000, category: 'Snack' },
        { id: 3, sku: 'PK001', name: 'Paket Nasi Kuning', price: 25000, category: 'Paket' },
        { id: 4, sku: 'MK002', name: 'Telur AKAM Herbal', price: 5000, category: 'Makanan' },
        { id: 5, sku: 'MN005', name: 'Teh Es Manis', price: 7000, category: 'Minuman' },
        { id: 6, sku: 'SN003', name: 'Bakpia 3 Generasi', price: 35000, category: 'Snack' },
    ];

    const [customers, setCustomers] = useState([
        { id: 1, name: 'Agam Warmindo', phone: '08123456789' },
        { id: 2, name: 'Lisa Untari', phone: '08512345678' },
        { id: 3, name: 'SS Telur', phone: '08987654321' },
    ]);

    // === LOGIC FUNCTIONS ===
    const filteredProducts = products.filter(p => activeCategory === 'Semua' || p.category === activeCategory);
    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchCustomer.toLowerCase()));

    const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const handleAddToCart = (product: any) => {
        setCart(prev => [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }]);
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item =>
            item.id === id ? { ...item, qty: item.qty + delta } : item
        ).filter(item => item.qty > 0));
    };

    // Auto-Close Keranjang jika semua item dihapus
    useEffect(() => {
        if (cart.length === 0 && checkoutStage !== null && checkoutStage !== 'delivery_success' && checkoutStage !== 'sukses_bayar') {
            resetCheckout();
        }
    }, [cart.length, checkoutStage]);

    const handleSelectCustomer = (customer: any) => {
        setSearchCustomer(customer.name);
        setCustomerPhone(customer.phone);
        setShowCustomerDropdown(false);
    };

    const handleAddNewCustomer = () => {
        const newCustomer = { id: Date.now(), name: searchCustomer, phone: '' };
        setCustomers(prev => [...prev, newCustomer]);
        setShowCustomerDropdown(false);
        alert(`Pelanggan "${searchCustomer}" otomatis tersimpan di database!`);
    };

    const resetCheckout = () => {
        setCheckoutStage(null);
        setPaymentMethod('');
    };

    const completeTransaction = () => {
        setCart([]);
        resetCheckout();
    };

    // Close dropdown click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowCustomerDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col font-sans">
            {/* Animasi kustom dihapus total untuk menghindari GPU tearing di Android */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; } 
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />

            {/* === HEADER === */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm gap-3">
                <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>

                <div className="flex-1 relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Cari menu..." className="w-full bg-slate-100 border-none rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>

                {/* VIEW TOGGLE (GRID/LIST) */}
                <button
                    onClick={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
                    className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors transform-gpu active:scale-95"
                >
                    {viewMode === 'list' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    )}
                </button>
            </div>

            {/* === KATEGORI FILTER === */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0">
                <div className="flex overflow-x-auto gap-2 hide-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors transform-gpu active:scale-95 ${activeCategory === cat ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* === PRODUCT CATALOG === */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-slate-50">
                {/* Dibuat se-simple mungkin tanpa key/animasi berat biar gak glitch */}
                <div className={`grid gap-3 pb-24 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {filteredProducts.map(product => {
                        const cartItem = cart.find(item => item.id === product.id);

                        return viewMode === 'grid' ? (
                            // --- GRID VIEW ---
                            <div key={product.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                                <div className="w-full h-24 bg-slate-100 rounded-xl mb-3 flex items-center justify-center border border-slate-200/60">
                                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{product.sku}</p>
                                    <p className="text-xs font-bold text-slate-800 leading-tight mb-1 line-clamp-2">{product.name}</p>
                                    <p className="text-xs font-black text-emerald-600 mb-3">Rp {product.price.toLocaleString('id-ID')}</p>
                                </div>
                                {cartItem ? (
                                    <div className="w-full flex items-center justify-between bg-emerald-50 rounded-xl border border-emerald-100 h-9 px-1">
                                        <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-full flex items-center justify-center text-emerald-600 font-black active:bg-emerald-200 rounded-lg text-lg transition-colors">-</button>
                                        <span className="text-xs font-bold text-emerald-900 w-6 text-center">{cartItem.qty}</span>
                                        <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-full flex items-center justify-center text-emerald-600 font-black active:bg-emerald-200 rounded-lg text-lg transition-colors">+</button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleAddToCart(product)} className="w-full bg-emerald-500 text-white text-[11px] font-bold py-2.5 rounded-xl shadow-sm hover:bg-emerald-600 active:scale-95 transition-all">
                                        + TAMBAH
                                    </button>
                                )}
                            </div>
                        ) : (
                            // --- LIST VIEW ---
                            <div key={product.id} className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                                <div className="flex-1 pr-4">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{product.sku}</p>
                                    <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{product.name}</p>
                                    <p className="text-xs font-black text-emerald-600">Rp {product.price.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="w-28 shrink-0">
                                    {cartItem ? (
                                        <div className="w-full flex items-center justify-between bg-emerald-50 rounded-xl border border-emerald-100 h-9 px-1">
                                            <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-full flex items-center justify-center text-emerald-600 font-black active:bg-emerald-200 rounded-lg text-lg transition-colors">-</button>
                                            <span className="text-xs font-bold text-emerald-900 w-6 text-center">{cartItem.qty}</span>
                                            <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-full flex items-center justify-center text-emerald-600 font-black active:bg-emerald-200 rounded-lg text-lg transition-colors">+</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleAddToCart(product)} className="w-full bg-emerald-500 text-white text-[11px] font-bold py-2.5 rounded-xl shadow-sm hover:bg-emerald-600 active:scale-95 transition-all">
                                            + TAMBAH
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* === FLOATING CART BUTTON === */}
            {totalCartItems > 0 && checkoutStage === null && (
                <div className="absolute bottom-6 left-0 right-0 px-4 z-10 animate-slideUp">
                    <button
                        onClick={() => setCheckoutStage('cart')}
                        className="w-full bg-slate-800 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between transform-gpu active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-800">{totalCartItems}</span>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Pesanan</p>
                                <p className="text-sm font-bold">Rp {totalCartPrice.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                            Lanjut <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </button>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MULTI-STEP CHECKOUT MODAL                                                 */}
            {/* ========================================================================= */}
            {checkoutStage !== null && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={resetCheckout}></div>

                    <div className="relative w-full h-[90vh] bg-white rounded-t-3xl shadow-2xl flex flex-col animate-slideUp transform-gpu backface-hidden will-change-transform">

                        {/* Header Drag & Close */}
                        <div className="p-5 border-b border-slate-100 shrink-0">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5"></div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    {checkoutStage !== 'cart' && checkoutStage !== 'delivery_success' && checkoutStage !== 'sukses_bayar' && (
                                        <button onClick={() => setCheckoutStage(checkoutStage === 'prep' ? 'cart' : 'prep')} className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-200">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                    )}
                                    <h2 className="text-lg font-bold text-slate-800">
                                        {checkoutStage === 'cart' && 'Keranjang Pesanan'}
                                        {checkoutStage === 'prep' && 'Siapkan Pesanan'}
                                        {checkoutStage === 'payment' && 'Pembayaran'}
                                        {checkoutStage === 'delivery_success' && 'Status Pesanan'}
                                        {checkoutStage === 'sukses_bayar' && 'Pesanan Selesai'}
                                    </h2>
                                </div>
                                <button onClick={resetCheckout} className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* --- CONTENT AREA (Scrollable) --- */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar relative">

                            {/* STEP 1: CART (Input Pelanggan & Rincian Menu) */}
                            {checkoutStage === 'cart' && (
                                <>
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] font-black px-2 py-1 rounded-bl-lg tracking-widest uppercase">VIP Rule</div>
                                        <label className="text-[11px] font-black text-amber-900 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            Backdate Transaksi
                                        </label>
                                        <input type="date" value={backdate} onChange={(e) => setBackdate(e.target.value)} className="w-full border border-amber-300 rounded-xl p-3 text-sm font-bold text-amber-900 bg-white outline-none focus:ring-2 focus:ring-amber-500 transition-shadow" />
                                        <p className="text-[9px] text-amber-700 italic mt-2">*Biarkan kosong untuk transaksi hari ini.</p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Info Pelanggan</label>
                                        <div className="space-y-3 relative" ref={dropdownRef}>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Nama Pelanggan (Opsional)"
                                                    value={searchCustomer}
                                                    onChange={(e) => { setSearchCustomer(e.target.value); setShowCustomerDropdown(true); }}
                                                    onFocus={() => setShowCustomerDropdown(true)}
                                                    className="w-full border border-slate-300 rounded-xl p-3.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
                                                />
                                                {showCustomerDropdown && searchCustomer.length > 0 && (
                                                    <div className="absolute z-20 w-full top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                                                        {filteredCustomers.length > 0 ? (
                                                            filteredCustomers.map(c => (
                                                                <div key={c.id} onClick={() => handleSelectCustomer(c)} className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                                                    <p className="text-sm font-bold text-slate-800">{c.name}</p>
                                                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{c.phone}</p>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div onClick={handleAddNewCustomer} className="p-3 bg-emerald-50 hover:bg-emerald-100 cursor-pointer flex items-center gap-2 transition-colors">
                                                                <div className="w-6 h-6 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center font-bold">+</div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-emerald-800">Tambah Pelanggan Baru</p>
                                                                    <p className="text-[10px] text-emerald-600">Simpan "{searchCustomer}" ke database.</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <input type="tel" placeholder="No WhatsApp (Opsional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow" />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Rincian Menu</label>
                                            <button onClick={() => setCart([])} className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md active:bg-rose-100 transition-colors">Kosongkan</button>
                                        </div>
                                        <div className="space-y-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                                            {cart.map(item => (
                                                <div key={item.id} className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">{item.qty}x</span>
                                                        <p className="text-xs font-bold text-slate-700">{item.name}</p>
                                                    </div>
                                                    <p className="text-xs font-bold text-emerald-600">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* STEP 2: PREP / PENYERAHAN */}
                            {checkoutStage === 'prep' && (
                                <div className="animate-fadeIn h-full flex flex-col justify-center">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 mb-2">Lempar ke Dapur?</h3>
                                        <p className="text-sm text-slate-500">Pesanan akan dipersiapkan terlebih dahulu oleh tim kitchen/packing.</p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                                        <p className="text-xs font-bold text-slate-700 mb-2 border-b border-slate-200 pb-2">Rincian Order ({totalCartItems} Item)</p>
                                        <p className="text-sm font-bold text-slate-500 line-clamp-2 leading-relaxed">
                                            {cart.map(item => `${item.qty}x ${item.name}`).join(', ')}
                                        </p>
                                    </div>

                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">Pilih Metode Penyerahan</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setCheckoutStage('payment')} className="bg-emerald-50 border-2 border-emerald-500 text-emerald-700 rounded-2xl p-4 font-bold flex flex-col items-center gap-2 active:scale-95 transition-transform transform-gpu">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                            AMBIL TOKO
                                        </button>
                                        <button onClick={() => setCheckoutStage('delivery_success')} className="bg-indigo-50 border-2 border-indigo-500 text-indigo-700 rounded-2xl p-4 font-bold flex flex-col items-center gap-2 active:scale-95 transition-transform transform-gpu">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            DIKIRIM (DELIVERY)
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: PAYMENT FORM (AMBIL TOKO) */}
                            {checkoutStage === 'payment' && (
                                <div className="animate-fadeIn">
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center mb-5">
                                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Total Pembayaran</p>
                                        <p className="text-3xl font-black text-emerald-700 font-mono tracking-tight">Rp {totalCartPrice.toLocaleString('id-ID')}</p>
                                        <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">ORD - {Date.now().toString().slice(-8)}</p>
                                    </div>

                                    <div className="flex gap-2 mb-5">
                                        {['TUNAI', 'QRIS', 'Transfer'].map((method) => (
                                            <button
                                                key={method}
                                                onClick={() => setPaymentMethod(method)}
                                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl border-2 transition-all transform-gpu active:scale-95 flex justify-center items-center gap-1 ${paymentMethod === method ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300'}`}
                                            >
                                                {method}
                                            </button>
                                        ))}
                                    </div>

                                    {/* TAB: TUNAI */}
                                    {paymentMethod === 'TUNAI' && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-2">Uang Diterima</label>
                                                <input type="text" placeholder="Rp" className="w-full border border-slate-300 rounded-xl p-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button className="bg-emerald-50 text-emerald-800 text-xs font-bold py-3 rounded-xl border border-emerald-200 active:scale-95 transition-transform transform-gpu">Rp 20.000</button>
                                                <button className="bg-emerald-50 text-emerald-800 text-xs font-bold py-3 rounded-xl border border-emerald-200 active:scale-95 transition-transform transform-gpu">Rp 50.000</button>
                                                <button className="bg-emerald-50 text-emerald-800 text-xs font-bold py-3 rounded-xl border border-emerald-200 active:scale-95 transition-transform transform-gpu">Uang Pas</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: QRIS */}
                                    {paymentMethod === 'QRIS' && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center bg-slate-50 shadow-sm">
                                                <p className="text-xs font-bold text-slate-500 mb-3">Scan QRIS untuk Membayar</p>
                                                <div className="w-48 h-48 bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-bold shadow-sm relative overflow-hidden">
                                                    <svg className="w-24 h-24 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-400 mt-3 font-bold tracking-widest">YoriEgg Dana - A/N YoriPos</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: TRANSFER */}
                                    {paymentMethod === 'Transfer' && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-2">Transfer ke Rekening</label>
                                                <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-white shadow-sm">
                                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black italic border border-indigo-100">BCA</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">8465581987</p>
                                                        <p className="text-xs text-slate-500 font-medium mt-0.5">A/N Windy Kusuma</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 4: DELIVERY SUCCESS NOTIF (Default Putih/Abu) */}
                            {checkoutStage === 'delivery_success' && (
                                <div className="animate-fadeIn h-full flex flex-col items-center justify-center pb-20 text-center px-4">
                                    <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6 border border-indigo-100 shadow-sm">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-2">Pesanan Diteruskan!</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed mb-8">
                                        Pesanan atas nama <strong className="text-slate-700">{searchCustomer || 'Pelanggan'}</strong> telah masuk ke antrean Kitchen dan statusnya diatur sebagai <strong className="text-indigo-600">Dikirim (Delivery)</strong>.
                                    </p>
                                    <button onClick={completeTransaction} className="bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-md active:scale-95 transition-transform w-full transform-gpu">
                                        CEK DAFTAR PESANAN
                                    </button>
                                </div>
                            )}

                            {/* STEP 4: SUKSES BAYAR - STRUK LENGKAP (Default Putih/Abu) */}
                            {checkoutStage === 'sukses_bayar' && (
                                <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col items-center animate-slideUp transform-gpu backface-hidden will-change-transform overflow-y-auto">
                                    <div className="w-full flex justify-end p-4 sticky top-0 bg-slate-50 z-10">
                                        <button onClick={completeTransaction} className="bg-white text-slate-500 hover:bg-slate-100 rounded-full p-2 shadow-sm border border-slate-200">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    <div className="px-6 w-full flex flex-col items-center">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3 shadow-sm border border-emerald-100">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <h2 className="text-slate-800 text-xl font-black mb-1 text-center">Pesanan Selesai!</h2>
                                        <p className="text-slate-500 text-xs text-center mb-6">Cetak / Kirim Struk di bawah ini</p>

                                        {/* KERTAS STRUK */}
                                        <div className="bg-white w-full rounded-2xl p-6 shadow-sm border border-slate-200 relative mb-10">
                                            <div className="text-center mb-6">
                                                <h1 className="text-2xl font-black text-indigo-700">Yori Egg</h1>
                                                <p className="text-[10px] text-slate-500 mt-1">Telp: 085124243869<br />Minggiran, Yogyakarta</p>
                                            </div>

                                            <div className="border-t border-dashed border-slate-300 py-3 flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] text-slate-500">No. Kwitansi</p>
                                                    <p className="text-[11px] font-bold text-indigo-700 font-mono">KWI - {Date.now().toString().slice(-8)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-500">Tanggal</p>
                                                    <p className="text-[10px] font-bold text-slate-800">21 Jun 2026, 14:52</p>
                                                </div>
                                            </div>

                                            {(searchCustomer || customerPhone) && (
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-[10px] text-slate-500">Pelanggan</p>
                                                        <p className="text-[11px] font-bold text-slate-800">{searchCustomer || '-'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-slate-500">Kasir</p>
                                                        <p className="text-[10px] font-bold text-slate-800">Admin</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* RINCIAN BELANJA */}
                                            <div className="border-t border-dashed border-slate-300 pt-4 pb-2 mb-3">
                                                <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">Rincian Belanja</p>
                                                {cart.map(item => (
                                                    <div key={item.id} className="mb-3">
                                                        <p className="text-xs font-bold text-slate-800">{item.name}</p>
                                                        <div className="flex justify-between items-center mt-0.5">
                                                            <span className="text-[10px] text-slate-500 font-medium">{item.qty} x Rp {item.price.toLocaleString('id-ID')}</span>
                                                            <span className="text-xs font-bold text-slate-800">Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mb-4 bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
                                                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Pelunasan Pesanan ({paymentMethod})</p>
                                            </div>

                                            <div className="border-t border-dashed border-slate-300 py-4 mb-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-slate-800">Total Dibayar</span>
                                                    <span className="text-xl font-black text-emerald-600 tracking-tight">Rp {totalCartPrice.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-6">
                                                <button className="bg-slate-100 text-slate-700 rounded-xl py-3 text-xs font-bold border border-slate-200 transform-gpu active:scale-95 transition-transform flex items-center justify-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> Print Struk
                                                </button>
                                                <button className="bg-emerald-500 text-white rounded-xl py-3 text-xs font-bold shadow-sm transform-gpu active:scale-95 transition-transform flex items-center justify-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> Kirim WA
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* --- FOOTER ACTION BUTTON (Only for Step 1 & 3) --- */}
                        {(checkoutStage === 'cart' || checkoutStage === 'payment') && (
                            <div className="p-5 border-t border-slate-100 bg-white shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                                {checkoutStage === 'cart' ? (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-slate-600">Total Tagihan</span>
                                            <span className="text-2xl font-black text-emerald-600 tracking-tight">Rp {totalCartPrice.toLocaleString('id-ID')}</span>
                                        </div>
                                        <button
                                            onClick={() => setCheckoutStage('prep')}
                                            className="w-full bg-emerald-500 text-white rounded-xl py-4 text-sm font-bold shadow-md hover:bg-emerald-600 transform-gpu active:scale-95 transition-transform tracking-wide"
                                        >
                                            SIAPKAN PESANAN / CHECKOUT
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setCheckoutStage('sukses_bayar')}
                                        disabled={!paymentMethod}
                                        className={`w-full rounded-xl py-4 text-sm font-bold shadow-md transform-gpu transition-all tracking-wide ${paymentMethod ? 'bg-emerald-500 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                    >
                                        SELESAIKAN PEMBAYARAN
                                    </button>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}