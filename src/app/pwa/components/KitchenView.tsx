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
            id: 1, time: '12:30', invoice: 'ORD-123456789', customer: 'Agam Warmindo', status: 'proses', badge: 'bg-amber-100 text-amber-600',
            items: [{ name: 'Telur AKAM Herbal', qty: 2, note: 'Setengah matang' }, { name: 'Teh Es Manis', qty: 2, note: '' }]
        },
        {
            id: 2, time: '12:35', invoice: 'ORD-123456790', customer: 'Lisa Untari', status: 'proses', badge: 'bg-amber-100 text-amber-600',
            items: [{ name: 'Paket Nasi Kuning', qty: 1, note: 'Sambal dipisah' }]
        },
        {
            id: 3, time: '12:15', invoice: 'ORD-123456785', customer: 'SS Telur', status: 'ready', badge: 'bg-emerald-100 text-emerald-600',
            items: [{ name: 'Telur Puyuh Rebus', qty: 50, note: '' }]
        },
        {
            id: 4, time: '12:10', invoice: 'ORD-123456782', customer: 'Modang', status: 'ready', badge: 'bg-emerald-100 text-emerald-600',
            items: [{ name: 'Paket Hemat A', qty: 3, note: '' }]
        },
    ]);

    const filteredOrders = orders.filter(ord => activeFilter ? ord.status === activeFilter : true);

    const countProses = orders.filter(o => o.status === 'proses').length;
    const countReady = orders.filter(o => o.status === 'ready').length;

    // Simulasi PUT /api/kitchen untuk update status
    const handleMarkAsReady = () => {
        if (selectedActionId) {
            setOrders(prev => prev.map(o => o.id === selectedActionId ? { ...o, status: 'ready', badge: 'bg-emerald-100 text-emerald-600' } : o));
            setActiveModal('sukses_ready');
        }
    };

    return (
        <div className="w-full pb-28 relative bg-slate-50 min-h-screen">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* ========================================= */}
            {/* 1. HEADER & SUMMARY KITCHEN               */}
            {/* ========================================= */}
            <div className="w-full bg-emerald-500 rounded-b-3xl pb-8 shadow-sm">

                {/* NAVBAR */}
                < div className="flex justify-between items-center p-4 text-white">
                    {/* 👇 Tombol Back Dapur 👇 */}
                    <button onClick={onBack} className="p-2 bg-emerald-600 rounded-full hover:bg-emerald-700 active:scale-95 transition-transform transform-gpu">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-lg font-bold tracking-wide">Dapur / Kitchen</h1>
                    {/* Icon Lonceng / Notif Dapur */}
                    <button className="relative w-10 h-10 rounded-xl border border-emerald-400 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        {countProses > 0 && <span className="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-emerald-500">{countProses}</span>}
                    </button>
                </div>

                <div className="px-4 pb-4 pt-2 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Toko Tuan dan Nyonya</h2>
                        <p className="text-xs text-emerald-100 mt-0.5">Antrean Hari Ini - 23 Juni 2026</p>
                    </div>
                </div>

                {/* BANNER ANTREAN DAPUR */}
                <div className="mx-4 bg-emerald-50 rounded-2xl p-4 shadow-sm mb-4 border border-emerald-100 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-emerald-800">Total Antrean Masak</span>
                        <p className="text-2xl font-black text-emerald-900 leading-none mt-1">{countProses + countReady} <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Order Aktif</span></p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 shadow-inner">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 2. CARD FILTER (PROSES VS READY)          */}
            {/* ========================================= */}
            <div className="mx-4 -mt-6 relative z-10">
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                    <p className="text-[9px] text-slate-400 italic mb-2">*Klik kartu untuk filter status, Double-Klik untuk reset filter.</p>

                    <div className="flex gap-2">
                        {/* FILTER PROSES (Sedang Dimasak) */}
                        <div
                            onClick={() => setActiveFilter('proses')}
                            onDoubleClick={() => setActiveFilter(null)}
                            className={`flex-1 bg-amber-50 rounded-xl p-3 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activeFilter === 'proses' ? 'border-amber-500 ring-2 ring-amber-200 shadow-md scale-[1.02]' : 'border-amber-100 hover:border-amber-300'}`}
                        >
                            <span className="text-[10px] font-bold text-amber-700 block mb-1 uppercase tracking-wide">Sedang Dimasak</span>
                            <p className="text-2xl font-black text-amber-800 leading-none">{countProses}</p>
                            <span className="text-[9px] font-bold text-amber-600 mt-1 block">Menunggu dapur</span>
                        </div>

                        {/* FILTER READY (Siap Disajikan) */}
                        <div
                            onClick={() => setActiveFilter('ready')}
                            onDoubleClick={() => setActiveFilter(null)}
                            className={`flex-1 bg-emerald-50 rounded-xl p-3 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activeFilter === 'ready' ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-md scale-[1.02]' : 'border-emerald-100 hover:border-emerald-300'}`}
                        >
                            <span className="text-[10px] font-bold text-emerald-700 block mb-1 uppercase tracking-wide">Siap Disajikan</span>
                            <p className="text-2xl font-black text-emerald-800 leading-none">{countReady}</p>
                            <span className="text-[9px] font-bold text-emerald-600 mt-1 block">Tunggu kasir/waiter</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 3. LISTING PESANAN DAPUR (EXPANDABLE)     */}
            {/* ========================================= */}
            <div className="mx-4 mt-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-800">Daftar Order</h3>
                    {activeFilter && <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${activeFilter === 'proses' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>Filter: {activeFilter.toUpperCase()}</span>}
                </div>

                <div className="flex flex-col space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm font-medium">Tidak ada antrean pesanan.</div>
                    ) : filteredOrders.map(ord => {
                        const isExpanded = expandedOrder === ord.id;
                        const isReady = ord.status === 'ready';

                        return (
                            <div key={ord.id} className={`border-b border-slate-100 pb-4 last:border-0 last:pb-0 transition-opacity duration-300 ${isReady ? 'opacity-60' : 'opacity-100'}`}>
                                <div className="flex items-center justify-between cursor-pointer active:opacity-70" onClick={() => setExpandedOrder(isExpanded ? null : ord.id)}>
                                    <div className="flex items-center gap-3">
                                        {/* Waktu Pesanan Masuk */}
                                        <div className={`${isReady ? 'bg-emerald-500' : 'bg-amber-500'} text-white rounded-lg p-1.5 flex flex-col items-center justify-center min-w-[40px] shadow-sm`}>
                                            <svg className="w-3.5 h-3.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-[10px] font-black leading-none tracking-wider">{ord.time}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{ord.customer}</p>
                                            <p className="text-xs scale-75 origin-left text-slate-500 font-mono mt-0.5">{ord.invoice}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-xs font-bold text-slate-700">{ord.items.length} Item</p>
                                            <span className={`text-[9px] scale-90 origin-right font-black px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-widest ${ord.badge}`}>
                                                {ord.status}
                                            </span>
                                        </div>
                                        <div className={`w-6 h-6 bg-slate-100 text-slate-600 rounded flex items-center justify-center transition-transform duration-300 transform-gpu backface-hidden ${isExpanded ? 'rotate-180 bg-slate-200' : ''}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Item Dapur */}
                                {isExpanded && (
                                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200 pl-14 pr-1 animate-slideUp">
                                        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Rincian Masakan:</p>
                                        <div className="space-y-3 mb-4">
                                            {ord.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-slate-400 text-xs mt-0.5 font-bold">-</span>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{item.name}</p>
                                                            {item.note && <p className="text-[10px] text-rose-500 mt-0.5 italic flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> Catatan: {item.note}</p>}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">x {item.qty}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Aksi Dapur (Hanya muncul jika status masih PROSES) */}
                                        {!isReady && (
                                            <button
                                                onClick={() => { setSelectedActionId(ord.id); setActiveModal('konfirmasi_siap'); }}
                                                className="w-full rounded-lg text-xs font-bold py-3 flex items-center justify-center gap-2 bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition-colors transform-gpu active:scale-95 tracking-widest"
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
                    <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 60 }}>
                        <div className="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal('none')}></div>

                        {/* MODAL KONFIRMASI */}
                        {activeModal === 'konfirmasi_siap' && (
                            <div className="relative w-full max-w-md bg-white rounded-t-3xl p-6 pb-28 shadow-2xl animate-slideUp flex flex-col transform-gpu backface-hidden will-change-transform">
                                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0"></div>

                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Pesanan Sudah Selesai Dimasak?</h3>
                                    <p className="text-xs text-slate-500 mt-2">Status pesanan akan berubah menjadi <span className="font-bold text-emerald-600">SIAP</span> dan akan memberikan notifikasi ke kasir/waiter.</p>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setActiveModal('none')} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transform-gpu active:scale-95 transition-transform text-sm">Batal</button>
                                    <button onClick={handleMarkAsReady} className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-emerald-600 transform-gpu active:scale-95 transition-transform text-sm">Ya, Sudah Siap!</button>
                                </div>
                            </div>
                        )}

                        {/* MODAL SUKSES */}
                        {activeModal === 'sukses_ready' && (
                            <div className="relative w-full max-w-md bg-emerald-500 rounded-t-3xl p-6 pb-28 shadow-2xl animate-slideUp flex flex-col transform-gpu backface-hidden will-change-transform text-center items-center">
                                <div className="w-12 h-1.5 bg-emerald-300 rounded-full mx-auto mb-6 shrink-0"></div>
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-lg">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h2 className="text-white text-xl font-black mb-2">Mantap Koki!</h2>
                                <p className="text-emerald-100 text-sm mb-8">Status pesanan berhasil diupdate. Lanjut gas pesanan berikutnya!</p>
                                <button onClick={() => setActiveModal('none')} className="w-full bg-white text-emerald-600 font-black py-3.5 rounded-xl shadow-lg transform-gpu active:scale-95 transition-transform text-sm tracking-widest">TUTUP</button>
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
}