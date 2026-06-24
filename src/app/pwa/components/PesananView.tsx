'use client';

import React, { useState, useEffect } from 'react';

export default function PesananView({ onOpenPos, onOpenKitchen, onOpenSidebar }: { onOpenPos: () => void, onOpenKitchen?: () => void, onOpenSidebar: () => void }) {
    const [selectedYear, setSelectedYear] = useState('2026');

    // Otomatis deteksi bulan berjalan (0 = Jan, 11 = Des)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [activeFilter, setActiveFilter] = useState<string | null>(null); // null, 'AMBIL', 'KIRIM'
    const [expandedTrx, setExpandedTrx] = useState<number | null>(null);

    // Modal States (Slide-Up Bottom Sheets)
    const [activeModal, setActiveModal] = useState('none');
    const [paymentMethod, setPaymentMethod] = useState('TUNAI');
    const [isPiutang, setIsPiutang] = useState(false); // Track status pembayaran Lunas vs Piutang

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    // Auto Center Scroll Logic
    useEffect(() => {
        const timeout = setTimeout(() => {
            const activeCard = document.getElementById(`pesanan-month-${selectedMonth}`);
            if (activeCard) {
                activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }, 100);
        return () => clearTimeout(timeout);
    }, [selectedMonth]);

    // Dummy Data Chart 2 Part (Persentase: Ambil, Kirim)
    const monthlyData = [
        { totalOrd: 15, totalRp: '1.500.000', ambil: 10, ambilPct: 66, ambilTot: '1.000.000', kirim: 5, kirimPct: 34, kirimTot: '500.000' },
        { totalOrd: 8, totalRp: '600.000', ambil: 5, ambilPct: 62, ambilTot: '400.000', kirim: 3, kirimPct: 38, kirimTot: '200.000' },
        { totalOrd: 12, totalRp: '1.200.000', ambil: 8, ambilPct: 66, ambilTot: '800.000', kirim: 4, kirimPct: 34, kirimTot: '400.000' },
        { totalOrd: 9, totalRp: '358.023', ambil: 4, ambilPct: 44, ambilTot: '123.456', kirim: 5, kirimPct: 56, kirimTot: '234.567' },
        { totalOrd: 10, totalRp: '1.000.000', ambil: 6, ambilPct: 60, ambilTot: '600.000', kirim: 4, kirimPct: 40, kirimTot: '400.000' },
        { totalOrd: 14, totalRp: '1.700.000', ambil: 10, ambilPct: 71, ambilTot: '1.200.000', kirim: 4, kirimPct: 29, kirimTot: '500.000' },
        { totalOrd: 2, totalRp: '200.000', ambil: 1, ambilPct: 50, ambilTot: '100.000', kirim: 1, kirimPct: 50, kirimTot: '100.000' },
        { totalOrd: 1, totalRp: '50.000', ambil: 1, ambilPct: 100, ambilTot: '50.000', kirim: 0, kirimPct: 0, kirimTot: '0' },
        { totalOrd: 3, totalRp: '300.000', ambil: 2, ambilPct: 66, ambilTot: '200.000', kirim: 1, kirimPct: 34, kirimTot: '100.000' },
        { totalOrd: 1, totalRp: '150.000', ambil: 0, ambilPct: 0, ambilTot: '0', kirim: 1, kirimPct: 100, kirimTot: '150.000' },
        { totalOrd: 4, totalRp: '600.000', ambil: 2, ambilPct: 50, ambilTot: '300.000', kirim: 2, kirimPct: 50, kirimTot: '300.000' },
        { totalOrd: 2, totalRp: '450.000', ambil: 1, ambilPct: 44, ambilTot: '200.000', kirim: 1, kirimPct: 56, kirimTot: '250.000' },
    ];

    const allOrders = [
        { id: 1, date: '12', month: '06', monthIdx: 5, name: 'Agam Warmindo', ord: 'ORD - 123456789', amount: '534.234', status: 'DITERIMA', type: 'KIRIM' },
        { id: 2, date: '12', month: '06', monthIdx: 5, name: 'SS Telur', ord: 'ORD - 123456790', amount: '230.234', status: 'DITERIMA', type: 'AMBIL' },
        { id: 3, date: '11', month: '06', monthIdx: 5, name: 'Bakpia 3 Generasi', ord: 'ORD - 123456791', amount: '123.098', status: 'SIAP', type: 'KIRIM' },
        { id: 4, date: '10', month: '06', monthIdx: 5, name: 'Lisa Untari', ord: 'ORD - 123456792', amount: '34.098', status: 'SIAP', type: 'AMBIL' },
        { id: 5, date: '08', month: '06', monthIdx: 5, name: 'Modang', ord: 'ORD - 123456793', amount: '12.098', status: 'SIAP', type: 'KIRIM' },
        { id: 6, date: '15', month: '05', monthIdx: 4, name: 'Toko Sejahtera', ord: 'ORD - 987654321', amount: '450.000', status: 'SIAP', type: 'AMBIL' },
    ];

    const activeData = monthlyData[selectedMonth] || monthlyData[0];

    const filteredOrders = allOrders.filter(o => {
        const matchMonth = o.monthIdx === selectedMonth;
        const matchType = activeFilter ? o.type === activeFilter : true;
        return matchMonth && matchType;
    });

    return (
        <div className="w-full pb-28 relative bg-background text-foreground min-h-screen transition-colors duration-200">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* ========================================= */}
            {/* 1. HEADER & CHART 2 PART (IKUT AKSEN TEMA) */}
            {/* ========================================= */}
            <div className="w-full bg-accent text-accent-foreground rounded-b-3xl pb-8 shadow-sm transition-colors duration-200">

                {/* NAVBAR DENGAN KITCHEN NOTIF */}
                <div className="flex justify-between items-center p-4">
                    <button onClick={onOpenSidebar} className="hover:opacity-80 transition-opacity"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                    <h1 className="text-lg font-bold tracking-wide">Riwayat Pesanan</h1>
                    <button onClick={onOpenKitchen} className="relative w-10 h-10 rounded-xl border border-accent-foreground/20 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors transform-gpu active:scale-95">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-accent">15</span>
                    </button>
                </div>

                <div className="px-4 pb-4 pt-2 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Toko Tuan dan Nyonya</h2>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-card text-card-foreground text-xs font-bold py-1.5 px-3 rounded-lg outline-none cursor-pointer border border-border">
                        <option value="2026">2026</option><option value="2025">2025</option>
                    </select>
                </div>

                {/* CHART SECTION (WARNA DIKUNCI MATI BIAR FUNGSIONAL & INFORMATIF) */}
                <div className="mx-4 bg-card text-card-foreground rounded-2xl p-4 shadow-sm mb-4 border border-border transition-colors duration-200">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-muted-foreground">Tipe Pesanan</span>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold"><span className="w-2 h-2 rounded-sm bg-emerald-500"></span>AMBIL TOKO</span>
                            <span className="flex items-center gap-1 text-[9px] text-amber-500 font-bold"><span className="w-2 h-2 rounded-sm bg-amber-400"></span>DELIVERY</span>
                        </div>
                    </div>

                    {/* CHART STACKED BARS */}
                    <div className="flex items-end justify-between h-28 gap-1.5 pb-2 border-b border-border transform-gpu">
                        {monthlyData.map((data, i) => {
                            const isActive = selectedMonth === i;
                            return (
                                <div key={i} onClick={() => setSelectedMonth(i)} className={`flex-1 flex flex-col justify-end h-full w-full opacity-80 cursor-pointer transition-all duration-300 ${isActive ? 'opacity-100 scale-110 shadow-sm' : 'hover:opacity-100'}`}>
                                    {/* Stack 1: Delivery */}
                                    <div className={`w-full rounded-t-[2px] transition-all duration-300 ${isActive ? 'bg-amber-500' : 'bg-amber-500/40'}`} style={{ height: `${data.kirimPct}%` }}></div>
                                    {/* Stack 2: Ambil Toko */}
                                    <div className={`w-full rounded-b-[2px] transition-all duration-300 ${isActive ? 'bg-emerald-600' : 'bg-emerald-500/40'}`} style={{ height: `${data.ambilPct}%` }}></div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        {months.map((m, i) => <span key={i} className={`text-[10px] scale-90 origin-center -rotate-90 block mt-2 font-medium ${selectedMonth === i ? 'text-foreground font-black underline' : 'text-muted-foreground'}`}>{m}</span>)}
                    </div>
                </div>

                {/* HORIZONTAL MONTH SCROLL */}
                <div className="flex overflow-x-auto gap-2 px-4 pb-2 snap-x hide-scrollbar relative">
                    {months.map((m, i) => (
                        <div
                            key={i}
                            id={`pesanan-month-${i}`}
                            onClick={() => setSelectedMonth(i)}
                            className={`snap-center shrink-0 w-[105px] p-3 rounded-xl cursor-pointer transition-colors transform-gpu duration-300 ${selectedMonth === i ? 'bg-black/20 dark:bg-white/20 text-accent-foreground shadow-inner scale-[1.02]' : 'bg-white/10 text-accent-foreground/80 hover:bg-white/20'}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold">{m.toUpperCase()}</span>
                                <span className="text-[9px] font-medium opacity-80">{monthlyData[i]?.totalOrd} Ord</span>
                            </div>
                            <p className="text-xs font-bold mt-1"><span className="text-[9px] mr-0.5 opacity-80">Rp</span>{monthlyData[i]?.totalRp || '0'}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================================= */}
            {/* 2. CARD SUMMARY / FILTER (2 KOLOM)        */}
            {/* ========================================= */}
            <div className="mx-4 -mt-6 relative z-10">
                <div className="bg-card text-card-foreground rounded-3xl p-4 shadow-sm border border-border transition-colors duration-200">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-muted-foreground">Total Pesanan {months[selectedMonth]} {selectedYear}</span>
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{activeData.totalOrd} ORDER</span>
                    </div>
                    <p className="text-2xl font-black text-foreground mb-4">Rp {activeData.totalRp}</p>

                    <p className="text-[9px] text-muted-foreground italic mb-2">*Klik kartu untuk filter tipe pesanan.</p>

                    <div className="flex gap-2">
                        {/* KARTU AMBIL TOKO */}
                        <div
                            onClick={() => setActiveFilter(prev => prev === 'AMBIL' ? null : 'AMBIL')}
                            className={`flex-1 bg-emerald-500/5 rounded-xl p-3 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activeFilter === 'AMBIL' ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-[1.02]' : 'border-border hover:border-emerald-500/30'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Ambil Toko</span>
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none mb-1">{activeData.ambil}</p>
                            <span className="text-[9px] font-bold text-muted-foreground block">Total Rp {activeData.ambilTot}</span>
                        </div>

                        {/* KARTU DELIVERY */}
                        <div
                            onClick={() => setActiveFilter(prev => prev === 'KIRIM' ? null : 'KIRIM')}
                            className={`flex-1 bg-amber-500/5 rounded-xl p-3 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activeFilter === 'KIRIM' ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-[1.02]' : 'border-border hover:border-amber-500/30'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Delivery</span>
                                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                            </div>
                            <p className="text-lg font-black text-amber-500 leading-none mb-1">{activeData.kirim}</p>
                            <span className="text-[9px] font-bold text-muted-foreground block">Total Rp {activeData.kirimTot}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 3. LISTING PESANAN (EXPANDABLE)           */}
            {/* ========================================= */}
            <div className="mx-4 mt-4 bg-card text-card-foreground rounded-3xl p-4 shadow-sm border border-border transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-muted-foreground">Riwayat bulan {months[selectedMonth]} {selectedYear}</h3>
                    {activeFilter && (
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${activeFilter === 'AMBIL' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            Filter: {activeFilter}
                        </span>
                    )}
                </div>

                <div className="flex flex-col space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm font-medium">Tidak ada pesanan untuk filter ini.</div>
                    ) : filteredOrders.map(trx => {
                        const isExpanded = expandedTrx === trx.id;
                        const isDiterima = trx.status === 'DITERIMA';

                        return (
                            <div key={trx.id} className={`border-b border-border pb-4 last:border-0 last:pb-0 transition-opacity duration-300 ${isDiterima ? 'opacity-60' : 'opacity-100'}`}>

                                {/* Baris Transaksi Utama */}
                                <div className="flex items-center justify-between cursor-pointer active:opacity-70" onClick={() => setExpandedTrx(isExpanded ? null : trx.id)}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-accent text-accent-foreground rounded-lg p-1.5 flex flex-col items-center justify-center min-w-[36px] shadow-sm transition-colors duration-200">
                                            <span className="text-xs font-bold leading-none">{trx.date}</span>
                                            <span className="text-[10px] scale-90 leading-none mt-0.5">{trx.month}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">{trx.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{trx.ord}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-xs font-mono font-semibold"><span className="text-[10px] scale-90 text-muted-foreground mr-1">Rp</span>{trx.amount}</p>
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${isDiterima ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                {trx.status}
                                            </span>
                                        </div>
                                        <div className={`w-6 h-6 bg-muted text-muted-foreground rounded flex items-center justify-center transition-transform duration-300 transform-gpu backface-hidden ${isExpanded ? 'rotate-180 bg-muted/80' : ''}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Detail View */}
                                {isExpanded && (
                                    <div className="mt-4 pt-3 border-t border-dashed border-border pl-12 pr-1 animate-slideUp">
                                        <div className="flex items-start gap-1.5 mb-3 text-accent transition-colors duration-200">
                                            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="text-xs scale-90 origin-left leading-tight font-medium text-muted-foreground">
                                                {trx.type === 'KIRIM' ? 'Jl. Mawar Merah No. 12, RT 01/RW 02, Minggiran' : 'Diambil sendiri ke Toko.'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4 bg-muted/40 p-3 rounded-lg border border-border">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-1">
                                                    <span className="text-muted-foreground text-xs mt-0.5 font-bold">-</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground">Menu Paket A</p>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">1 x Rp 5.000</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-foreground">Rp 5.000</span>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-1">
                                                    <span className="text-muted-foreground text-xs mt-0.5 font-bold">-</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground">Menu Paket B</p>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">1 x Rp 7.000</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-foreground">Rp 7.000</span>
                                            </div>
                                        </div>

                                        {/* Simple Action Buttons */}
                                        <div className="flex gap-2">
                                            <button className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-transform transform-gpu">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                            </button>
                                            <button
                                                disabled={isDiterima}
                                                onClick={() => setActiveModal('pembayaran')}
                                                className={`flex-1 rounded-lg text-xs font-bold tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all transform-gpu ${isDiterima ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground hover:opacity-90 active:scale-95'}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                                {isDiterima ? 'SELESAI' : 'BAYAR & SELESAI'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FLOATING ACTION BUTTON (+) UNTUK BUKA POS */}
            <button
                onClick={onOpenPos}
                className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg flex items-center justify-center z-40 hover:opacity-90 transition-transform transform-gpu active:scale-90"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>

            {/* ========================================================================= */}
            {/* OVERLAYS / BOTTOM SHEETS SECTION (SIMPLE & LITE SEPERTI PIUTANG)          */}
            {/* ========================================================================= */}
            {activeModal !== 'none' && (
                <div className="fixed inset-0 flex items-end justify-center z-[60]">
                    <div className="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal('none')}></div>

                    {activeModal === 'pembayaran' && (
                        <div className="relative w-full max-w-md bg-card text-card-foreground rounded-t-3xl p-5 pb-28 shadow-2xl animate-slideUp flex flex-col transform-gpu backface-hidden will-change-transform" style={{ maxHeight: '90vh' }}>
                            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4 shrink-0"></div>

                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <h3 className="text-lg font-bold">Selesaikan Pesanan</h3>
                                <button onClick={() => setActiveModal('none')} className="p-1 rounded-full hover:bg-muted text-muted-foreground"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>

                            <div className="overflow-y-auto hide-scrollbar">
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center mb-4">
                                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">TOTAL TAGIHAN PESANAN</p>
                                    <p className="text-3xl font-black text-amber-700 dark:text-amber-400">Rp 12.000</p>
                                    <p className="text-[10px] font-mono text-muted-foreground mt-1">ORD - 123456792</p>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    {['TUNAI', 'QRIS', 'Transfer'].map((method) => (
                                        <button key={method} onClick={() => setPaymentMethod(method)} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors flex justify-center items-center gap-1 ${paymentMethod === method ? 'bg-accent text-accent-foreground border-accent' : 'bg-muted text-muted-foreground border-border hover:border-accent/40'}`}>
                                            {method}
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod === 'TUNAI' && (
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-muted-foreground block mb-1">Uang Diterima</label><input type="text" placeholder="Rp" className="w-full border border-border bg-background rounded-lg p-3 text-foreground font-bold outline-none focus:border-accent" /></div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button className="bg-muted/60 text-foreground text-xs font-bold py-2 rounded-lg border border-border">Rp 20.000</button>
                                            <button className="bg-muted/60 text-foreground text-xs font-bold py-2 rounded-lg border border-border">Rp 50.000</button>
                                            <button className="bg-muted/60 text-foreground text-xs font-bold py-2 rounded-lg border border-border">Uang Pas</button>
                                        </div>
                                    </div>
                                )}
                                {paymentMethod === 'QRIS' && (
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-muted-foreground block mb-1">Pilih QRIS Tujuan</label><select className="w-full border border-border bg-card rounded-lg p-3 text-foreground font-bold outline-none"><option>YoriEgg Dana</option></select></div>
                                    </div>
                                )}
                                {paymentMethod === 'Transfer' && (
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-muted-foreground block mb-1">Pilih Rekening Tujuan</label><div className="border border-border rounded-lg p-3 flex items-center gap-3 bg-card"><input type="radio" checked readOnly className="w-4 h-4 text-accent" /><div><p className="text-sm font-bold text-foreground">BCA</p><p className="text-xs text-accent font-bold">8465581987 <span className="text-muted-foreground font-normal">(Windy Kusuma)</span></p></div></div></div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 mt-6">
                                    {/* Tombol Simpan Sebagai Piutang */}
                                    <button
                                        className="w-full bg-amber-500 text-white rounded-lg py-3 text-sm font-bold shadow-md hover:bg-amber-600 transform-gpu active:scale-95 transition-transform"
                                        onClick={() => {
                                            setIsPiutang(true);
                                            setActiveModal('sukses_bayar');
                                        }}
                                    >
                                        PIUTANG
                                    </button>

                                    {/* Tombol Lunas */}
                                    <button
                                        className="w-full bg-accent text-accent-foreground rounded-lg py-3 text-sm font-bold shadow-md hover:opacity-90 transform-gpu active:scale-95 transition-transform"
                                        onClick={() => {
                                            setIsPiutang(false);
                                            setActiveModal('sukses_bayar');
                                        }}
                                    >
                                        SELESAIKAN
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STRUK CLEAN (PUTIH/ABU) */}
                    {activeModal === 'sukses_bayar' && (
                        <div className="absolute inset-0 z-50 bg-background flex flex-col items-center animate-slideUp transform-gpu backface-hidden will-change-transform overflow-y-auto">
                            <div className="w-full flex justify-end p-4 sticky top-0 bg-background z-10">
                                <button onClick={() => setActiveModal('none')} className="bg-card text-muted-foreground hover:bg-muted rounded-full p-2 shadow-sm border border-border">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="px-6 w-full flex flex-col items-center">
                                {/* Ikon beda warna tergantung Lunas / Piutang */}
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-sm border ${isPiutang ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                    {isPiutang ? (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    ) : (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    )}
                                </div>
                                <h2 className="text-foreground text-xl font-black mb-1 text-center">
                                    {isPiutang ? 'Disimpan ke Piutang!' : 'Pesanan Selesai!'}
                                </h2>
                                <p className="text-muted-foreground text-xs text-center mb-6">Cetak / Kirim Struk di bawah ini</p>

                                {/* KERTAS STRUK */}
                                <div className="bg-card text-card-foreground w-full rounded-2xl p-6 shadow-sm border border-border relative mb-10">
                                    <div className="text-center mb-6">
                                        <h1 className="text-2xl font-black text-accent">Yori Egg</h1>
                                        <p className="text-[10px] text-muted-foreground mt-1">Telp: 085124243869<br />Minggiran, Yogyakarta</p>
                                    </div>

                                    <div className="border-t border-dashed border-border py-3 flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">No. Kwitansi</p>
                                            <p className="text-[11px] font-bold text-accent font-mono">KWI - {Date.now().toString().slice(-8)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground">Tanggal</p>
                                            <p className="text-[10px] font-bold text-foreground">23 Jun 2026, 15:36</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Pelanggan</p>
                                            <p className="text-[11px] font-bold text-foreground">Lisa Untari</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground">Kasir</p>
                                            <p className="text-[10px] font-bold text-foreground">Admin</p>
                                        </div>
                                    </div>

                                    {/* RINCIAN BELANJA */}
                                    <div className="border-t border-dashed border-border pt-4 pb-2 mb-3">
                                        <p className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-widest">Rincian Belanja</p>

                                        <div className="mb-3">
                                            <p className="text-xs font-bold text-foreground">Menu Paket A</p>
                                            <div className="flex justify-between items-center mt-0.5">
                                                <span className="text-[10px] text-muted-foreground font-medium">1 x Rp 5.000</span>
                                                <span className="text-xs font-bold text-foreground">Rp 5.000</span>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-xs font-bold text-foreground">Menu Paket B</p>
                                            <div className="flex justify-between items-center mt-0.5">
                                                <span className="text-[10px] text-muted-foreground font-medium">1 x Rp 7.000</span>
                                                <span className="text-xs font-bold text-foreground">Rp 7.000</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STATUS PEMBAYARAN BOX */}
                                    <div className={`mb-4 rounded-lg p-3 border text-center ${isPiutang ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isPiutang ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {isPiutang ? 'Dimasukkan Ke Piutang' : `Pelunasan Pesanan (${paymentMethod})`}
                                        </p>
                                    </div>

                                    <div className="border-t border-dashed border-border py-4 mb-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-foreground">Total Tagihan</span>
                                            <span className="text-xl font-black text-emerald-600 tracking-tight">Rp 12.000</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-6">
                                        <button className="bg-muted text-foreground rounded-xl py-3 text-xs font-bold border border-border transform-gpu active:scale-95 transition-transform flex items-center justify-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> Print Struk
                                        </button>
                                        <button className="bg-accent text-accent-foreground rounded-xl py-3 text-xs font-bold shadow-sm transform-gpu active:scale-95 transition-transform flex items-center justify-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> Kirim WA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}