'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function PesananView() {
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedMonth, setSelectedMonth] = useState('APR');
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'AMBIL_TOKO', 'DELIVERY'
    const [expandedTrx, setExpandedTrx] = useState<number | null>(1); // Default buka 1 untuk demo
    const scrollRef = useRef<HTMLDivElement>(null);

    // Modal States (Slide-Up Bottom Sheets)
    const [activeModal, setActiveModal] = useState('none'); // 'none' | 'proses' | 'pembayaran' | 'sukses_bayar' | 'sukses_piutang'
    const [paymentMethod, setPaymentMethod] = useState('TUNAI');

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGS', 'SEP', 'OKT', 'NOV', 'DES'];

    // Data bulanan untuk Chart dan Summary
    const monthlyData = [
        { month: 'JAN', chartVal: 80, totalOrd: 15, ambil: 10, ambilTot: '1.000.000', kirim: 5, kirimTot: '500.000' },
        { month: 'FEB', chartVal: 45, totalOrd: 8, ambil: 5, ambilTot: '400.000', kirim: 3, kirimTot: '200.000' },
        { month: 'MAR', chartVal: 65, totalOrd: 12, ambil: 8, ambilTot: '800.000', kirim: 4, kirimTot: '400.000' },
        { month: 'APR', chartVal: 90, totalOrd: 9, ambil: 4, ambilTot: '123.456', kirim: 5, kirimTot: '234.567' },
        { month: 'MEI', chartVal: 50, totalOrd: 10, ambil: 6, ambilTot: '600.000', kirim: 4, kirimTot: '400.000' },
        { month: 'JUN', chartVal: 70, totalOrd: 14, ambil: 10, ambilTot: '1.200.000', kirim: 4, kirimTot: '500.000' },
        { month: 'JUL', chartVal: 5, totalOrd: 2, ambil: 1, ambilTot: '100.000', kirim: 1, kirimTot: '100.000' },
        { month: 'AGS', chartVal: 2, totalOrd: 1, ambil: 1, ambilTot: '50.000', kirim: 0, kirimTot: '0' },
        { month: 'SEP', chartVal: 5, totalOrd: 3, ambil: 2, ambilTot: '200.000', kirim: 1, kirimTot: '100.000' },
        { month: 'OKT', chartVal: 2, totalOrd: 1, ambil: 0, ambilTot: '0', kirim: 1, kirimTot: '150.000' },
        { month: 'NOV', chartVal: 5, totalOrd: 4, ambil: 2, ambilTot: '300.000', kirim: 2, kirimTot: '300.000' },
        { month: 'DES', chartVal: 2, totalOrd: 2, ambil: 1, ambilTot: '200.000', kirim: 1, kirimTot: '250.000' },
    ];

    const allOrders = [
        { id: 1, date: '12', month: '04', monthName: 'APR', name: 'Agam Warmindo', ord: 'ORD - 123456789', amount: '534.234', status: 'DITERIMA', type: 'DELIVERY' },
        { id: 2, date: '12', month: '04', monthName: 'APR', name: 'SS Telur', ord: 'ORD - 123456789', amount: '230.234', status: 'DITERIMA', type: 'AMBIL_TOKO' },
        { id: 3, date: '11', month: '04', monthName: 'APR', name: 'Bakpia 3 Generasi', ord: 'ORD - 123456789', amount: '123.098', status: 'SIAP', type: 'DELIVERY' },
        { id: 4, date: '10', month: '04', monthName: 'APR', name: 'Lisa Untari', ord: 'ORD - 123456789', amount: '34.098', status: 'SIAP', type: 'AMBIL_TOKO' },
        { id: 5, date: '08', month: '04', monthName: 'APR', name: 'Modang', ord: 'ORD - 123456789', amount: '12.098', status: 'SIAP', type: 'DELIVERY' },
        { id: 6, date: '15', month: '03', monthName: 'MAR', name: 'Toko Sejahtera', ord: 'ORD - 987654321', amount: '450.000', status: 'SIAP', type: 'AMBIL_TOKO' },
    ];

    const activeData = monthlyData.find(d => d.month === selectedMonth) || monthlyData[3];

    const handleFilterClick = (type: string) => {
        setFilterType(prev => prev === type ? 'ALL' : type);
    };

    const filteredOrders = allOrders.filter(o => {
        const matchMonth = o.monthName === selectedMonth;
        const matchType = filterType === 'ALL' ? true : o.type === filterType;
        return matchMonth && matchType;
    });

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollLeft = 140;
    }, []);

    const monthFullNames: { [key: string]: string } = {
        'JAN': 'Januari', 'FEB': 'Februari', 'MAR': 'Maret', 'APR': 'April',
        'MEI': 'Mei', 'JUN': 'Juni', 'JUL': 'Juli', 'AGS': 'Agustus',
        'SEP': 'September', 'OKT': 'Oktober', 'NOV': 'November', 'DES': 'Desember'
    };

    return (
        <div className="w-full min-h-screen bg-[#E8F8F5] pb-28 relative font-sans text-gray-800">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* ========================================= */}
            {/* 1. WRAPPER HIJAU (Header & Chart)         */}
            {/* ========================================= */}
            <div className="w-full bg-[#10B981] rounded-b-[2rem] pb-8 pt-2 shadow-sm">
                <div className="flex justify-between items-center px-5 py-3 text-white">
                    <button className="hover:opacity-80">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <h1 className="text-base font-bold">Riwayat Pesanan</h1>
                    <button className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center font-bold">!</button>
                </div>

                <div className="px-5 pb-2 pt-2 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Toko Tuan dan Nyonya</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="appearance-none bg-white text-gray-800 text-sm font-bold py-1.5 pl-3 pr-7 rounded-lg outline-none cursor-pointer"
                            >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                            </select>
                            <svg className="w-4 h-4 text-gray-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                        </div>
                        <button className="text-white hover:rotate-180 transition-transform duration-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                    </div>
                </div>

                {/* KARTU PUTIH: CHART BAR INTERAKTIF */}
                <div className="mx-4 mt-5 bg-white rounded-2xl p-4 px-3 shadow-sm border border-emerald-50">
                    <div className="flex items-end justify-between h-36 gap-1 pb-1 border-b border-[#10B981]/20">
                        {monthlyData.map((d, i) => {
                            const isSelected = d.month === selectedMonth;
                            return (
                                <div
                                    key={i}
                                    onClick={() => setSelectedMonth(d.month)}
                                    className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                                >
                                    <div
                                        className={`w-full max-w-[14px] rounded-t transition-all duration-300 ${isSelected ? 'bg-[#F59E0B]' : 'bg-[#7EE0C6] group-hover:bg-[#10B981]'}`}
                                        style={{ height: `${d.chartVal}%` }}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        {monthlyData.map((d, i) => (
                            <span
                                key={i}
                                onClick={() => setSelectedMonth(d.month)}
                                className={`text-[10px] cursor-pointer origin-center -rotate-90 block mt-3 transition-colors ${d.month === selectedMonth ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-emerald-600 font-medium'}`}
                            >
                                {d.month.charAt(0) + d.month.charAt(1).toLowerCase() + d.month.charAt(2).toLowerCase()}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 2. WRAPPER PUTIH 1 (SLIDER & 2 KARTU)     */}
            {/* ========================================= */}
            <div className="mx-4 mt-4 bg-white rounded-3xl p-5 shadow-sm border border-gray-300">

                {/* SLIDER BULAN HORIZONTAL */}
                <div ref={scrollRef} className="flex overflow-x-auto gap-3 pb-2 -mx-1 px-1 snap-x hide-scrollbar">
                    {monthlyData.map((d, i) => {
                        const isSelected = d.month === selectedMonth;
                        return (
                            <div
                                key={i}
                                onClick={() => setSelectedMonth(d.month)}
                                className={`snap-center shrink-0 w-[100px] p-3 rounded-xl cursor-pointer transition-all duration-300 border ${isSelected ? 'bg-[#F59E0B] border-[#F59E0B] shadow-sm' : 'bg-[#E8F8F5] border-[#10B981]/30 hover:border-[#10B981]'}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-bold ${isSelected ? 'text-amber-900' : 'text-[#10B981]'}`}>{d.month}</span>
                                    <span className={`text-[10px] font-medium ${isSelected ? 'text-amber-900' : 'text-[#10B981]'}`}>{d.totalOrd} Trx</span>
                                </div>
                                <p className={`text-xs font-bold ${isSelected ? 'text-amber-900' : 'text-[#10B981]'}`}>
                                    <span className="text-[10px] mr-1">Rp</span>{d.ambilTot}
                                </p>
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-between items-center mt-6 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-sm font-bold">Total Pesanan {monthFullNames[selectedMonth]} {selectedYear}</span>
                    </div>
                    <div className="flex items-baseline gap-1 text-gray-800">
                        <span className="text-xl font-bold">{activeData.totalOrd}</span>
                        <span className="text-sm font-bold text-gray-500">ORDER</span>
                    </div>
                </div>

                {/* 2 KARTU STATUS PENGIRIMAN */}
                <div className="flex gap-3">
                    {/* AMBIL TOKO */}
                    <div
                        onClick={() => handleFilterClick('AMBIL_TOKO')}
                        className={`flex-1 bg-[#E8F8F5] rounded-xl p-3 cursor-pointer transition-all duration-200 border ${filterType === 'AMBIL_TOKO' ? 'border-[#10B981] shadow-sm bg-[#D1F2EB] scale-[1.02]' : 'border-[#10B981]/20 hover:border-[#10B981]/50'}`}
                    >
                        <div className="w-6 h-6 text-[#10B981] mb-2"><svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
                        <span className="text-[11px] font-medium text-gray-800 block mb-1">AMBIL TOKO</span>
                        <p className="text-lg font-bold text-gray-900 leading-none mb-1">{activeData.ambil} <span className="text-[10px] text-gray-500">ORDER</span></p>
                        <span className="text-[10px] text-gray-600 block">Total Rp {activeData.ambilTot}</span>
                    </div>

                    {/* DELIVERY */}
                    <div
                        onClick={() => handleFilterClick('DELIVERY')}
                        className={`flex-1 bg-[#FFF8E1] rounded-xl p-3 cursor-pointer transition-all duration-200 border ${filterType === 'DELIVERY' ? 'border-[#F59E0B] shadow-sm scale-[1.02]' : 'border-[#F59E0B]/20 hover:border-[#F59E0B]/50'}`}
                    >
                        <div className="w-6 h-6 text-[#F59E0B] mb-2"><svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg></div>
                        <span className="text-[11px] font-medium text-gray-800 block mb-1">DELIVERY</span>
                        <p className="text-lg font-bold text-gray-900 leading-none mb-1">{activeData.kirim} <span className="text-[10px] text-gray-500">ORDER</span></p>
                        <span className="text-[10px] text-gray-600 block">Total Rp {activeData.kirimTot}</span>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* 3. WRAPPER PUTIH 2 (LISTING TRANSAKSI)    */}
            {/* ========================================= */}
            <div className="mx-4 mt-4 bg-white rounded-3xl p-5 shadow-sm border border-gray-300">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-bold text-gray-800">Data Pesanan bulan {monthFullNames[selectedMonth]} {selectedYear}</h3>
                    {filterType !== 'ALL' && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${filterType === 'AMBIL_TOKO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            Filter: {filterType.replace('_', ' ')}
                        </span>
                    )}
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm font-medium">
                        Tidak ada pesanan {filterType !== 'ALL' ? filterType.replace('_', ' ') : ''} di bulan ini.
                    </div>
                ) : (
                    <div className="flex flex-col space-y-4">
                        {filteredOrders.map(trx => {
                            const isExpanded = expandedTrx === trx.id;
                            const isDiterima = trx.status === 'DITERIMA';

                            return (
                                <div key={trx.id} className={`border-b border-gray-100 pb-4 last:border-0 last:pb-0 transition-opacity ${isDiterima ? 'opacity-50' : 'opacity-100'}`}>

                                    <div
                                        className="flex items-center justify-between cursor-pointer active:opacity-70"
                                        onClick={() => setExpandedTrx(isExpanded ? null : trx.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#10B981] text-white rounded-[0.6rem] p-1.5 flex flex-col items-center justify-center min-w-[36px] shadow-sm">
                                                <span className="text-[14px] font-black leading-none tracking-tight">{trx.date}</span>
                                                <span className="text-[10px] font-bold leading-none mt-1">{trx.month}</span>
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-medium text-gray-800">{trx.name}</p>
                                                <p className="text-[10px] text-[#10B981] font-mono mt-0.5">{trx.ord}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right flex flex-col items-end">
                                                <p className="text-[13px] font-mono text-gray-800 font-bold"><span className="text-[9px] text-gray-400 mr-1">Rp</span>{trx.amount}</p>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded mt-1 inline-block uppercase tracking-widest ${isDiterima ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#F59E0B] text-white shadow-sm'}`}>
                                                    {trx.status}
                                                </span>
                                            </div>
                                            <div className={`w-7 h-7 bg-[#E8F8F5] text-[#10B981] rounded-lg flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'rotate-180 bg-emerald-200' : ''}`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 pl-12 pr-1">

                                            <div className="flex items-start gap-1.5 mb-4 text-[#10B981]">
                                                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="text-xs font-medium">Alamat yang tercatat di database konsumen</span>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-400 text-xs mt-0.5">{'>'}</span>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-800">Menu Paket A</p>
                                                            <p className="text-[10px] text-gray-500 mt-0.5">1 x Rp 5.000</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-800">Rp<span className="ml-2">5.000</span></span>
                                                </div>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-400 text-xs mt-0.5">{'>'}</span>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-800">Menu Paket B</p>
                                                            <p className="text-[10px] text-gray-500 mt-0.5">1 x Rp 7.000</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-800">Rp<span className="ml-2">7.000</span></span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button disabled={isDiterima} className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${isDiterima ? 'bg-gray-300 text-white' : 'bg-[#10B981] text-white hover:bg-emerald-600 active:scale-95 transition-transform'}`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                </button>
                                                <button disabled={isDiterima} className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${isDiterima ? 'bg-gray-300 text-white' : 'bg-[#F59E0B] text-white hover:bg-amber-600 active:scale-95 transition-transform'}`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </button>
                                                <button disabled={isDiterima} className="w-10 h-10 rounded-lg bg-gray-500 text-white flex items-center justify-center shadow-sm hover:bg-gray-600 active:scale-95 transition-transform">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                </button>
                                                <button
                                                    disabled={isDiterima}
                                                    onClick={() => setActiveModal('proses')}
                                                    className={`flex-1 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-transform ${isDiterima ? 'bg-gray-300 text-white' : 'bg-[#10B981] text-white hover:bg-emerald-600 active:scale-95'}`}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    PROSES PESANAN
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* OVERLAYS / BOTTOM SHEETS SECTION (PROSES, PEMBAYARAN, SUKSES)             */}
            {/* ========================================================================= */}
            {activeModal !== 'none' && (
                <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 60 }}>
                    <div className="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal('none')}></div>

                    {/* 1. BOTTOM SHEET : P R O S E S   P E S A N A N */}
                    {activeModal === 'proses' && (
                        <div className="relative w-full max-w-md bg-[#10B981] rounded-t-3xl p-5 pb-28 shadow-2xl animate-slideUp flex flex-col" style={{ maxHeight: '90vh' }}>
                            <div className="w-12 h-1.5 bg-emerald-300 rounded-full mx-auto mb-4 shrink-0"></div>

                            <div className="flex justify-between items-center mb-4 text-white shrink-0">
                                <h3 className="text-lg font-bold">Detail Pengiriman</h3>
                                <button onClick={() => setActiveModal('none')} className="p-1 rounded-full hover:bg-emerald-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow-inner overflow-y-auto hide-scrollbar">
                                <p className="text-[#10B981] font-semibold text-xs mb-2 flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Senin, 22 Juni 2026</p>
                                <div className="flex items-start gap-2 mb-3">
                                    <svg className="w-5 h-5 text-emerald-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <div>
                                        <p className="text-lg font-bold text-gray-800">Modang (nama konsumen)</p>
                                        <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-0.5 rounded">ORD-1234567</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 mb-4">
                                    <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-800">Lokasi Pengiriman / Alamat Konsumen</p>
                                        <span className="bg-lime-500 text-white text-[10px] px-2 py-0.5 rounded inline-block mt-1 cursor-pointer">Buka di Maps</span>
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-xl p-4 mb-4">
                                    <p className="text-xs font-bold text-gray-800 mb-3">Rincian Menu</p>
                                    <div className="flex justify-between text-xs text-gray-600 mb-2"><span>1x Menu Paket A</span><span>Rp 5.000</span></div>
                                    <div className="flex justify-between text-xs text-gray-600 mb-4"><span>1x Menu Paket B</span><span>Rp 7.000</span></div>
                                    <div className="bg-[#D1F2EB] rounded-lg p-3 flex justify-between items-center font-bold text-emerald-800">
                                        <span>Total Tagihan</span><span>Rp 12.000</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <button className="bg-lime-500 text-white rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> Kirim Nota WA</button>
                                    <button className="bg-gray-500 text-white rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> Print Nota</button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="bg-red-600 text-white rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-1 shadow-md" onClick={() => setActiveModal('sukses_piutang')}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> PIUTANG</button>
                                    <button className="bg-[#10B981] text-white rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-1 shadow-md" onClick={() => setActiveModal('pembayaran')}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> PEMBAYARAN</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. BOTTOM SHEET : P E M B A Y A R A N */}
                    {activeModal === 'pembayaran' && (
                        <div className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-28 shadow-2xl animate-slideUp flex flex-col" style={{ maxHeight: '90vh' }}>
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 shrink-0"></div>

                            <div className="flex justify-between items-center mb-4 text-gray-800 shrink-0">
                                <h3 className="text-lg font-bold">Metode Pembayaran</h3>
                                <button onClick={() => setActiveModal('proses')} className="p-1 rounded-full hover:bg-gray-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
                            </div>

                            <div className="overflow-y-auto hide-scrollbar">
                                <div className="bg-[#FFF8E1] border border-[#FDEBD0] rounded-xl p-4 text-center mb-4">
                                    <p className="text-xs font-bold text-gray-500 mb-1">TOTAL TAGIHAN</p>
                                    <p className="text-3xl font-black text-[#10B981]">Rp 12.000</p>
                                </div>

                                {/* TABS METODE BAYAR */}
                                <div className="flex gap-2 mb-4">
                                    {['TUNAI', 'QRIS', 'Transfer'].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`flex-1 py-2.5 text-xs font-bold rounded-lg border-2 transition-colors flex justify-center items-center gap-1 ${paymentMethod === method ? 'bg-[#10B981] text-white border-[#10B981]' : 'bg-[#E8F8F5] text-[#10B981] border-transparent hover:border-[#10B981]/50'}`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>

                                {/* TAB KONTEN: TUNAI */}
                                {paymentMethod === 'TUNAI' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 block mb-1">Uang Diterima</label>
                                            <input type="text" placeholder="Rp" className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 font-bold focus:outline-none focus:border-[#10B981]" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button className="bg-[#E8F8F5] text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Rp 50.000</button>
                                            <button className="bg-[#E8F8F5] text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Rp 100.000</button>
                                            <button className="bg-[#E8F8F5] text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Uang Pas</button>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-orange-600 block mb-1">Kembalian / Sisa Bayar</label>
                                            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-red-500 font-bold text-sm">Rp ( Uang Kurang )</div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB KONTEN: QRIS */}
                                {paymentMethod === 'QRIS' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 block mb-1">Pilih QRIS Tujuan</label>
                                            <select className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 font-bold outline-none focus:border-[#10B981]"><option>YoriEgg Dana</option></select>
                                        </div>
                                        <div className="border border-gray-200 rounded-xl p-4 flex justify-center bg-gray-50">
                                            <div className="w-48 h-48 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 font-bold">
                                                [ GAMBAR QRIS ]
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 block mb-1">Upload Bukti Bayar <span className="text-gray-400 font-normal">(Opsional)</span></label>
                                            <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white">
                                                <button className="bg-gray-100 text-gray-700 text-xs font-bold px-4 py-3 border-r border-gray-300">Choose File</button>
                                                <div className="px-4 py-3 text-xs text-gray-500">No file chosen</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB KONTEN: TRANSFER */}
                                {paymentMethod === 'Transfer' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 block mb-1">Pilih Rekening Tujuan</label>
                                            <div className="border border-gray-300 rounded-lg p-3 flex items-center gap-3 bg-white">
                                                <input type="radio" checked readOnly className="w-4 h-4 text-[#10B981]" />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">BCA</p>
                                                    <p className="text-xs text-indigo-600 font-bold">8465581987 <span className="text-gray-400 font-normal">(Windy Kusuma)</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 block mb-1">Upload Bukti Bayar <span className="text-gray-400 font-normal">(Opsional)</span></label>
                                            <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white">
                                                <button className="bg-gray-100 text-gray-700 text-xs font-bold px-4 py-3 border-r border-gray-300">Choose File</button>
                                                <div className="px-4 py-3 text-xs text-gray-500">No file chosen</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="w-full bg-[#10B981] text-white rounded-xl py-3.5 mt-6 text-sm font-bold shadow-md hover:bg-emerald-600 active:scale-95 transition-transform"
                                    onClick={() => setActiveModal('sukses_bayar')}
                                >
                                    {paymentMethod === 'TUNAI' ? 'SELESAIKAN PESANAN' : 'UPLOAD DAN SELESAIKAN PESANAN'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 3. BOTTOM SHEET : S U K S E S   B A Y A R   ( K W I ) */}
                    {activeModal === 'sukses_bayar' && (
                        <div className="relative w-full max-w-md bg-[#10B981] rounded-t-3xl p-5 pb-28 shadow-2xl flex flex-col items-center animate-slideUp" style={{ maxHeight: '95vh' }}>
                            <div className="w-12 h-1.5 bg-emerald-300 rounded-full mx-auto mb-4 shrink-0"></div>
                            <button onClick={() => setActiveModal('none')} className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>

                            <h2 className="text-white text-xl font-bold mb-2 text-center">Pembayaran Berhasil!</h2>
                            <p className="text-emerald-100 text-xs text-center mb-6">Cetak / Kirim Struk di bawah ini<br />sebagai bukti transaksi</p>

                            <div className="bg-white w-full rounded-2xl p-6 shadow-2xl relative overflow-y-auto hide-scrollbar">
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-black text-[#3730A3]">Yori Egg</h1>
                                    <p className="text-[10px] text-gray-500 mt-1">Telp: 085124243869<br />Minggiran, Yogyakarta</p>
                                </div>

                                <div className="border-t border-dashed border-gray-300 py-3 flex justify-between items-start">
                                    <div><p className="text-[10px] text-gray-500">No. Nota</p><p className="text-xs font-bold text-[#3730A3]">KWI - 2026061214521271</p><p className="text-[9px] text-gray-400 mt-0.5">Ref: INV-2026061214521271</p></div>
                                    <div className="text-right"><p className="text-[10px] text-gray-500">Tanggal</p><p className="text-[10px] font-bold text-gray-800">12 Jun 2026, 14:52</p></div>
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div><p className="text-[10px] text-gray-500">Pelanggan</p><p className="text-xs font-bold text-gray-800">Lisa Untari</p></div>
                                    <div className="text-right"><p className="text-[10px] text-gray-500">Kasir</p><p className="text-[10px] font-bold text-gray-800">Admin</p></div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs font-bold text-gray-800">Telur AKAM Herbal</p>
                                    <div className="flex justify-between items-center mt-1"><span className="text-[10px] text-gray-500">50 x Rp 2.700</span><span className="text-xs font-bold text-gray-800">Rp 135.000</span></div>
                                </div>

                                <div className="border-t border-dashed border-gray-300 py-4 mb-2">
                                    <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-gray-800">Total Tagihan</span><span className="text-lg font-black text-[#10B981]">Rp 135.000</span></div>
                                    <div className="flex justify-between items-center"><span className="text-[10px] text-gray-500">Status Pembayaran</span><span className="text-xs font-black text-gray-800">{paymentMethod}</span></div>
                                </div>

                                <p className="text-[9px] italic text-center text-gray-400 mb-6">Selalu Sehat dan Berbahagia. Terima kasih sudah berbelanja.</p>

                                <div className="grid grid-cols-2 gap-2">
                                    <button className="bg-[#10B981] text-white rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> Print Nota</button>
                                    <button className="bg-lime-500 text-white rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> Kirim Nota</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. BOTTOM SHEET : S U K S E S   P I U T A N G   ( I N V ) */}
                    {activeModal === 'sukses_piutang' && (
                        <div className="relative w-full max-w-md bg-[#EA580C] rounded-t-3xl p-5 pb-28 shadow-2xl flex flex-col items-center animate-slideUp" style={{ maxHeight: '95vh' }}>
                            <div className="w-12 h-1.5 bg-orange-300 rounded-full mx-auto mb-4 shrink-0"></div>
                            <button onClick={() => setActiveModal('none')} className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>

                            <h2 className="text-white text-xl font-bold mb-2 text-center">Pesanan Telah Terkirim</h2>
                            <p className="text-orange-100 text-xs text-center mb-6">Cetak / Kirim Struk di bawah ini<br />sebagai bukti pengiriman</p>

                            <div className="bg-white w-full rounded-2xl p-6 shadow-2xl relative overflow-y-auto hide-scrollbar">
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-black text-[#3730A3]">Yori Egg</h1>
                                    <p className="text-[10px] text-gray-500 mt-1">Telp: 085124243869<br />Minggiran, Yogyakarta</p>
                                </div>

                                <div className="border-t border-dashed border-gray-300 py-3 flex justify-between items-start">
                                    <div><p className="text-[10px] text-gray-500">No. Nota</p><p className="text-xs font-bold text-[#EA580C]">INV - 12345676543</p><p className="text-[9px] text-gray-400 mt-0.5">Ref: ORD - 12345676543</p></div>
                                    <div className="text-right"><p className="text-[10px] text-gray-500">Tanggal</p><p className="text-[10px] font-bold text-gray-800">12 Jun 2026, 14:52</p></div>
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div><p className="text-[10px] text-gray-500">Pelanggan</p><p className="text-xs font-bold text-gray-800">Lisa Untari</p></div>
                                    <div className="text-right"><p className="text-[10px] text-gray-500">Kasir</p><p className="text-[10px] font-bold text-gray-800">Admin</p></div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs font-bold text-gray-800">Telur AKAM Herbal</p>
                                    <div className="flex justify-between items-center mt-1"><span className="text-[10px] text-gray-500">50 x Rp 2.700</span><span className="text-xs font-bold text-gray-800">Rp 135.000</span></div>
                                </div>

                                <div className="border-t border-dashed border-gray-300 py-4 mb-2">
                                    <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-gray-800">Total Tagihan</span><span className="text-lg font-black text-[#10B981]">Rp 135.000</span></div>
                                    <div className="flex justify-between items-center"><span className="text-[10px] text-gray-500">Status Pembayaran</span><span className="text-xs font-black text-[#EA580C]">PIUTANG</span></div>
                                </div>

                                <p className="text-[9px] italic text-center text-gray-400 mb-6">Selalu Sehat dan Berbahagia. Terima kasih sudah berbelanja.</p>

                                <div className="grid grid-cols-2 gap-2">
                                    <button className="bg-[#10B981] text-white rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> Print Invoice</button>
                                    <button className="bg-lime-500 text-white rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> Kirim Invoice</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}