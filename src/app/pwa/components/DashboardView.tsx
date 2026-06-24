'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function DashboardView({ onOpenPos, onOpenKitchen, onOpenSidebar }: { onOpenPos: () => void, onOpenKitchen?: () => void, onOpenSidebar: () => void }) {
    const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('JUN');
    const scrollRef = useRef<HTMLDivElement>(null);

    const quickMenus = [
        { name: 'POS / Kasir', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
        { name: 'Tagihan Invoice', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Pesan Kirim', icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
        { name: 'Pembayaran Invoice', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
        { name: 'Biaya', icon: 'M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Laporan', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { name: 'Dapur / Packing', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'Atur Menu POS', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'Stock FIFO', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'More', icon: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z' },
    ];

    const chartData = [
        { month: 'JAN', in: 50, piutang: 15, out: 30, valIn: '1.000.000', invIn: 40, valPiu: '300.000', invPiu: 10, valOut: '600.000', invOut: 15 },
        { month: 'FEB', in: 60, piutang: 0, out: 30, valIn: '1.200.000', invIn: 45, valPiu: '0', invPiu: 0, valOut: '500.000', invOut: 12 },
        { month: 'MAR', in: 65, piutang: 30, out: 40, valIn: '2.500.000', invIn: 60, valPiu: '800.000', invPiu: 15, valOut: '1.200.000', invOut: 20 },
        { month: 'APR', in: 55, piutang: 25, out: 50, valIn: '1.800.000', invIn: 50, valPiu: '500.000', invPiu: 10, valOut: '1.500.000', invOut: 25 },
        { month: 'MEI', in: 60, piutang: 30, out: 45, valIn: '2.100.000', invIn: 55, valPiu: '750.000', invPiu: 12, valOut: '1.300.000', invOut: 18 },
        { month: 'JUN', in: 85, piutang: 40, out: 65, valIn: '12.345.678', invIn: 123, valPiu: '12.345.678', invPiu: 123, valOut: '2.345.678', invOut: 75 },
        { month: 'JUL', in: 70, piutang: 20, out: 40, valIn: '8.000.000', invIn: 80, valPiu: '1.500.000', invPiu: 15, valOut: '3.000.000', invOut: 30 },
        { month: 'AGS', in: 90, piutang: 35, out: 70, valIn: '15.000.000', invIn: 150, valPiu: '3.500.000', invPiu: 30, valOut: '5.000.000', invOut: 50 },
        { month: 'SEP', in: 45, piutang: 10, out: 30, valIn: '5.000.000', invIn: 50, valPiu: '500.000', invPiu: 5, valOut: '2.000.000', invOut: 20 },
        { month: 'OKT', in: 75, piutang: 25, out: 55, valIn: '10.000.000', invIn: 100, valPiu: '2.000.000', invPiu: 20, valOut: '4.000.000', invOut: 40 },
        { month: 'NOV', in: 65, piutang: 15, out: 45, valIn: '7.500.000', invIn: 75, pyPiu: '1.000.000', invPiu: 10, valOut: '3.500.000', invOut: 35 },
        { month: 'DES', in: 95, piutang: 50, out: 80, valIn: '18.000.000', invIn: 180, valPiu: '5.000.000', invPiu: 50, valOut: '8.000.000', invOut: 80 },
    ];

    const activeChart = chartData.find(d => d.month === selectedMonth) || chartData[5];

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollLeft = 200;
    }, []);

    const topConsumers = [
        { name: 'Agam Warmindo', orders: 23, total: '5.234.234' },
        { name: 'SS Telur', orders: 30, total: '230.234' },
        { name: 'Bakpia 3 Generasi', orders: 8, total: '123.098' },
        { name: 'Lisa Untari', orders: 5, total: '34.098' },
        { name: 'Madang', orders: 3, total: '12.098' },
    ];

    const topMenus = [
        { name: 'Menu 1', orders: 23, total: '5.234.234' },
        { name: 'Menu 2', orders: 30, total: '230.234' },
        { name: 'Menu 3', orders: 8, total: '123.098' },
        { name: 'Menu 4', orders: 9, total: '34.098' },
        { name: 'Menu 5', orders: 3, total: '12.098' },
    ];

    return (
        <div className="w-full min-h-screen bg-background pb-28 relative font-sans text-foreground transition-colors duration-200">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* ========================================= */}
            {/* 1. HEADER (IKUT WARNA ACCENT/PRIMARY)     */}
            {/* ========================================= */}
            <div className="w-full bg-accent text-accent-foreground rounded-b-3xl pb-14 shadow-sm transition-colors duration-200">

                {/* NAVBAR ATAS & KITCHEN NOTIF */}
                <div className="flex justify-between items-center px-4 py-3">
                    <button onClick={onOpenSidebar} className="hover:opacity-80 transition-opacity">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <h1 className="text-lg font-bold tracking-wide">Dashboard</h1>
                    <button onClick={onOpenKitchen} className="relative w-10 h-10 rounded-xl border border-accent-foreground/20 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors transform-gpu active:scale-95">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        <span className="absolute -bottom-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-accent">15</span>
                    </button>
                </div>

                {/* INFO TOKO & TOMBOL ORDER */}
                <div className="px-4 pb-6 pt-2 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold leading-tight">Toko Tuan dan Nyonya</h2>
                        <div className="flex items-center mt-1 text-[11px] opacity-90">
                            <span>Welcome,</span>
                            <span className="ml-1 bg-amber-400 text-foreground px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide shadow-sm">
                                Admin
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onOpenPos}
                        className="bg-amber-400 hover:opacity-90 text-foreground text-xs font-bold py-2 px-3 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all transform-gpu border border-border"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Order<br />Baru
                    </button>
                </div>
            </div>

            {/* ========================================= */}
            {/* 2. TODAY ACTIVITY (RINGKASAN HARI INI)    */}
            {/* ========================================= */}
            <div className="mx-4 -mt-10 relative z-10 bg-card text-card-foreground rounded-3xl p-5 shadow-sm border border-border transition-colors duration-200">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-muted-foreground">Pendapatan Hari Ini</span>
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">21 Juni 2026</span>
                </div>

                {/* Nominal Pendapatan Utama */}
                <p className="text-[32px] font-black tracking-tight leading-tight mb-1">Rp 2.345.678</p>
                <p className="text-[10px] text-muted-foreground italic mb-4">*Total pendapatan dari 123 invoices harian.</p>

                {/* PIUTANG & PENGELUARAN */}
                <div className="flex gap-3 mb-4">
                    {/* KARTU PIUTANG */}
                    <div className="flex-1 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 rounded-xl p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Piutang</span>
                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <p className="text-base font-black text-amber-600 dark:text-amber-400 leading-none mb-1 truncate">Rp 12.345.678</p>
                        <span className="text-[9px] font-bold opacity-80 block">123 Invoices</span>
                    </div>

                    {/* KARTU PENGELUARAN */}
                    <div className="flex-1 bg-red-300/20 dark:bg-red-300/20 border border-red-300/20 rounded-xl p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">Pengeluaran</span>
                            <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
                        </div>
                        <p className="text-base font-black text-destructive dark:text-red-400 leading-none mb-1 truncate">Rp 2.345.678</p>
                        <span className="text-[9px] font-bold opacity-80 block">75 Invoices</span>
                    </div>
                </div>

                {/* REKAP LIST (Grid 2 Kolom) */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 border border-border rounded-xl p-3 shadow-sm">
                        <p className="text-[10px] font-bold mb-2 border-b border-border pb-1">Rekap Pemasukan</p>
                        <div className="flex justify-between items-center text-[9px] text-muted-foreground mb-1.5"><span className="font-semibold">Cash</span><span className="font-mono font-bold text-card-foreground truncate ml-1">Rp 1.234.567</span></div>
                        <div className="flex justify-between items-center text-[9px] text-muted-foreground mb-1.5"><span className="font-semibold">Qris</span><span className="font-mono font-bold text-card-foreground truncate ml-1">Rp 456.789</span></div>
                        <div className="flex justify-between items-center text-[9px] text-muted-foreground"><span className="font-semibold">Transfer</span><span className="font-mono font-bold text-card-foreground truncate ml-1">Rp 12.345.678</span></div>
                    </div>
                    <div className="bg-muted/50 border border-border rounded-xl p-3 shadow-sm">
                        <p className="text-[10px] font-bold mb-2 border-b border-border pb-1">Rekap Pengeluaran</p>
                        <div className="flex justify-between items-center text-[9px] text-muted-foreground mb-1.5"><span className="font-semibold">Expenses</span><span className="font-mono font-bold text-card-foreground truncate ml-1">Rp 123.456</span></div>
                        <div className="flex justify-between items-center text-[9px] text-muted-foreground"><span className="font-semibold">Restock</span><span className="font-mono font-bold text-card-foreground truncate ml-1">Rp 345.678</span></div>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 3. QUICK MENU AKSES                       */}
            {/* ========================================= */}
            <div className="mx-4 mt-5 bg-accent text-accent-foreground rounded-3xl p-5 shadow-sm overflow-hidden transition-all duration-300">
                <button
                    onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
                    className="w-full flex justify-between items-center active:opacity-70 transition-colors"
                >
                    <span className="text-sm font-bold">Quick Menu Akses</span>
                    <svg className={`w-5 h-5 transition-transform duration-300 ${isQuickMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${isQuickMenuOpen ? 'max-h-[500px] opacity-100 mt-5' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-5 gap-y-5">
                        {quickMenus.map((menu, idx) => (
                            <div key={idx} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform transform-gpu">
                                <div className="w-12 h-12 bg-card text-accent rounded-2xl flex items-center justify-center shadow-sm mb-1.5 border border-border">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={menu.icon} /></svg>
                                </div>
                                <span className="text-[9px] font-bold text-center leading-tight px-1">
                                    {menu.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 4. STATISTIK CASHFLOW & KARTU BULANAN     */}
            {/* ========================================= */}
            <div className="mx-4 mt-5 bg-card border border-border text-card-foreground rounded-3xl p-5 shadow-sm transition-colors duration-200">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-bold">Statistik Cashflow</h3>
                    <div className="flex gap-2 text-[9px] font-bold">
                        <span className="flex items-center gap-1 text-accent"><span className="w-2 h-2 rounded-sm bg-accent"></span>In</span>
                        <span className="flex items-center gap-1 text-amber-500"><span className="w-2 h-2 rounded-sm bg-amber-500"></span>Piutang</span>
                        <span className="flex items-center gap-1 text-destructive"><span className="w-2 h-2 rounded-sm bg-destructive"></span>Out</span>
                    </div>
                </div>

                <div className="relative mb-6">
                    <div ref={scrollRef} className="flex overflow-x-auto hide-scrollbar snap-x items-end gap-3 pb-2 px-1 transform-gpu">
                        {chartData.map((d, i) => {
                            const isCurrent = d.month === selectedMonth;
                            return (
                                <div key={i} onClick={() => setSelectedMonth(d.month)} className="flex flex-col items-center shrink-0 snap-center cursor-pointer group w-12">
                                    {/* Balok Container - REFIXED COLOR ANTI-OVERLAP */}
                                    <div className="flex items-end gap-[3px] h-28 w-full justify-center border-b border-border pb-1">
                                        <div 
                                            className={`w-2.5 rounded-t-[2px] transition-all duration-300 ${
                                                isCurrent ? 'bg-emerald-500 shadow-sm opacity-100' : 'bg-emerald-500/40 group-hover:bg-emerald-500/70'
                                            }`} 
                                            style={{ height: `${d.in}%` }}
                                        ></div>
                                        <div 
                                            className={`w-2.5 rounded-t-[2px] transition-all duration-300 ${
                                                isCurrent ? 'bg-amber-500 shadow-sm opacity-100' : 'bg-amber-500/40 group-hover:bg-amber-500/70'
                                            }`} 
                                            style={{ height: `${d.piutang}%` }}
                                        ></div>
                                        <div 
                                            className={`w-2.5 rounded-t-[2px] transition-all duration-300 ${
                                                isCurrent ? 'bg-red-500 shadow-sm opacity-100' : 'bg-red-500/40 group-hover:bg-red-500/70'
                                            }`} 
                                            style={{ height: `${d.out}%` }}
                                        ></div>
                                    </div>
                                    <span className={`mt-2 text-[10px] transition-colors ${isCurrent ? 'text-foreground font-black' : 'text-muted-foreground group-hover:text-foreground font-bold'}`}>
                                        {d.month}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* 3 KARTU SUMMARY BULANAN */}
                <div className="grid grid-cols-3 gap-2">
                    {/* CARD CASH */}
                    <div className="bg-muted/50 border border-border rounded-2xl p-3 shadow-sm flex flex-col justify-between h-18">
                        <div className="flex justify-between items-start">
                            <p className="text-[9px] font-black text-accent uppercase tracking-widest">CASH</p>
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-[9px] text-muted-foreground font-bold leading-none mb-0.5">Rp</p>
                            <p className="text-[11px] font-black leading-none truncate">4.500.000</p>
                            <p className="text-[9px] font-bold text-muted-foreground mt-1">45 Trx</p>
                        </div>
                    </div>

                    {/* CARD QRIS */}
                    <div className="bg-muted/50 border border-border rounded-2xl p-3 shadow-sm flex flex-col justify-between h-18">
                        <div className="flex justify-between items-start">
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">QRIS</p>
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                        </div>
                        <div>
                            <p className="text-[9px] text-muted-foreground font-bold leading-none mb-0.5">Rp</p>
                            <p className="text-[11px] font-black leading-none truncate">3.500.000</p>
                            <p className="text-[9px] font-bold text-muted-foreground mt-1">35 Trx</p>
                        </div>
                    </div>

                    {/* CARD TRF */}
                    <div className="bg-muted/50 border border-border rounded-2xl p-3 shadow-sm flex flex-col justify-between h-18">
                        <div className="flex justify-between items-start">
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">TRF</p>
                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        </div>
                        <div>
                            <p className="text-[9px] text-muted-foreground font-bold leading-none mb-0.5">Rp</p>
                            <p className="text-[11px] font-black leading-none truncate">3.500.000</p>
                            <p className="text-[9px] font-bold text-muted-foreground mt-1">35 Trx</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 5. TOP 5 KONSUMEN LOYAL                   */}
            {/* ========================================= */}
            <div className="mx-4 mt-5 bg-card border border-border text-card-foreground rounded-3xl p-5 shadow-sm transition-colors duration-200">
                <h3 className="text-sm font-bold mb-4">Top 5 Konsumen Loyal</h3>
                <div className="flex flex-col space-y-3.5">
                    {topConsumers.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-border pb-2.5 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center text-xs font-bold shadow-sm">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold">{item.name}</p>
                                    <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md leading-none inline-block mt-1">
                                        {item.orders} ORDER
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[7px] font-bold text-muted-foreground mb-0.5 bg-muted px-1.5 py-0.5 rounded border border-border inline-block tracking-widest">TOTAL BELANJA</p>
                                <p className="text-[11px] font-black font-mono">Rp {item.total}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================================= */}
            {/* 6. TOP 5 MENU TERLARIS                    */}
            {/* ========================================= */}
            <div className="mx-4 mt-5 bg-card border border-border text-card-foreground rounded-3xl p-5 shadow-sm transition-colors duration-200">
                <h3 className="text-sm font-bold mb-4">Top 5 Menu Terlaris</h3>
                <div className="flex flex-col space-y-3.5">
                    {topMenus.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-border pb-2.5 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center text-xs font-black shadow-sm">
                                    #{idx + 1}
                                </div>
                                <div>
                                    <p className="text-xs font-bold">{item.name}</p>
                                    <span className="text-[8px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-md leading-none inline-block mt-1">
                                        {item.orders} TERJUAL
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[7px] font-bold text-muted-foreground mb-0.5 bg-muted px-1.5 py-0.5 rounded border border-border inline-block tracking-widest">TOTAL OMSET</p>
                                <p className="text-[11px] font-black font-mono">Rp {item.total}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}