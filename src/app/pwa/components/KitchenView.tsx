'use client';

import React, { useState } from 'react';

export default function KitchenView({ onBack }: { onBack: () => void }) {
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null); // 'proses' | 'ready'
    const [activeModal, setActiveModal] = useState('none');
    const [selectedActionId, setSelectedActionId] = useState<number | null>(null);

    // Dummy Data menyesuaikan response API (status: 'proses' | 'ready')
    const [orders, setOrders] = useState([
        {
            id: 1, time: '12:30', invoice: 'ORD-123456789', customer: 'Agam Warmindo', status: 'proses', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            items: [{ name: 'Telur AKAM Herbal', qty: 2, note: 'Setengah matang' }, { name: 'Teh Es Manis', qty: 2, note: '' }]
        },
        {
            id: 2, time: '12:35', invoice: 'ORD-123456790', customer: 'Lisa Untari', status: 'proses', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            items: [{ name: 'Paket Nasi Kuning', qty: 1, note: 'Sambal dipisah' }]
        },
        {
            id: 3, time: '12:15', invoice: 'ORD-123456785', customer: 'SS Telur', status: 'ready', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            items: [{ name: 'Telur Puyuh Rebus', qty: 50, note: '' }]
        },
        {
            id: 4, time: '12:10', invoice: 'ORD-123456782', customer: 'Modang', status: 'ready', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            items: [{ name: 'Paket Hemat A', qty: 3, note: '' }]
        },
    ]);

    const filteredOrders = orders.filter(ord => activeFilter ? ord.status === activeFilter : true);

    const countProses = orders.filter(o => o.status === 'proses').length;
    const countReady = orders.filter(o => o.status === 'ready').length;

    // Simulasi PUT /api/kitchen untuk update status
    const handleMarkAsReady = () => {
        if (selectedActionId) {
            setOrders(prev => prev.map(o => o.id === selectedActionId ? { ...o, status: 'ready', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' } : o));
            setActiveModal('sukses_ready');
        }
    };

    return (
        <div className="w-full pb-28 relative bg-background text-foreground min-h-screen transition-colors duration-200">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* ========================================= */}
            {/* 1. HEADER & SUMMARY KITCHEN (IKUT TEMA)   */}
            {/* ========================================= */}
            <div className="w-full bg-accent text-accent-foreground rounded-b-3xl pb-8 shadow-sm transition-colors duration-200">

                {/* NAVBAR */}
                <div className="flex justify-between items-center p-4">
                    {/* 👇 Tombol Back Dapur 👇 */}
                    <button onClick={onBack} className="p-2 bg-black/20 dark:bg-white/10 rounded-full hover:bg-black/30 dark:hover:bg-white/20 active:scale-95 transition-transform transform-gpu">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-lg font-bold tracking-wide">Dapur / Kitchen</h1>
                    {/* Icon Lonceng / Notif Dapur */}
                    <button className="relative w-10 h-10 rounded-xl border border-accent-foreground/20 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        {countProses > 0 && <span className="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-accent">{countProses}</span>}
                    </button>
                </div>

                <div className="px-4 pb-4 pt-2 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Toko Tuan dan Nyonya</h2>
                        <p className="text-xs opacity-80 mt-0.5">Antrean Hari Ini - 23 Juni 2026</p>
                    </div>
                </div>

                {/* BANNER ANTREAN DAPUR */}
                <div className="mx-4 bg-card text-card-foreground rounded-2xl p-4 shadow-sm mb-4 border border-border flex items-center justify-between transition-colors duration-200">
                    <div>
                        <span className="text-xs font-bold text-muted-foreground">Total Antrean Masak</span>
                        <p className="text-2xl font-black leading-none mt-1">{countProses + countReady} <span className="text-[10px] text-accent font-bold uppercase tracking-wider transition-colors">Order Aktif</span></p>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center shadow-inner transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 2. CARD FILTER (PROSES VS READY)          */}
            {/* ========================================= */}
            <div className="mx-4 -mt-6 relative z-10">
                <div className="bg-card text-card-foreground rounded-3xl p-4 shadow-sm border border-border transition-colors duration-200">
                    <p className="text-[9px] text-muted-foreground italic mb-2">*Klik kartu untuk filter status, Double-Klik untuk reset filter.</p>

                    <div className="flex gap-2">
                        {/* FILTER PROSES (Sedang Dimasak - Kunci Amber) */}
                        <div
                            onClick={() => setActiveFilter('proses')}
                            onDoubleClick={() => setActiveFilter(null)}
                            className={`flex-1 bg-amber-500/5 rounded-xl p-3 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activeFilter === 'proses' ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-[1.02]' : 'border-border hover:border-amber-500/30'}`}
                        >
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mb-1 uppercase tracking-wide">Sedang Dimasak</span>
                            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none">{countProses}</p>
                            <span className="text-[9px] font-bold text-amber-500/70 mt-1 block">Menunggu dapur</span>
                        </div>

                        {/* FILTER READY (Siap Disajikan - Kunci Emerald) */}
                        <div
                            onClick={() => setActiveFilter('ready')}
                            onDoubleClick={() => setActiveFilter(null)}
                            className={`flex-1 bg-emerald-500/5 rounded-xl p-3 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activeFilter === 'ready' ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-[1.02]' : 'border-border hover:border-emerald-500/30'}`}
                        >
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1 uppercase tracking-wide">Siap Disajikan</span>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{countReady}</p>
                            <span className="text-[9px] font-bold text-emerald-500/70 mt-1 block">Tunggu kasir/waiter</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 3. LISTING PESANAN DAPUR (EXPANDABLE)     */}
            {/* ========================================= */}
            <div className="mx-4 mt-4 bg-card text-card-foreground rounded-3xl p-4 shadow-sm border border-border transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-muted-foreground">Daftar Order</h3>
                    {activeFilter && <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${activeFilter === 'proses' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>Filter: {activeFilter.toUpperCase()}</span>}
                </div>

                <div className="flex flex-col space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm font-medium">Tidak ada antrean pesanan.</div>
                    ) : filteredOrders.map(ord => {
                        const isExpanded = expandedOrder === ord.id;
                        const isReady = ord.status === 'ready';

                        return (
                            <div key={ord.id} className={`border-b border-border pb-4 last:border-0 last:pb-0 transition-opacity duration-300 ${isReady ? 'opacity-60' : 'opacity-100'}`}>
                                <div className="flex items-center justify-between cursor-pointer active:opacity-70" onClick={() => setExpandedOrder(isExpanded ? null : ord.id)}>
                                    <div className="flex items-center gap-3">
                                        {/* Waktu Pesanan Masuk */}
                                        <div className={`${isReady ? 'bg-emerald-500' : 'bg-amber-500'} text-white rounded-lg p-1.5 flex flex-col items-center justify-center min-w-[40px] shadow-sm`}>
                                            <svg className="w-3.5 h-3.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-[10px] font-black leading-none tracking-wider">{ord.time}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">{ord.customer}</p>
                                            <p className="text-xs scale-75 origin-left text-muted-foreground font-mono mt-0.5">{ord.invoice}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-xs font-bold">{ord.items.length} Item</p>
                                            <span className={`text-[9px] scale-90 origin-right font-black px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-widest ${ord.badge}`}>
                                                {ord.status}
                                            </span>
                                        </div>
                                        <div className={`w-6 h-6 bg-muted text-muted-foreground rounded flex items-center justify-center transition-transform duration-300 transform-gpu backface-hidden ${isExpanded ? 'rotate-180 bg-muted/80' : ''}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Item Dapur */}
                                {isExpanded && (
                                    <div className="mt-4 pt-3 border-t border-dashed border-border pl-14 pr-1 animate-slideUp">
                                        <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest">Rincian Masakan:</p>
                                        <div className="space-y-3 mb-4">
                                            {ord.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-muted-foreground text-xs mt-0.5 font-bold">-</span>
                                                        <div>
                                                            <p className="text-xs font-bold">{item.name}</p>
                                                            {item.note && <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5 italic flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> Catatan: {item.note}</p>}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black bg-muted px-2 py-0.5 rounded border border-border">x {item.qty}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Aksi Dapur (Hanya muncul jika status masih PROSES - Ikut Warna Accent) */}
                                        {!isReady && (
                                            <button
                                                onClick={() => { setSelectedActionId(ord.id); setActiveModal('konfirmasi_siap'); }}
                                                className="w-full rounded-lg text-xs font-bold py-3 flex items-center justify-center gap-2 bg-accent text-accent-foreground shadow-md hover:opacity-90 transition-all transform-gpu active:scale-95 tracking-widest font-sans"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                TANDAI PESANAN SIAP
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* OVERLAYS / BOTTOM SHEETS SECTION                                          */}
            {/* ========================================================================= */}
            {
                activeModal !== 'none' && (
                    <div className="fixed inset-0 flex items-end justify-center z-[60]">
                        <div className="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal('none')}></div>

                        {/* MODAL KONFIRMASI */}
                        {activeModal === 'konfirmasi_siap' && (
                            <div className="relative w-full max-w-md bg-card text-card-foreground rounded-t-3xl p-6 pb-28 shadow-2xl animate-slideUp flex flex-col transform-gpu backface-hidden will-change-transform border-t border-border transition-colors duration-200">
                                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 shrink-0"></div>

                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold">Pesanan Sudah Selesai Dimasak?</h3>
                                    <p className="text-xs text-muted-foreground mt-2">Status pesanan akan berubah menjadi <span className="font-bold text-emerald-600 dark:text-emerald-400">SIAP</span> dan akan memberikan notifikasi ke kasir/waiter.</p>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setActiveModal('none')} className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold py-3 rounded-xl transform-gpu active:scale-95 transition-all text-sm">Batal</button>
                                    <button onClick={handleMarkAsReady} className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-emerald-600 transform-gpu active:scale-95 transition-all text-sm">Ya, Sudah Siap!</button>
                                </div>
                            </div>
                        )}

                        {/* MODAL SUKSES (MENGGUNAKAN ACCENT TEMA AGAR MENYALA PREMIUM) */}
                        {activeModal === 'sukses_ready' && (
                            <div className="relative w-full max-w-md bg-accent text-accent-foreground rounded-t-3xl p-6 pb-28 shadow-2xl animate-slideUp flex flex-col transform-gpu backface-hidden will-change-transform text-center items-center transition-colors duration-200">
                                <div className="w-12 h-1.5 bg-accent-foreground/20 rounded-full mx-auto mb-6 shrink-0"></div>
                                <div className="w-20 h-20 bg-card text-accent rounded-full flex items-center justify-center mb-4 shadow-lg border border-border">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h2 className="text-xl font-black mb-2">Mantap Koki!</h2>
                                <p className="opacity-90 text-sm mb-8">Status pesanan berhasil diupdate. Lanjut gas pesanan berikutnya!</p>
                                <button onClick={() => setActiveModal('none')} className="w-full bg-card text-accent font-black py-3.5 rounded-xl shadow-lg transform-gpu active:scale-95 transition-all text-sm tracking-widest border border-border">TUTUP</button>
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    );
}