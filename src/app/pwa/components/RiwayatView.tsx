'use client';

import React, { useState } from 'react';

export default function PwaMainContainer() {
    // Default langsung ke transaksi untuk ngetes halaman baru
    const [activeTab, setActiveTab] = useState('transaksi');

    return (
        <div className="min-h-screen text-slate-800 pb-28 max-w-md mx-auto shadow-2xl relative overflow-x-hidden antialiased bg-teal-50">

            {/* Hide Scrollbar Style (Khusus untuk horizontal scroll) */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

            {/* RENDER PAGES BERDASARKAN SELECTION */}
            <div className="transition-all duration-150">
                {activeTab === 'dashboard' && <PageDashboard />}
                {activeTab === 'transaksi' && <PageTransaksi />}
                {activeTab === 'pesanan' && <PagePesanan />}
                {activeTab === 'piutang' && <PagePiutang />}
                {activeTab === 'biaya' && <PageBiaya />}
            </div>

            {/* FIXED BOTTOM NAV */}
            <nav className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl flex justify-around items-center py-2 px-2 shadow-lg border border-slate-100 z-50 max-w-md mx-auto">
                {[
                    { id: 'dashboard', label: 'Dashboard', path: "M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V16zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V16z" },
                    { id: 'transaksi', label: 'Transaksi', path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
                    { id: 'pesanan', label: 'Pesanan', path: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
                    { id: 'piutang', label: 'Piutang', path: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                    { id: 'biaya', label: 'Biaya', path: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
                ].map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${isActive ? 'text-teal-500 scale-105 font-bold' : 'text-slate-400'
                                }`}
                        >
                            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
                            </svg>
                            <span className="text-[10px] tracking-tight">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// HALAMAN 2: RIWAYAT TRANSAKSI (Sesuai Mockup Baru)
// ─────────────────────────────────────────────────────────────────
function PageTransaksi() {
    const [selectedYear, setSelectedYear] = useState('2026');
    // Index bulan (0 = Jan, 3 = Apr). Default kita set ke April sesuai gambar
    const [selectedMonth, setSelectedMonth] = useState(3);
    // Menyimpan ID transaksi yang sedang di-expand (terbuka)
    const [expandedTrx, setExpandedTrx] = useState<number | null>(5);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    // Dummy data chart untuk 12 bulan (Persentase tinggi)
    const chartData = [80, 45, 65, 90, 45, 65, 5, 2, 5, 2, 5, 2];

    // Dummy data transaksi
    const transactions = [
        { id: 1, date: '12', month: '04', name: 'Agam Warmindo', inv: 'INV - 123456789', amount: '534.234', method: 'CASH', badge: 'bg-amber-100 text-amber-600' },
        { id: 2, date: '12', month: '04', name: 'SS Telur', inv: 'INV - 123456789', amount: '230.234', method: 'QRIS', badge: 'bg-amber-100 text-amber-600' },
        { id: 3, date: '11', month: '04', name: 'Bakpia 3 Generasi', inv: 'INV - 123456789', amount: '123.098', method: 'QRIS', badge: 'bg-amber-100 text-amber-600' },
        { id: 4, date: '10', month: '04', name: 'Lisa Untari', inv: 'INV - 123456789', amount: '34.098', method: 'TRANSFER', badge: 'bg-amber-100 text-amber-600' },
        { id: 5, date: '08', month: '04', name: 'Modang', inv: 'INV - 123456789', amount: '12.098', method: 'TRANSFER', badge: 'bg-amber-100 text-amber-600' },
    ];

    return (
        <div className="w-full pb-20">

            {/* 1. BLOK HIJAU BESAR (Dari Header sampai Cards Bulan) */}
            <div className="w-full bg-emerald-500 rounded-b-3xl pb-8">

                {/* NAVBAR */}
                <div className="flex justify-between items-center p-4 text-white">
                    <button className="hover:opacity-80">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <h1 className="text-lg font-bold tracking-wide">Riwayat Transaksi</h1>
                    <button className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center font-bold text-lg">
                        !
                    </button>
                </div>

                {/* INFO TOKO & FILTER TAHUN */}
                <div className="px-4 pb-4 pt-2 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Toko Tuan dan Nyonya</h2>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="appearance-none bg-white text-gray-800 text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg outline-none cursor-pointer"
                            >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                            </div>
                        </div>
                        <button className="text-white hover:opacity-80 transition-transform active:rotate-180">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                    </div>
                </div>

                {/* CHART 12 BULAN */}
                <div className="mx-4 bg-teal-50 bg-opacity-95 rounded-2xl p-4 shadow-sm mb-4">
                    <div className="flex items-end justify-between h-32 gap-1 pb-2 border-b border-emerald-200/50">
                        {chartData.map((h, i) => {
                            const isActive = selectedMonth === i;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                                    <div
                                        className={`w-full rounded-t-sm transition-colors duration-300 ${isActive ? 'bg-emerald-600' : 'bg-emerald-300'}`}
                                        style={{ height: `${h}%` }}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        {months.map((m, i) => (
                            <span key={i} className="text-[9px] text-emerald-800 font-medium origin-center -rotate-90 block mt-2">{m}</span>
                        ))}
                    </div>
                </div>

                {/* HORIZONTAL SCROLL CARDS (Filter Bulan) */}
                <div className="flex overflow-x-auto gap-2 px-4 pb-2 snap-x hide-scrollbar">
                    {months.map((m, i) => {
                        const isActive = selectedMonth === i;
                        return (
                            <div
                                key={i}
                                onClick={() => setSelectedMonth(i)}
                                className={`snap-center shrink-0 w-24 p-2.5 rounded-xl cursor-pointer transition-colors duration-200 ${isActive ? 'bg-emerald-900 text-white' : 'bg-emerald-400 bg-opacity-40 text-emerald-900'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-emerald-800'}`}>{m.toUpperCase()}</span>
                                    <span className={`text-[8px] font-medium ${isActive ? 'text-emerald-200' : 'text-emerald-700'}`}>12 Trx</span>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className={`text-[8px] pb-0.5 ${isActive ? 'text-emerald-200' : 'text-emerald-700'}`}>Rp</span>
                                    <span className="text-xs font-bold leading-none tracking-tight">12.345.678</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 2. CARD TOTAL OMZET (Menggantung overlapping warna hijau) */}
            <div className="mx-4 -mt-6 relative z-10">
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">

                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-xs font-bold text-slate-700">Total Omzet {months[selectedMonth]} {selectedYear}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] text-slate-500 font-bold">Rp</span>
                            <span className="text-lg font-black text-emerald-700">12.345.678</span>
                        </div>
                    </div>

                    {/* Sub Cards Breakdown (Tunai, QRIS, Transfer) */}
                    <div className="flex gap-2">

                        {/* TUNAI */}
                        <div className="flex-1 bg-gradient-to-b from-teal-50 to-teal-100/50 rounded-xl p-3 border border-teal-100/50">
                            <div className="w-5 h-5 text-emerald-600 mb-1.5">
                                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <span className="text-[9px] font-bold text-slate-700 tracking-wide block mb-1">TUNAI</span>
                            <p className="text-[8px] text-slate-500 mb-0.5">Rp</p>
                            <p className="text-sm font-black text-slate-900 leading-none">12.345.678</p>
                            <span className="text-[8px] text-slate-500 block mt-1.5">123 Invoices</span>
                        </div>

                        {/* QRIS */}
                        <div className="flex-1 bg-gradient-to-b from-teal-50 to-teal-100/50 rounded-xl p-3 border border-teal-100/50">
                            <div className="w-5 h-5 text-emerald-600 mb-1.5">
                                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                            </div>
                            <span className="text-[9px] font-bold text-slate-700 tracking-wide block mb-1">QRIS</span>
                            <p className="text-[8px] text-slate-500 mb-0.5">Rp</p>
                            <p className="text-sm font-black text-slate-900 leading-none">12.345.678</p>
                            <span className="text-[8px] text-slate-500 block mt-1.5">123 Invoices</span>
                        </div>

                        {/* TRANSFER */}
                        <div className="flex-1 bg-gradient-to-b from-teal-50 to-teal-100/50 rounded-xl p-3 border border-teal-100/50">
                            <div className="w-5 h-5 text-emerald-600 mb-1.5">
                                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </div>
                            <span className="text-[9px] font-bold text-slate-700 tracking-wide block mb-1">TRANSFER</span>
                            <p className="text-[8px] text-slate-500 mb-0.5">Rp</p>
                            <p className="text-sm font-black text-slate-900 leading-none">12.345.678</p>
                            <span className="text-[8px] text-slate-500 block mt-1.5">123 Invoices</span>
                        </div>

                    </div>
                </div>
            </div>

            {/* 3. CARD DAFTAR RIWAYAT TRANSAKSI (Expandable) */}
            <div className="mx-4 mt-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 mb-4">Data Riwayat Transaksi bulan {months[selectedMonth]} {selectedYear}</h3>

                <div className="flex flex-col space-y-4">
                    {transactions.map(trx => {
                        const isExpanded = expandedTrx === trx.id;

                        return (
                            <div key={trx.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">

                                {/* Header Transaksi */}
                                <div
                                    className="flex items-center justify-between cursor-pointer active:opacity-70"
                                    onClick={() => setExpandedTrx(isExpanded ? null : trx.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500 text-white rounded-lg p-1.5 flex flex-col items-center justify-center min-w-[36px] shadow-sm">
                                            <span className="text-xs font-bold leading-none">{trx.date}</span>
                                            <span className="text-[9px] leading-none mt-0.5">{trx.month}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{trx.name}</p>
                                            <p className="text-[9px] text-emerald-500 font-mono mt-0.5">{trx.inv}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-[11px] font-mono text-slate-700 font-semibold"><span className="text-[9px] text-slate-400 mr-1">Rp</span>{trx.amount}</p>
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block ${trx.badge}`}>{trx.method}</span>
                                        </div>
                                        <div className={`w-6 h-6 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'rotate-180 bg-emerald-200' : ''}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Detail View */}
                                {isExpanded && (
                                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200 pl-12 pr-1 animate-fadeIn">

                                        {/* Alamat */}
                                        <div className="flex items-start gap-1.5 mb-3 text-emerald-500">
                                            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="text-[10px] leading-tight font-medium">Alamat yang tercatat di database konsumen</span>
                                        </div>

                                        {/* Rincian Pesanan */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-1.5">
                                                    <span className="text-slate-400 text-[10px] mt-0.5">{'>'}</span>
                                                    <div>
                                                        <p className="text-[10px] text-slate-700 font-medium">Menu Paket A</p>
                                                        <p className="text-[9px] text-emerald-500">1 x Rp 5.000</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-600">Rp 5.000</span>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-1.5">
                                                    <span className="text-slate-400 text-[10px] mt-0.5">{'>'}</span>
                                                    <div>
                                                        <p className="text-[10px] text-slate-700 font-medium">Menu Paket B</p>
                                                        <p className="text-[9px] text-emerald-500">1 x Rp 7.000</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-600">Rp 7.000</span>
                                            </div>
                                        </div>

                                        {/* Tombol Action */}
                                        <div className="flex gap-2">
                                            <button className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm hover:bg-emerald-600 active:scale-95">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                            </button>
                                            <button className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm hover:bg-amber-600 active:scale-95">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </button>
                                            <button className="w-8 h-8 rounded-lg bg-gray-500 text-white flex items-center justify-center shadow-sm hover:bg-gray-600 active:scale-95">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                            </button>
                                            <button className="flex-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold tracking-widest flex items-center justify-center gap-1 shadow-sm hover:bg-emerald-600 active:scale-95">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                LUNAS
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }
                    )}
                </div>
            </div>

        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// PAGE DUMMY LAINNYA 
// ─────────────────────────────────────────────────────────────────
function PageDashboard() { return <div className="p-8 text-center text-gray-500 mt-20">Halaman Dashboard (Sudah dibikin di tahap sebelumnya)</div>; }
function PagePesanan() { return <div className="p-8 text-center text-gray-500 mt-20">Halaman Pesanan</div>; }
function PagePiutang() { return <div className="p-8 text-center text-gray-500 mt-20">Halaman Piutang</div>; }
function PageBiaya() { return <div className="p-8 text-center text-gray-500 mt-20">Halaman Biaya</div>; }