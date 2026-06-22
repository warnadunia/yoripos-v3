'use client';

import React, { useState } from 'react';

// Terima props onOpenPos dari page.tsx
export default function DashboardView({ onOpenPos }: { onOpenPos: () => void }) {
    const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(true);

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

    const topConsumers = [
        { name: 'Agam Warmindo', orders: 20, total: '5.234.234' },
        { name: 'SS Telur', orders: 20, total: '230.234' },
        { name: 'Bakpia 3 Generasi', orders: 8, total: '123.098' },
        { name: 'Lisa Untari', orders: 5, total: '34.098' },
        { name: 'Madang', orders: 3, total: '12.098' },
    ];

    const topMenus = [
        { name: 'Menu 1', orders: 20, total: '5.234.234' },
        { name: 'Menu 2', orders: 20, total: '230.234' },
        { name: 'Menu 3', orders: 8, total: '123.098' },
        { name: 'Menu 4', orders: 5, total: '34.098' },
        { name: 'Menu 5', orders: 3, total: '12.098' },
    ];

    return (
        <div className="w-full pb-24 relative">

            {/* ========================================= */}
            {/* 1. BLOK HIJAU BESAR                       */}
            {/* ========================================= */}
            <div className="w-full bg-emerald-500 rounded-b-3xl pb-8">

                {/* NAVBAR ATAS */}
                <div className="flex justify-between items-center p-4 text-white">
                    <button className="hover:opacity-80">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <h1 className="text-lg font-bold tracking-wide">Dashboard</h1>
                    <button className="hover:opacity-80">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                </div>

                {/* INFO TOKO & USER & TOMBOL ORDER BARU */}
                <div className="px-4 pb-4 pt-2 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold">Toko Tuan dan Nyonya</h2>
                        <div className="flex items-center mt-1.5 text-xs text-emerald-100">
                            <span>Username login sebagai</span>
                            <span className="ml-2 bg-gray-900 bg-opacity-40 px-3 py-0.5 rounded-full text-xs font-bold text-white tracking-wide">
                                Admin
                            </span>
                        </div>
                    </div>
                    {/* Tombol Order Baru - MENGGUNAKAN PROPS onOpenPos */}
                    <button
                        onClick={onOpenPos}
                        className="bg-[#FFD166] hover:bg-[#ffc63b] text-amber-900 text-xs font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Order Baru
                    </button>
                </div>

                {/* CARD PUTIH: RINGKASAN HARI INI */}
                <div className="mx-4 bg-white rounded-3xl p-4 shadow-sm relative z-10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-800">Ringkasan Hari Ini</span>
                        <span className="text-xs text-gray-500 font-medium">21 Juni 2026</span>
                    </div>

                    <div className="flex gap-2 w-full">
                        {/* Box Pendapatan */}
                        <div className="flex-1 bg-teal-100 bg-opacity-60 rounded-xl p-3 flex flex-col justify-between">
                            <div>
                                <div className="w-6 h-6 mb-2 text-teal-600 bg-teal-200 bg-opacity-50 p-1 rounded-md"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                                <p className="text-xs font-medium text-gray-800 mb-0.5">Pendapatan</p>
                                <p className="text-xs text-gray-500 scale-90 origin-left">Rp</p>
                                <p className="text-sm font-black text-gray-900 leading-none mt-0.5">12.345.678</p>
                                <p className="text-xs text-gray-500 mt-1.5 scale-90 origin-left">123 Invoices</p>
                            </div>
                            <p className="text-xs italic text-gray-400 mt-4 leading-tight scale-75 origin-bottom-left">* Total Pendapatan dari transaksi LUNAS</p>
                        </div>
                        {/* Box Piutang */}
                        <div className="flex-1 bg-amber-100 bg-opacity-60 rounded-xl p-3 flex flex-col justify-between">
                            <div>
                                <div className="w-6 h-6 mb-2 text-amber-600 bg-amber-200 bg-opacity-50 p-1 rounded-md"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                                <p className="text-xs font-medium text-gray-800 mb-0.5">Piutang</p>
                                <p className="text-xs text-gray-500 scale-90 origin-left">Rp</p>
                                <p className="text-sm font-black text-gray-900 leading-none mt-0.5">12.345.678</p>
                                <p className="text-xs text-gray-500 mt-1.5 scale-90 origin-left">123 Invoices</p>
                            </div>
                            <p className="text-xs italic text-gray-400 mt-4 leading-tight scale-75 origin-bottom-left">* Total Pesanan Terkirim dan belum terbayar</p>
                        </div>
                        {/* Box Pengeluaran */}
                        <div className="flex-1 bg-rose-100 bg-opacity-60 rounded-xl p-3 flex flex-col justify-between">
                            <div>
                                <div className="w-6 h-6 mb-2 text-rose-500 bg-rose-200 bg-opacity-50 p-1 rounded-md"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg></div>
                                <p className="text-xs font-medium text-gray-800 mb-0.5">Pengeluaran</p>
                                <p className="text-xs text-gray-500 scale-90 origin-left">Rp</p>
                                <p className="text-sm font-black text-gray-900 leading-none mt-0.5">12.345.678</p>
                                <p className="text-xs text-gray-500 mt-1.5 scale-90 origin-left">123 Invoices</p>
                            </div>
                            <p className="text-xs italic text-gray-400 mt-4 leading-tight scale-75 origin-bottom-left">* Total Pengeluaran dan biaya Stock</p>
                        </div>
                    </div>

                    {/* 2 Kotak Abu-abu Rekap Bawah */}
                    <div className="flex gap-2 w-full mt-3">
                        <div className="flex-1 bg-gray-100 rounded-xl p-3">
                            <p className="text-xs font-bold text-gray-800 mb-2 scale-90 origin-left">Rekap Pemasukan</p>
                            <div className="flex justify-between text-xs text-gray-600 mb-1 scale-90 origin-left w-full"><span className="w-12">Cash</span><span className="font-mono text-gray-800">Rp 1.234.567</span></div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1 scale-90 origin-left w-full"><span className="w-12">Qris</span><span className="font-mono text-gray-800">Rp 456.789</span></div>
                            <div className="flex justify-between text-xs text-gray-600 scale-90 origin-left w-full"><span className="w-12">Transfer</span><span className="font-mono text-gray-800">Rp 12.345.678</span></div>
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-xl p-3">
                            <p className="text-xs font-bold text-gray-800 mb-2 scale-90 origin-left">Rekap Pengeluaran</p>
                            <div className="flex justify-between text-xs text-gray-600 mb-1 scale-90 origin-left w-full"><span className="w-14">Expenses</span><span className="font-mono text-gray-800">Rp 123.456</span></div>
                            <div className="flex justify-between text-xs text-gray-600 scale-90 origin-left w-full"><span className="w-14">Restock</span><span className="font-mono text-gray-800">Rp 345.678</span></div>
                        </div>
                    </div>
                </div>

                {/* QUICK MENU HIDE & SEEK (COLLAPSIBLE) */}
                <div className="mx-4 mt-6 bg-[#FFD166] rounded-3xl shadow-sm overflow-hidden transition-all duration-300 border border-amber-300/50">
                    <button
                        onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
                        className="w-full flex justify-between items-center p-4 px-5 text-amber-900 active:bg-amber-300/50 transition-colors"
                    >
                        <span className="text-sm font-bold">Quick Menu</span>
                        <svg className={`w-5 h-5 transition-transform duration-300 ${isQuickMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                    </button>

                    <div className={`transition-all duration-300 ease-in-out ${isQuickMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-2 pb-6 pt-1 grid grid-cols-5 gap-y-6">
                            {quickMenus.map((menu, idx) => (
                                <div key={idx} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm mb-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={menu.icon} /></svg>
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] text-amber-900 font-bold text-center leading-tight px-1">
                                        {menu.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* ========================================= */}
            {/* 2. BLOK REVENUE CHART                     */}
            {/* ========================================= */}
            <div className="px-4 mt-6">
                <div className="border border-emerald-100 rounded-3xl p-5 bg-white bg-opacity-50">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-emerald-500">Revenue</h3>
                        <div className="flex gap-2 text-xs text-emerald-600 font-medium scale-90 origin-right">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>Penerimaan</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-300 rounded-sm"></span>Piutang</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-600 rounded-sm"></span>Biaya</span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">Rp 15.000.000</p>
                    <div className="flex justify-between items-end h-24 mt-6 w-full gap-2">
                        {[60, 80, 50, 90, 70, 85].map((h, i) => (
                            <div key={i} className="flex-1 flex items-end h-full gap-0.5">
                                <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${h}%` }}></div>
                                <div className="w-full bg-emerald-300 rounded-t" style={{ height: `${h * 0.7}%` }}></div>
                                <div className="w-full bg-emerald-600 rounded-t" style={{ height: `${h * 0.4}%` }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 3. CARD RINGKASAN BULAN INI               */}
            {/* ========================================= */}
            <div className="mx-4 bg-white rounded-3xl p-4 shadow-sm mt-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-gray-800">Ringkasan Bulan Ini</span>
                    <span className="text-xs text-gray-500 font-medium">Juni 2026</span>
                </div>

                <div className="flex gap-2 w-full">
                    <div className="flex-1 bg-teal-100 bg-opacity-60 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                            <div className="w-6 h-6 mb-2 text-teal-600 bg-teal-200 bg-opacity-50 p-1 rounded-md"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                            <p className="text-xs font-medium text-gray-800 mb-0.5">Pendapatan</p>
                            <p className="text-xs text-gray-500 scale-90 origin-left">Rp</p>
                            <p className="text-sm font-black text-gray-900 leading-none mt-0.5">12.345.678</p>
                            <p className="text-xs text-gray-500 mt-1.5 scale-90 origin-left">123 Invoices</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-amber-100 bg-opacity-60 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                            <div className="w-6 h-6 mb-2 text-amber-600 bg-amber-200 bg-opacity-50 p-1 rounded-md"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                            <p className="text-xs font-medium text-gray-800 mb-0.5">Piutang</p>
                            <p className="text-xs text-gray-500 scale-90 origin-left">Rp</p>
                            <p className="text-sm font-black text-gray-900 leading-none mt-0.5">12.345.678</p>
                            <p className="text-xs text-gray-500 mt-1.5 scale-90 origin-left">123 Invoices</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-rose-100 bg-opacity-60 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                            <div className="w-6 h-6 mb-2 text-rose-500 bg-rose-200 bg-opacity-50 p-1 rounded-md"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg></div>
                            <p className="text-xs font-medium text-gray-800 mb-0.5">Pengeluaran</p>
                            <p className="text-xs text-gray-500 scale-90 origin-left">Rp</p>
                            <p className="text-sm font-black text-gray-900 leading-none mt-0.5">12.345.678</p>
                            <p className="text-xs text-gray-500 mt-1.5 scale-90 origin-left">123 Invoices</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 4. TOP 5 KONSUMEN LOYAL                   */}
            {/* ========================================= */}
            <div className="mx-4 mt-6 bg-white rounded-3xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-5">Top 5 Konsumen Loyal</h3>
                <div className="flex flex-col space-y-4">
                    {topConsumers.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                    {item.name.charAt(0)}
                                </div>
                                <span className="text-xs font-semibold text-gray-800">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded scale-90 origin-right">
                                    {item.orders} ORDER
                                </span>
                                <span className="text-xs font-mono font-medium text-gray-600 w-20 text-right">
                                    Rp {item.total}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================================= */}
            {/* 5. TOP 5 MENU TERLARIS                    */}
            {/* ========================================= */}
            <div className="mx-4 mt-6 bg-white rounded-3xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-5">Top 5 Menu Terlaris</h3>
                <div className="flex flex-col space-y-4">
                    {topMenus.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                    {item.name.charAt(0)}
                                </div>
                                <span className="text-xs font-semibold text-gray-800">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded scale-90 origin-right">
                                    {item.orders} ORDER
                                </span>
                                <span className="text-xs font-mono font-medium text-gray-600 w-20 text-right">
                                    Rp {item.total}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}