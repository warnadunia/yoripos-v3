'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function DashboardView({ onOpenPos }: { onOpenPos: () => void }) {
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
        { month: 'NOV', in: 65, piutang: 15, out: 45, valIn: '7.500.000', invIn: 75, valPiu: '1.000.000', invPiu: 10, valOut: '3.500.000', invOut: 35 },
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
        <div className="w-full min-h-screen bg-slate-50 pb-28 relative font-sans text-gray-800">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* ========================================= */}
            {/* 1. WRAPPER HIJAU (HEADER & CHART)         */}
            {/* ========================================= */}
            <div className="w-full bg-emerald-500 rounded-b-3xl pb-10 shadow-sm">

                {/* NAVBAR ATAS */}
                <div className="flex justify-between items-center px-4 py-3 text-white">
                    <button className="hover:opacity-80 transition-opacity">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <h1 className="text-lg font-bold tracking-wide">Dashboard</h1>
                    <div className="w-8"></div> {/* Spacer untuk keseimbangan */}
                </div>

                {/* INFO TOKO & TOMBOL ORDER */}
                <div className="px-4 pb-4 pt-2 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold leading-tight">Toko Tuan dan Nyonya</h2>
                        <div className="flex items-center mt-1 text-[11px] text-emerald-100">
                            <span>Welcome,</span>
                            <span className="ml-1 bg-amber-400 px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-900 tracking-wide shadow-sm">
                                Admin
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onOpenPos}
                        className="bg-amber-400 hover:bg-amber-300 text-amber-900 text-xs font-bold py-2 px-3 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all transform-gpu"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Order<br />Baru
                    </button>
                </div>

                {/* CHART CASHFLOW DALAM HIJAU */}
                <div className="mx-4 bg-emerald-50 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-emerald-800">Statistik Cashflow</h3>
                        <div className="flex gap-2 text-[9px] font-bold">
                            <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-sm bg-emerald-500"></span>In</span>
                            <span className="flex items-center gap-1 text-amber-500"><span className="w-2 h-2 rounded-sm bg-amber-400"></span>Piutang</span>
                            <span className="flex items-center gap-1 text-rose-500"><span className="w-2 h-2 rounded-sm bg-rose-500"></span>Out</span>
                        </div>
                    </div>

                    <div className="relative">
                        <div ref={scrollRef} className="flex overflow-x-auto hide-scrollbar snap-x items-end gap-3 pb-2 px-1 transform-gpu">
                            {chartData.map((d, i) => {
                                const isCurrent = d.month === selectedMonth;
                                return (
                                    <div key={i} onClick={() => setSelectedMonth(d.month)} className="flex flex-col items-center shrink-0 snap-center cursor-pointer group w-12">
                                        {/* Balok Container */}
                                        <div className="flex items-end gap-[3px] h-28 w-full justify-center border-b border-emerald-200/50 pb-1">
                                            <div className={`w-2.5 rounded-t-[2px] transition-all duration-300 ${isCurrent ? 'bg-emerald-500 shadow-sm' : 'bg-emerald-300 group-hover:bg-emerald-400'}`} style={{ height: `${d.in}%` }}></div>
                                            <div className={`w-2.5 rounded-t-[2px] transition-all duration-300 ${isCurrent ? 'bg-amber-400 shadow-sm' : 'bg-amber-200 group-hover:bg-amber-300'}`} style={{ height: `${d.piutang}%` }}></div>
                                            <div className={`w-2.5 rounded-t-[2px] transition-all duration-300 ${isCurrent ? 'bg-rose-500 shadow-sm' : 'bg-rose-300 group-hover:bg-rose-400'}`} style={{ height: `${d.out}%` }}></div>
                                        </div>
                                        {/* Label Bulan */}
                                        <span className={`mt-2 text-[10px] transition-colors ${isCurrent ? 'text-emerald-900 font-black' : 'text-emerald-600 group-hover:text-emerald-800 font-bold'}`}>
                                            {d.month}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 2. SUMMARY 3 KARTU (OVERLAPPING)          */}
            {/* ========================================= */}
            <div className="mx-4 -mt-6 relative z-10 flex gap-2">
                {/* KARTU PENDAPATAN */}
                <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-3 shadow-md flex flex-col justify-between h-28 transition-all">
                    <div className="w-6 h-6 bg-emerald-200/50 text-emerald-700 rounded-lg mb-1 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-900 leading-tight">Pendapatan</p>
                        <p className="text-[9px] text-emerald-600 mb-0.5">Rp</p>
                        <p className="text-xs font-black text-slate-800 font-mono leading-none truncate">{activeChart.valIn}</p>
                        <p className="text-[8px] font-bold text-emerald-600 mt-1.5">{activeChart.invIn} Invoices</p>
                    </div>
                </div>

                {/* KARTU PIUTANG */}
                <div className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-3 shadow-md flex flex-col justify-between h-28 transition-all">
                    <div className="w-6 h-6 bg-amber-200/50 text-amber-700 rounded-lg mb-1 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-amber-900 leading-tight">Piutang</p>
                        <p className="text-[9px] text-amber-600 mb-0.5">Rp</p>
                        <p className="text-xs font-black text-slate-800 font-mono leading-none truncate">{activeChart.valPiu}</p>
                        <p className="text-[8px] font-bold text-amber-600 mt-1.5">{activeChart.invPiu} Invoices</p>
                    </div>
                </div>

                {/* KARTU PENGELUARAN */}
                <div className="flex-1 bg-rose-50 border border-rose-100 rounded-2xl p-3 shadow-md flex flex-col justify-between h-28 transition-all">
                    <div className="w-6 h-6 bg-rose-200/50 text-rose-700 rounded-lg mb-1 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-rose-900 leading-tight">Pengeluaran</p>
                        <p className="text-[9px] text-rose-600 mb-0.5">Rp</p>
                        <p className="text-xs font-black text-slate-800 font-mono leading-none truncate">{activeChart.valOut}</p>
                        <p className="text-[8px] font-bold text-rose-600 mt-1.5">{activeChart.invOut} Invoices</p>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 3. RINGKASAN HARI INI                     */}
            {/* ========================================= */}
            <div className="mx-4 mt-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-sm font-bold text-slate-800">Ringkasan Hari Ini</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold">21 Juni 2026</span>
                </div>

                {/* Pendapatan Besar */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex justify-between items-center mb-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-200/50 text-emerald-700 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-900">Pendapatan</p>
                            <p className="text-[9px] font-bold text-emerald-600">123 Invoices</p>
                        </div>
                    </div>
                    <p className="text-xl font-black text-slate-800 font-mono tracking-tight">Rp 2.345.678</p>
                </div>

                {/* Piutang & Pengeluaran */}
                <div className="flex gap-3 mb-3">
                    <div className="flex-1 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 bg-amber-200/50 text-amber-700 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-amber-900">Piutang</p>
                                <p className="text-[8px] font-bold text-amber-600">123 Invs</p>
                            </div>
                        </div>
                        <p className="text-sm font-black text-slate-800 font-mono truncate">Rp 12.345.678</p>
                    </div>

                    <div className="flex-1 bg-rose-50 border border-rose-200 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 bg-rose-200/50 text-rose-700 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-rose-900">Pengeluaran</p>
                                <p className="text-[8px] font-bold text-rose-600">75 Invs</p>
                            </div>
                        </div>
                        <p className="text-sm font-black text-slate-800 font-mono truncate">Rp 2.345.678</p>
                    </div>
                </div>

                {/* Rekap List */}
                <div className="flex gap-3">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-700 mb-2">Rekap Pemasukan</p>
                        <div className="flex justify-between text-[9px] text-slate-500 mb-1.5"><span className="w-12 font-semibold">Cash</span><span className="font-mono font-bold text-slate-700">Rp 1.234.567</span></div>
                        <div className="flex justify-between text-[9px] text-slate-500 mb-1.5"><span className="w-12 font-semibold">Qris</span><span className="font-mono font-bold text-slate-700">Rp 456.789</span></div>
                        <div className="flex justify-between text-[9px] text-slate-500"><span className="w-12 font-semibold">Transfer</span><span className="font-mono font-bold text-slate-700">Rp 12.345.678</span></div>
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-700 mb-2">Rekap Pengeluaran</p>
                        <div className="flex justify-between text-[9px] text-slate-500 mb-1.5"><span className="w-12 font-semibold">Expenses</span><span className="font-mono font-bold text-slate-700">Rp 123.456</span></div>
                        <div className="flex justify-between text-[9px] text-slate-500"><span className="w-12 font-semibold">Restock</span><span className="font-mono font-bold text-slate-700">Rp 345.678</span></div>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 4. QUICK MENU                             */}
            {/* ========================================= */}
            <div className="mx-4 mt-4 bg-amber-400 rounded-3xl p-5 shadow-sm overflow-hidden transition-all duration-300">
                <button
                    onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
                    className="w-full flex justify-between items-center text-amber-900 active:opacity-70 transition-colors"
                >
                    <span className="text-sm font-bold">Quick Menu Akses</span>
                    <svg className={`w-5 h-5 transition-transform duration-300 ${isQuickMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${isQuickMenuOpen ? 'max-h-[500px] opacity-100 mt-5' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-5 gap-y-5">
                        {quickMenus.map((menu, idx) => (
                            <div key={idx} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform transform-gpu">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-1.5 border border-amber-100">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={menu.icon} /></svg>
                                </div>
                                <span className="text-[9px] text-amber-900 font-bold text-center leading-tight px-1">
                                    {menu.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 5. TOP 5 KONSUMEN LOYAL                   */}
            {/* ========================================= */}
            <div className="mx-4 mt-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 mb-4">Top 5 Konsumen Loyal</h3>
                <div className="flex flex-col space-y-3.5">
                    {topConsumers.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center text-xs font-bold shadow-sm">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                                    <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md leading-none inline-block mt-1">
                                        {item.orders} ORDER
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[7px] font-bold text-slate-400 mb-0.5 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 inline-block tracking-widest">TOTAL BELANJA</p>
                                <p className="text-[11px] font-black text-slate-800 font-mono">Rp {item.total}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================================= */}
            {/* 6. TOP 5 MENU TERLARIS                    */}
            {/* ========================================= */}
            <div className="mx-4 mt-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 mb-4">Top 5 Menu Terlaris</h3>
                <div className="flex flex-col space-y-3.5">
                    {topMenus.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center text-xs font-black shadow-sm">
                                    #{idx + 1}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                                    <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md leading-none inline-block mt-1">
                                        {item.orders} TERJUAL
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[7px] font-bold text-slate-400 mb-0.5 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 inline-block tracking-widest">TOTAL OMSET</p>
                                <p className="text-[11px] font-black text-slate-800 font-mono">Rp {item.total}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}