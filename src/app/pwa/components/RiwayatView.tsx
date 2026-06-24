'use client';

import React, { useState, useEffect } from 'react';

export default function RiwayatView({ onOpenKitchen, onOpenSidebar }: { onOpenKitchen?: () => void, onOpenSidebar: () => void }) {
    const [selectedYear, setSelectedYear] = useState('2026');

    // Otomatis deteksi bulan berjalan (0 = Jan, 11 = Des)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [activePaymentFilter, setActivePaymentFilter] = useState<string | null>(null);
    const [expandedTrx, setExpandedTrx] = useState<number | null>(null);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    // Auto Center Scroll Logic
    useEffect(() => {
        const timeout = setTimeout(() => {
            const activeCard = document.getElementById(`riwayat-month-${selectedMonth}`);
            if (activeCard) {
                activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }, 100);
        return () => clearTimeout(timeout);
    }, [selectedMonth]);

    // Dummy Data Chart 3 Part (Persentase: Cash, QRIS, Transfer)
    const monthlyData = [
        { total: '15.000.000', cash: '5.000.000', cashPct: 33, qris: '5.000.000', qrisPct: 33, tf: '5.000.000', tfPct: 34, cashInv: 50, qrisInv: 50, tfInv: 50 },
        { total: '8.500.000', cash: '2.500.000', cashPct: 30, qris: '3.000.000', qrisPct: 35, tf: '3.000.000', tfPct: 35, cashInv: 25, qrisInv: 30, tfInv: 30 },
        { total: '10.200.000', cash: '3.200.000', cashPct: 31, qris: '4.000.000', qrisPct: 40, tf: '3.000.000', tfPct: 29, cashInv: 32, qrisInv: 40, tfInv: 30 },
        { total: '12.345.678', cash: '3.345.678', cashPct: 27, qris: '4.000.000', qrisPct: 33, tf: '5.000.000', tfPct: 40, cashInv: 123, qrisInv: 123, tfInv: 123 },
        { total: '9.000.000', cash: '3.000.000', cashPct: 33, qris: '3.000.000', qrisPct: 33, tf: '3.000.000', tfPct: 34, cashInv: 30, qrisInv: 30, tfInv: 30 },
        { total: '11.500.000', cash: '4.500.000', cashPct: 40, qris: '3.500.000', qrisPct: 30, tf: '3.500.000', tfPct: 30, cashInv: 45, qrisInv: 35, tfInv: 35 },
        { total: '1.000.000', cash: '300.000', cashPct: 30, qris: '400.000', qrisPct: 40, tf: '300.000', tfPct: 30, cashInv: 3, qrisInv: 4, tfInv: 3 },
        { total: '500.000', cash: '200.000', cashPct: 40, qris: '200.000', qrisPct: 40, tf: '100.000', tfPct: 20, cashInv: 2, qrisInv: 2, tfInv: 1 },
        { total: '1.200.000', cash: '400.000', cashPct: 33, qris: '400.000', qrisPct: 33, tf: '400.000', tfPct: 34, cashInv: 4, qrisInv: 4, tfInv: 4 },
        { total: '800.000', cash: '300.000', cashPct: 37, qris: '300.000', qrisPct: 38, tf: '200.000', tfPct: 25, cashInv: 3, qrisInv: 3, tfInv: 2 },
        { total: '1.500.000', cash: '500.000', cashPct: 33, qris: '500.000', qrisPct: 33, tf: '500.000', tfPct: 34, cashInv: 5, qrisInv: 5, tfInv: 5 },
        { total: '900.000', cash: '300.000', cashPct: 33, qris: '300.000', qrisPct: 33, tf: '300.000', tfPct: 34, cashInv: 3, qrisInv: 3, tfInv: 3 },
    ];

    const allTransactions = [
        { id: 1, date: '12', month: '06', monthIdx: 5, name: 'Agam Warmindo', inv: 'INV - 123456789', amount: '534.234', method: 'CASH', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
        { id: 2, date: '12', month: '06', monthIdx: 5, name: 'SS Telur', inv: 'INV - 123456790', amount: '230.234', method: 'QRIS', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
        { id: 3, date: '11', month: '06', monthIdx: 5, name: 'Bakpia 3 Generasi', inv: 'INV - 123456791', amount: '123.098', method: 'QRIS', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
        { id: 4, date: '10', month: '06', monthIdx: 5, name: 'Lisa Untari', inv: 'INV - 123456792', amount: '34.098', method: 'TRANSFER', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
        { id: 5, date: '08', month: '06', monthIdx: 5, name: 'Modang', inv: 'INV - 123456793', amount: '12.098', method: 'TRANSFER', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
        { id: 6, date: '15', month: '05', monthIdx: 4, name: 'Toko Sejahtera', inv: 'INV - 987654321', amount: '450.000', method: 'CASH', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    ];

    const activeData = monthlyData[selectedMonth] || monthlyData[0];

    const filteredTransactions = allTransactions.filter(trx => {
        const matchMonth = trx.monthIdx === selectedMonth;
        const matchMethod = activePaymentFilter ? trx.method === activePaymentFilter : true;
        return matchMonth && matchMethod;
    });

    return (
        <div className="w-full pb-28 relative bg-background text-foreground min-h-screen transition-colors duration-200">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* ========================================= */}
            {/* 1. HEADER & CHART 3 PART (IKUT AKSEN TEMA) */}
            {/* ========================================= */}
            <div className="w-full bg-accent text-accent-foreground rounded-b-3xl pb-8 shadow-sm transition-colors duration-200">

                {/* NAVBAR DENGAN KITCHEN NOTIF */}
                <div className="flex justify-between items-center p-4">
                    <button onClick={onOpenSidebar} className="hover:opacity-80 transition-opacity"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                    <h1 className="text-lg font-bold tracking-wide">Riwayat Transaksi</h1>
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

                {/* CHART SECTION (WARNA DIKUNCI MATI AGAR FUNGSIONAL DAN SELALU MENYALA) */}
                <div className="mx-4 bg-card text-card-foreground rounded-2xl p-4 shadow-sm mb-4 border border-border transition-colors duration-200">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-muted-foreground">Metode Pembayaran</span>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold"><span className="w-2 h-2 rounded-sm bg-emerald-500"></span>CASH</span>
                            <span className="flex items-center gap-1 text-[9px] text-indigo-600 dark:text-indigo-400 font-bold"><span className="w-2 h-2 rounded-sm bg-indigo-500"></span>QRIS</span>
                            <span className="flex items-center gap-1 text-[9px] text-amber-500 font-bold"><span className="w-2 h-2 rounded-sm bg-amber-400"></span>TF</span>
                        </div>
                    </div>

                    {/* CHART STACKED BARS */}
                    <div className="flex items-end justify-between h-28 gap-1.5 pb-2 border-b border-border transform-gpu">
                        {monthlyData.map((data, i) => {
                            const isActive = selectedMonth === i;
                            return (
                                <div key={i} onClick={() => setSelectedMonth(i)} className={`flex-1 flex flex-col justify-end h-full w-full opacity-90 cursor-pointer transition-all duration-300 ${isActive ? 'opacity-100 scale-110 shadow-sm' : 'hover:opacity-100'}`}>
                                    {/* Stack 1: Transfer */}
                                    <div className={`w-full rounded-t-[2px] transition-all duration-300 ${isActive ? 'bg-amber-400' : 'bg-amber-500/40'}`} style={{ height: `${data.tfPct}%` }}></div>
                                    {/* Stack 2: QRIS */}
                                    <div className={`w-full transition-all duration-300 ${isActive ? 'bg-indigo-500' : 'bg-indigo-500/40'}`} style={{ height: `${data.qrisPct}%` }}></div>
                                    {/* Stack 3: Cash */}
                                    <div className={`w-full rounded-b-[2px] transition-all duration-300 ${isActive ? 'bg-emerald-600' : 'bg-emerald-500/40'}`} style={{ height: `${data.cashPct}%` }}></div>
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
                            id={`riwayat-month-${i}`}
                            onClick={() => setSelectedMonth(i)}
                            className={`snap-center shrink-0 w-[105px] p-3 rounded-xl cursor-pointer transition-colors transform-gpu duration-300 ${selectedMonth === i ? 'bg-black/20 dark:bg-white/20 text-accent-foreground shadow-inner scale-[1.02]' : 'bg-white/10 text-accent-foreground/80 hover:bg-white/20'}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold">{m.toUpperCase()}</span>
                                <span className="text-[9px] font-medium opacity-80">12 Trx</span>
                            </div>
                            <p className="text-xs font-bold mt-1"><span className="text-[9px] mr-0.5 opacity-80">Rp</span>{monthlyData[i]?.total || '0'}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================================= */}
            {/* 2. CARD SUMMARY / FILTER (3 KOLOM)        */}
            {/* ========================================= */}
            <div className="mx-4 -mt-6 relative z-10">
                <div className="bg-card text-card-foreground rounded-3xl p-4 shadow-sm border border-border transition-colors duration-200">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-muted-foreground">Total Omzet {months[selectedMonth]} {selectedYear}</span>
                    </div>
                    <p className="text-2xl font-black text-foreground mb-4">Rp {activeData.total}</p>

                    <p className="text-[9px] text-muted-foreground italic mb-2">*Klik kartu untuk filter metode, Double-Klik untuk reset filter.</p>

                    <div className="flex gap-2">
                        {/* KARTU CASH */}
                        <div
                            onClick={() => setActivePaymentFilter(prev => prev === 'CASH' ? null : 'CASH')}
                            className={`flex-1 bg-emerald-500/5 rounded-xl p-2.5 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activePaymentFilter === 'CASH' ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-[1.02]' : 'border-border hover:border-emerald-500/30'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Cash</span>
                                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <p className="text-[10px] text-emerald-500 mb-0.5">Rp</p>
                            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 leading-none truncate">{activeData.cash}</p>
                            <span className="text-[9px] font-bold text-emerald-500 mt-1.5 block">{activeData.cashInv} Trx</span>
                        </div>

                        {/* KARTU QRIS */}
                        <div
                            onClick={() => setActivePaymentFilter(prev => prev === 'QRIS' ? null : 'QRIS')}
                            className={`flex-1 bg-indigo-500/5 rounded-xl p-2.5 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activePaymentFilter === 'QRIS' ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md scale-[1.02]' : 'border-border hover:border-indigo-500/30'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">QRIS</span>
                                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                            </div>
                            <p className="text-[10px] text-indigo-500 mb-0.5">Rp</p>
                            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 leading-none truncate">{activeData.qris}</p>
                            <span className="text-[9px] font-bold text-indigo-500 mt-1.5 block">{activeData.qrisInv} Trx</span>
                        </div>

                        {/* KARTU TRANSFER */}
                        <div
                            onClick={() => setActivePaymentFilter(prev => prev === 'TRANSFER' ? null : 'TRANSFER')}
                            className={`flex-1 bg-amber-500/5 rounded-xl p-2.5 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activePaymentFilter === 'TRANSFER' ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-[1.02]' : 'border-border hover:border-amber-500/30'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Trf</span>
                                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </div>
                            <p className="text-[10px] text-amber-500 mb-0.5">Rp</p>
                            <p className="text-xs font-black text-amber-600 dark:text-amber-400 leading-none truncate">{activeData.tf}</p>
                            <span className="text-[9px] font-bold text-amber-500 mt-1.5 block">{activeData.tfInv} Trx</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 3. LISTING TRANSAKSI (EXPANDABLE)         */}
            {/* ========================================= */}
            <div className="mx-4 mt-4 bg-card text-card-foreground rounded-3xl p-4 shadow-sm border border-border transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-muted-foreground">Riwayat bulan {months[selectedMonth]} {selectedYear}</h3>
                    {activePaymentFilter && (
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${activePaymentFilter === 'CASH' ? 'bg-emerald-500/10 text-emerald-600' : activePaymentFilter === 'QRIS' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            Filter: {activePaymentFilter}
                        </span>
                    )}
                </div>

                <div className="flex flex-col space-y-4">
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm font-medium">Tidak ada transaksi untuk filter ini.</div>
                    ) : filteredTransactions.map(trx => {
                        const isExpanded = expandedTrx === trx.id;

                        return (
                            <div key={trx.id} className="border-b border-border pb-4 last:border-0 last:pb-0 transition-opacity duration-300">

                                {/* Baris Transaksi Utama */}
                                <div className="flex items-center justify-between cursor-pointer active:opacity-70" onClick={() => setExpandedTrx(isExpanded ? null : trx.id)}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-accent text-accent-foreground rounded-lg p-1.5 flex flex-col items-center justify-center min-w-[36px] shadow-sm transition-colors duration-200">
                                            <span className="text-xs font-bold leading-none">{trx.date}</span>
                                            <span className="text-[10px] scale-90 leading-none mt-0.5">{trx.month}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">{trx.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{trx.inv}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-xs font-mono font-semibold"><span className="text-[10px] scale-90 text-muted-foreground mr-1">Rp</span>{trx.amount}</p>
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${trx.badge}`}>
                                                {trx.method}
                                            </span>
                                        </div>
                                        <div className={`w-6 h-6 bg-muted text-muted-foreground rounded flex items-center justify-center transition-transform duration-300 transform-gpu backface-hidden ${isExpanded ? 'rotate-180 bg-muted/80' : ''}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Detail View (Simple & Lite) */}
                                {isExpanded && (
                                    <div className="mt-4 pt-3 border-t border-dashed border-border pl-12 pr-1 animate-slideUp">
                                        <div className="flex items-start gap-1.5 mb-3 text-accent transition-colors duration-200">
                                            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="text-xs scale-90 origin-left leading-tight font-medium text-muted-foreground">Alamat lengkap pengiriman / tagihan konsumen</span>
                                        </div>

                                        <div className="space-y-2 mb-4 bg-muted/40 p-3 rounded-lg border border-border">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-1">
                                                    <span className="text-muted-foreground text-xs mt-0.5 font-bold">-</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground">Telur AKAM Herbal</p>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">2 x Rp 25.000</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-foreground">Rp 50.000</span>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-1">
                                                    <span className="text-muted-foreground text-xs mt-0.5 font-bold">-</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground">Beras Premium</p>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">1 x Rp 73.098</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-foreground">Rp 73.098</span>
                                            </div>
                                        </div>

                                        {/* Simple Action Buttons */}
                                        <div className="flex gap-2">
                                            <button className="flex-1 rounded-lg text-xs font-bold py-2.5 flex items-center justify-center gap-1 border border-border bg-card text-muted-foreground hover:bg-muted transition-colors transform-gpu active:scale-95 shadow-sm">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> Cetak
                                            </button>
                                            <button className="flex-1 rounded-lg text-xs font-bold py-2.5 flex items-center justify-center gap-1 border border-border bg-card text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-colors transform-gpu active:scale-95 shadow-sm">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg> Kirim WA
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}