'use client';

import React, { useState, useEffect } from 'react';

export default function BiayaView({ onOpenKitchen, onOpenSidebar }: { onOpenKitchen?: () => void, onOpenSidebar: () => void }) {
    const [selectedYear, setSelectedYear] = useState('2026');

    // Otomatis deteksi bulan berjalan (0 = Jan, 11 = Des)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const [expandedExp, setExpandedExp] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Modal States
    const [activeModal, setActiveModal] = useState('none');

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    // Auto Center Scroll Logic
    useEffect(() => {
        const timeout = setTimeout(() => {
            const activeCard = document.getElementById(`biaya-month-${selectedMonth}`);
            if (activeCard) {
                activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }, 100);
        return () => clearTimeout(timeout);
    }, [selectedMonth]);

    const chartData = [30, 45, 25, 60, 40, 85, 20, 10, 15, 25, 30, 40];

    const expenses = [
        { id: 1, date: '15', month: '06', title: 'Bayar Listrik Toko', category: 'OPERASIONAL', type: 'BIAYA', amount: '450.000', badge: 'bg-rose-100 text-rose-600' },
        { id: 2, date: '12', month: '06', name: 'Grosir Pak Haji', title: 'Restock Telur AKAM', category: 'KULAKAN', type: 'STOCK', amount: '2.500.000', badge: 'bg-indigo-100 text-indigo-600' },
        { id: 3, date: '10', month: '06', title: 'Gaji Karyawan (Admin)', category: 'GAJI', type: 'BIAYA', amount: '1.500.000', badge: 'bg-rose-100 text-rose-600' },
        { id: 4, date: '05', month: '06', name: 'Toko Plastik Jaya', title: 'Kresek & Isolasi', category: 'KULAKAN', type: 'STOCK', amount: '150.000', badge: 'bg-indigo-100 text-indigo-600' },
    ];

    const filteredExpenses = expenses.filter(exp => activeFilter ? exp.type === activeFilter : true);

    return (
        <div className="w-full pb-28 relative min-h-screen bg-slate-50">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* HEADER & CHART PENGELUARAN */}
            <div className="w-full bg-emerald-500 rounded-b-3xl pb-8 shadow-sm">

                {/* NAVBAR DENGAN KITCHEN NOTIF */}
                <div className="flex justify-between items-center p-4 text-white">
                    <button onClick={onOpenSidebar} className="hover:opacity-80 transition-opacity"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                    <h1 className="text-lg font-bold tracking-wide">Monitoring Pengeluaran</h1>
                    <button onClick={onOpenKitchen} className="relative w-10 h-10 rounded-xl border border-emerald-400 flex items-center justify-center hover:bg-emerald-600 transition-colors transform-gpu active:scale-95">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-emerald-500">15</span>
                    </button>
                </div>

                <div className="px-4 pb-4 pt-2 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Toko Tuan dan Nyonya</h2>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-white text-slate-800 text-xs font-bold py-1.5 px-3 rounded-lg outline-none cursor-pointer">
                        <option value="2026">2026</option><option value="2025">2025</option>
                    </select>
                </div>

                <div className="mx-4 bg-emerald-50 rounded-2xl p-4 shadow-sm mb-4">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-emerald-800">Grafik Pengeluaran Kas</span>
                    </div>

                    <div className="flex items-end justify-between h-28 gap-1 pb-2 border-b border-emerald-200/50 transform-gpu">
                        {chartData.map((h, i) => {
                            const isActive = selectedMonth === i;
                            return (
                                <div key={i} className={`flex-1 flex flex-col justify-end h-full w-full opacity-90 transition-transform ${isActive ? 'opacity-100 scale-105' : ''}`}>
                                    <div className={`w-full rounded-t-sm transition-all duration-300 ${isActive ? 'bg-rose-500' : 'bg-rose-300'}`} style={{ height: `${h}%` }}></div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        {months.map((m, i) => <span key={i} className={`text-xs scale-75 origin-center -rotate-90 block mt-2 font-medium ${selectedMonth === i ? 'text-emerald-800 font-bold' : 'text-emerald-600'}`}>{m}</span>)}
                    </div>
                </div>

                <div className="flex overflow-x-auto gap-2 px-4 pb-2 snap-x hide-scrollbar relative">
                    {months.map((m, i) => (
                        <div
                            key={i}
                            id={`biaya-month-${i}`} // ID untuk target scroll
                            onClick={() => setSelectedMonth(i)}
                            className={`snap-center shrink-0 w-24 p-2.5 rounded-xl cursor-pointer transition-colors transform-gpu duration-300 ${selectedMonth === i ? 'bg-emerald-900 text-white shadow-inner scale-[1.02]' : 'bg-emerald-400 bg-opacity-40 text-emerald-900 hover:bg-opacity-60'}`}
                        >
                            <span className="text-xs font-bold">{m.toUpperCase()}</span>
                            <p className="text-[10px] font-bold mt-2">Rp 4.6 Jt</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CARD SUMMARY PENGELUARAN (SEKALIGUS FILTER) */}
            <div className="mx-4 -mt-6 relative z-10">
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">Total Kas Keluar {months[selectedMonth]} {selectedYear}</span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">12 TRX</span>
                    </div>
                    <p className="text-2xl font-black text-rose-600 mb-4">Rp 4.600.000</p>

                    <p className="text-[9px] text-slate-400 italic mb-2">*Klik kartu untuk filter data, Double-Klik untuk reset filter.</p>

                    <div className="flex gap-2">
                        {/* FILTER KULAKAN (STOCK) */}
                        <div
                            onClick={() => setActiveFilter('STOCK')}
                            onDoubleClick={() => setActiveFilter(null)}
                            className={`flex-1 bg-indigo-50 rounded-xl p-3 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activeFilter === 'STOCK' ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-md scale-[1.02]' : 'border-indigo-100 hover:border-indigo-300'}`}
                        >
                            <span className="text-[10px] font-bold text-indigo-700 block mb-1 uppercase tracking-wide">Belanja Stok</span>
                            <p className="text-xs text-indigo-600 mb-0.5">Rp</p>
                            <p className="text-sm font-black text-indigo-800 leading-none">2.650.000</p>
                        </div>

                        {/* FILTER BIAYA OPERASIONAL */}
                        <div
                            onClick={() => setActiveFilter('BIAYA')}
                            onDoubleClick={() => setActiveFilter(null)}
                            className={`flex-1 bg-rose-50 rounded-xl p-3 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activeFilter === 'BIAYA' ? 'border-rose-500 ring-2 ring-rose-200 shadow-md scale-[1.02]' : 'border-rose-100 hover:border-rose-300'}`}
                        >
                            <span className="text-[10px] font-bold text-rose-700 block mb-1 uppercase tracking-wide">Biaya Ops</span>
                            <p className="text-xs text-rose-600 mb-0.5">Rp</p>
                            <p className="text-sm font-black text-rose-800 leading-none">1.950.000</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* LISTING PENGELUARAN (EXPANDABLE) */}
            <div className="mx-4 mt-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-800">Rincian Kas Keluar bulan {months[selectedMonth]}</h3>
                    {activeFilter && <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${activeFilter === 'STOCK' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>Filter: {activeFilter}</span>}
                </div>

                <div className="flex flex-col space-y-4">
                    {filteredExpenses.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm font-medium">Tidak ada data pengeluaran untuk filter ini.</div>
                    ) : filteredExpenses.map(exp => {
                        const isExpanded = expandedExp === exp.id;

                        return (
                            <div key={exp.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 transition-opacity duration-300">
                                <div className="flex items-center justify-between cursor-pointer active:opacity-70" onClick={() => setExpandedExp(isExpanded ? null : exp.id)}>
                                    <div className="flex items-center gap-3">
                                        <div className={`${exp.type === 'STOCK' ? 'bg-indigo-500' : 'bg-rose-500'} text-white rounded-lg p-1.5 flex flex-col items-center justify-center min-w-[36px] shadow-sm`}>
                                            <span className="text-xs font-bold leading-none">{exp.date}</span>
                                            <span className="text-[10px] scale-90 leading-none mt-0.5">{exp.month}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{exp.title}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{exp.name || exp.type}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-xs font-mono text-slate-700 font-semibold"><span className="text-[10px] scale-90 text-slate-400 mr-1">Rp</span>{exp.amount}</p>
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${exp.badge}`}>
                                                {exp.category}
                                            </span>
                                        </div>
                                        <div className={`w-6 h-6 bg-slate-100 text-slate-600 rounded flex items-center justify-center transition-transform duration-300 transform-gpu backface-hidden ${isExpanded ? 'rotate-180 bg-slate-200' : ''}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200 pl-12 pr-1 animate-slideUp">
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs text-slate-600 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 font-medium">Dicatat Oleh:</span>
                                                <span className="font-bold text-slate-700">Admin (Windy Kusuma)</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 font-medium">Tanggal Transaksi:</span>
                                                <span className="font-bold text-slate-700">{exp.date} {months[selectedMonth]} 2026</span>
                                            </div>
                                            {exp.type === 'STOCK' && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400 font-medium">Supplier/Vendor:</span>
                                                    <span className="font-bold text-slate-700">{exp.name}</span>
                                                </div>
                                            )}
                                            <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
                                                <span className="text-slate-400 font-medium">Bukti / Nota:</span>
                                                <button className="flex items-center gap-1 text-emerald-600 font-bold hover:underline">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                    Lihat Foto
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-3">
                                            <button className="flex-1 rounded-lg text-xs font-bold py-2.5 flex items-center justify-center gap-1 border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors transform-gpu active:scale-95">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Edit
                                            </button>
                                            <button className="flex-1 rounded-lg text-xs font-bold py-2.5 flex items-center justify-center gap-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors transform-gpu active:scale-95">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Hapus
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* FLOATING ACTION BUTTON (+) */}
            <button
                onClick={() => setActiveModal('add_choice')}
                className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 rounded-full shadow-[0_8px_20px_rgba(16,185,129,0.4)] flex items-center justify-center text-white z-40 hover:bg-emerald-600 transition-transform transform-gpu active:scale-90"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>

            {/* OVERLAYS / BOTTOM SHEETS SECTION */}
            {activeModal !== 'none' && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center">
                    <div className="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal('none')}></div>

                    {activeModal === 'add_choice' && (
                        <div className="relative w-full max-w-md bg-white rounded-t-3xl p-6 pb-28 shadow-2xl animate-slideUp transform-gpu backface-hidden will-change-transform">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1 text-center">Catat Kas Keluar</h3>
                            <p className="text-xs text-slate-500 text-center mb-6">Pilih jenis pengeluaran yang ingin dicatat</p>

                            <div className="flex flex-col gap-3">
                                <button onClick={() => setActiveModal('form_stock')} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50 hover:bg-indigo-100 transition-colors text-left transform-gpu active:scale-[0.98]">
                                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
                                    <div>
                                        <h4 className="text-sm font-bold text-indigo-900 mb-0.5">Kulakan / Restock (Aset)</h4>
                                        <p className="text-[10px] text-indigo-700 leading-tight">Uang keluar untuk beli bahan baku/barang yang akan menambah Kuantitas Stok.</p>
                                    </div>
                                </button>
                                <button onClick={() => setActiveModal('form_biaya')} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-rose-100 bg-rose-50 hover:bg-rose-100 transition-colors text-left transform-gpu active:scale-[0.98]">
                                    <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                                    <div>
                                        <h4 className="text-sm font-bold text-rose-900 mb-0.5">Biaya Operasional (Beban)</h4>
                                        <p className="text-[10px] text-rose-700 leading-tight">Uang keluar untuk biaya rutin seperti listrik, gaji karyawan, bensin, atau alat kebersihan.</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeModal === 'form_stock' && (
                        <div className="relative w-full h-[85vh] max-w-md bg-white rounded-t-3xl p-6 pb-28 shadow-2xl animate-slideUp flex flex-col transform-gpu backface-hidden will-change-transform">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0"></div>
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 shrink-0">
                                <div className="flex items-center gap-2"><div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div><h3 className="text-base font-bold text-slate-800">Input Restock Stok</h3></div>
                                <button onClick={() => setActiveModal('add_choice')} className="p-1 rounded-full hover:bg-slate-100 text-slate-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4">
                                <div><label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Nota</label><input type="date" className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-800 font-medium outline-none" /></div>
                                <div><label className="text-xs font-bold text-slate-600 block mb-1">Supplier / Toko</label><input type="text" placeholder="Contoh: Grosir Pak Haji" className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-800 outline-none" /></div>
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mt-2">
                                    <p className="text-xs font-bold text-indigo-800 mb-3">Item Dibeli</p>
                                    <div className="space-y-3"><div className="flex gap-2"><select className="flex-1 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 outline-none bg-white"><option>Telur AKAM</option></select><input type="number" placeholder="Qty" className="w-20 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 outline-none" /></div><input type="text" placeholder="Total Harga (Rp)" className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 outline-none" /></div>
                                    <button className="w-full mt-3 border border-dashed border-indigo-300 text-indigo-600 text-xs font-bold py-2 rounded-lg bg-white">+ Tambah Item Lain</button>
                                </div>
                            </div>
                            <div className="pt-4 mt-2 border-t border-slate-100 shrink-0"><button className="w-full bg-indigo-600 text-white rounded-lg py-3 text-sm font-bold shadow-md hover:bg-indigo-700 transform-gpu active:scale-95 transition-transform" onClick={() => setActiveModal('none')}>SIMPAN DATA RESTOCK</button></div>
                        </div>
                    )}

                    {activeModal === 'form_biaya' && (
                        <div className="relative w-full h-[85vh] max-w-md bg-white rounded-t-3xl p-6 pb-28 shadow-2xl animate-slideUp flex flex-col transform-gpu backface-hidden will-change-transform">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0"></div>
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 shrink-0">
                                <div className="flex items-center gap-2"><div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div><h3 className="text-base font-bold text-slate-800">Catat Biaya Ops</h3></div>
                                <button onClick={() => setActiveModal('add_choice')} className="p-1 rounded-full hover:bg-slate-100 text-slate-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4">
                                <div><label className="text-xs font-bold text-slate-600 block mb-1">Kategori Biaya</label><select className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-800 outline-none bg-white"><option>Listrik & Air</option><option>Gaji Karyawan</option><option>Bensin & Transport</option><option>Lain-lain</option></select></div>
                                <div><label className="text-xs font-bold text-slate-600 block mb-1">Judul / Keterangan</label><input type="text" placeholder="Contoh: Beli token listrik" className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-800 outline-none" /></div>
                                <div><label className="text-xs font-bold text-slate-600 block mb-1">Jumlah Uang Keluar</label><div className="relative"><span className="absolute left-4 top-3 text-slate-500 font-bold">Rp</span><input type="number" placeholder="0" className="w-full border border-slate-300 rounded-lg p-3 pl-10 text-lg font-black text-slate-800 outline-none focus:border-rose-500" /></div></div>
                                <div><label className="text-xs font-bold text-slate-600 block mb-1">Bukti Nota / Struk <span className="font-normal text-slate-400">(Opsional)</span></label><div className="flex border border-slate-300 rounded-lg overflow-hidden bg-slate-50"><button className="bg-slate-200 text-slate-700 text-xs font-bold px-4 py-3 border-r border-slate-300">Foto Kamera</button><div className="px-4 py-3 text-xs text-slate-400">Belum ada foto</div></div></div>
                            </div>
                            <div className="pt-4 mt-2 border-t border-slate-100 shrink-0"><button className="w-full bg-rose-600 text-white rounded-lg py-3 text-sm font-bold shadow-md hover:bg-rose-700 transform-gpu active:scale-95 transition-transform" onClick={() => setActiveModal('none')}>SIMPAN PENGELUARAN</button></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}