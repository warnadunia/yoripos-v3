'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function RiwayatView() {
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedMonth, setSelectedMonth] = useState('APR');
    const [activePaymentFilter, setActivePaymentFilter] = useState<string | null>(null);
    const [expandedTrx, setExpandedTrx] = useState<number | null>(1); // Default buka 1 untuk demo
    const scrollRef = useRef<HTMLDivElement>(null);

    const monthlyData = [
        { month: 'JAN', chartVal: 80, total: '15.000.000', cash: '5.000.000', cashInv: 50, qris: '5.000.000', qrisInv: 50, tf: '5.000.000', tfInv: 50 },
        { month: 'FEB', chartVal: 45, total: '8.500.000', cash: '2.500.000', cashInv: 25, qris: '3.000.000', qrisInv: 30, tf: '3.000.000', tfInv: 30 },
        { month: 'MAR', chartVal: 65, total: '10.200.000', cash: '3.200.000', cashInv: 32, qris: '4.000.000', qrisInv: 40, tf: '3.000.000', tfInv: 30 },
        { month: 'APR', chartVal: 90, total: '12.345.678', cash: '3.345.678', cashInv: 123, qris: '3.345.678', qrisInv: 123, tf: '3.345.678', tfInv: 123 },
        { month: 'MEI', chartVal: 50, total: '9.000.000', cash: '3.000.000', cashInv: 30, qris: '3.000.000', qrisInv: 30, tf: '3.000.000', tfInv: 30 },
        { month: 'JUN', chartVal: 70, total: '11.500.000', cash: '4.500.000', cashInv: 45, qris: '3.500.000', qrisInv: 35, tf: '3.500.000', tfInv: 35 },
        { month: 'JUL', chartVal: 5, total: '1.000.000', cash: '300.000', cashInv: 3, qris: '400.000', qrisInv: 4, tf: '300.000', tfInv: 3 },
        { month: 'AGS', chartVal: 2, total: '500.000', cash: '200.000', cashInv: 2, qris: '200.000', qrisInv: 2, tf: '100.000', tfInv: 1 },
        { month: 'SEP', chartVal: 5, total: '1.200.000', cash: '400.000', cashInv: 4, qris: '400.000', qrisInv: 4, tf: '400.000', tfInv: 4 },
        { month: 'OKT', chartVal: 2, total: '800.000', cash: '300.000', cashInv: 3, qris: '300.000', qrisInv: 3, tf: '200.000', tfInv: 2 },
        { month: 'NOV', chartVal: 5, total: '1.500.000', cash: '500.000', cashInv: 5, qris: '500.000', qrisInv: 5, tf: '500.000', tfInv: 5 },
        { month: 'DES', chartVal: 2, total: '900.000', cash: '300.000', cashInv: 3, qris: '300.000', qrisInv: 3, tf: '300.000', tfInv: 3 },
    ];

    const allTransactions = [
        { id: 1, date: '12', month: '04', monthName: 'APR', name: 'Agam Warmindo', inv: 'INV - 123456789', amount: '534.234', method: 'CASH' },
        { id: 2, date: '12', month: '04', monthName: 'APR', name: 'SS Telur', inv: 'INV - 123456789', amount: '230.234', method: 'QRIS' },
        { id: 3, date: '11', month: '04', monthName: 'APR', name: 'Bakpia 3 Generasi', inv: 'INV - 123456789', amount: '123.098', method: 'QRIS' },
        { id: 4, date: '10', month: '04', monthName: 'APR', name: 'Lisa Untari', inv: 'INV - 123456789', amount: '34.098', method: 'TRANSFER' },
        { id: 5, date: '08', month: '04', monthName: 'APR', name: 'Modang', inv: 'INV - 123456789', amount: '12.098', method: 'TRANSFER' },
        { id: 6, date: '15', month: '03', monthName: 'MAR', name: 'Toko Sejahtera', inv: 'INV - 987654321', amount: '450.000', method: 'CASH' },
    ];

    const activeData = monthlyData.find(d => d.month === selectedMonth) || monthlyData[3];

    const filteredTransactions = allTransactions.filter(trx => {
        const matchMonth = trx.monthName === selectedMonth;
        const matchMethod = activePaymentFilter ? trx.method === activePaymentFilter : true;
        return matchMonth && matchMethod;
    });

    const togglePaymentFilter = (method: string) => {
        setActivePaymentFilter(prev => prev === method ? null : method);
    };

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollLeft = 140;
    }, []);

    const monthFullNames: { [key: string]: string } = {
        'JAN': 'Januari', 'FEB': 'Februari', 'MAR': 'Maret', 'APR': 'April',
        'MEI': 'Mei', 'JUN': 'Juni', 'JUL': 'Juli', 'AGS': 'Agustus',
        'SEP': 'September', 'OKT': 'Oktober', 'NOV': 'November', 'DES': 'Desember'
    };

    return (
        <div className="w-full min-h-screen bg-[#E8F8F5] pb-24 relative font-sans text-gray-800">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* ========================================= */}
            {/* 1. WRAPPER HIJAU (Header & Chart)         */}
            {/* ========================================= */}
            <div className="bg-white rounded-b-[2rem] shadow-sm pb-6">

                {/* 1. BLOK HIJAU BESAR (HEADER) */}
                <div className="w-full bg-[#10B981] rounded-b-[2rem] pb-6 pt-2">
                    {/* NAVBAR ATAS */}
                    <div className="flex justify-between items-center px-5 py-3 text-white">
                        <button className="hover:opacity-80">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h1 className="text-base font-bold tracking-wide">Dashboard</h1>
                        <div className="w-7"></div> {/* Spacer */}
                    </div>

                    {/* INFO TOKO & TAHUN */}
                    <div className="px-5 pb-2 pt-2 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold">Toko Tuan dan Nyonya</h2>
                        </div>
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
                    {/* KARTU PUTIH: CHART BAR INTERAKTIF (DI DALAM HIJAU) */}
                    <div className="mx-4 mt-5 bg-white rounded-2xl p-4 px-3 shadow-sm">
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
                        {/* Label Bulan Bawah Chart */}
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
                {/* 2. WRAPPER PUTIH 1 (SLIDER & 3 KARTU)     */}
                {/* ========================================= */}
                <div className="bg-white rounded-3xl p-4 border-gray-200">

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
                                        <span className={`text-[10px] font-medium ${isSelected ? 'text-amber-900' : 'text-[#10B981]'}`}>12 Trx</span>
                                    </div>
                                    <p className={`text-xs font-bold ${isSelected ? 'text-amber-900' : 'text-[#10B981]'}`}>
                                        <span className="text-[10px] mr-1">Rp</span>{d.total}
                                    </p>
                                </div>
                            )
                        })}
                    </div>

                    {/* INFO TOTAL OMZET */}
                    <div className="flex justify-between items-center mt-6 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-sm font-bold">Total Omzet {monthFullNames[selectedMonth]} {selectedYear}</span>
                        </div>
                        <div className="flex items-baseline gap-1 text-gray-800">
                            <span className="text-sm font-bold">Rp</span>
                            <span className="text-xl font-bold">{activeData.total}</span>
                        </div>
                    </div>

                    {/* 3 KARTU METODE BAYAR */}
                    <div className="flex gap-2">
                        {/* KARTU TUNAI */}
                        <div
                            onClick={() => togglePaymentFilter('CASH')}
                            className={`flex-1 bg-[#E8F8F5] rounded-xl p-3 cursor-pointer transition-all duration-200 border ${activePaymentFilter === 'CASH' ? 'border-[#10B981] shadow-sm bg-[#D1F2EB]' : 'border-[#10B981]/20 hover:border-[#10B981]/50'}`}
                        >
                            <div className="w-6 h-6 text-[#10B981] mb-2"><svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
                            <span className="text-[11px] font-medium text-gray-800 block mb-1">TUNAI</span>
                            <p className="text-[10px] text-gray-500 mb-0.5">Rp</p>
                            <p className="text-sm font-bold text-gray-900 leading-none">{activeData.cash}</p>
                            <span className="text-[10px] text-gray-600 block mt-2">{activeData.cashInv} Invoices</span>
                        </div>

                        {/* KARTU QRIS */}
                        <div
                            onClick={() => togglePaymentFilter('QRIS')}
                            className={`flex-1 bg-[#E8F8F5] rounded-xl p-3 cursor-pointer transition-all duration-200 border ${activePaymentFilter === 'QRIS' ? 'border-[#10B981] shadow-sm bg-[#D1F2EB]' : 'border-[#10B981]/20 hover:border-[#10B981]/50'}`}
                        >
                            <div className="w-6 h-6 text-[#10B981] mb-2"><svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg></div>
                            <span className="text-[11px] font-medium text-gray-800 block mb-1">QRIS</span>
                            <p className="text-[10px] text-gray-500 mb-0.5">Rp</p>
                            <p className="text-sm font-bold text-gray-900 leading-none">{activeData.qris}</p>
                            <span className="text-[10px] text-gray-600 block mt-2">{activeData.qrisInv} Invoices</span>
                        </div>

                        {/* KARTU TRANSFER */}
                        <div
                            onClick={() => togglePaymentFilter('TRANSFER')}
                            className={`flex-1 bg-[#E8F8F5] rounded-xl p-3 cursor-pointer transition-all duration-200 border ${activePaymentFilter === 'TRANSFER' ? 'border-[#10B981] shadow-sm bg-[#D1F2EB]' : 'border-[#10B981]/20 hover:border-[#10B981]/50'}`}
                        >
                            <div className="w-6 h-6 text-[#10B981] mb-2"><svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg></div>
                            <span className="text-[11px] font-medium text-gray-800 block mb-1">TRANSFER</span>
                            <p className="text-[10px] text-gray-500 mb-0.5">Rp</p>
                            <p className="text-sm font-bold text-gray-900 leading-none">{activeData.tf}</p>
                            <span className="text-[10px] text-gray-600 block mt-2">{activeData.tfInv} Invoices</span>
                        </div>
                    </div>
                </div>
            </div>



            {/* ========================================= */}
            {/* 3. WRAPPER PUTIH 2 (LISTING TRANSAKSI)    */}
            {/* ========================================= */}
            <div className="mx-4 mt-5 bg-white rounded-3xl p-5 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-bold text-gray-800">Data Riwayat Transaksi bulan {monthFullNames[selectedMonth]} {selectedYear}</h3>
                    {activePaymentFilter && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">Filter: {activePaymentFilter}</span>
                    )}
                </div>

                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm font-medium">
                        Tidak ada transaksi {activePaymentFilter ? activePaymentFilter : ''} di bulan ini.
                    </div>
                ) : (
                    <div className="flex flex-col space-y-4">
                        {filteredTransactions.map(trx => {
                            const isExpanded = expandedTrx === trx.id;

                            return (
                                <div key={trx.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">

                                    {/* Header Transaksi */}
                                    <div
                                        className="flex items-center justify-between cursor-pointer active:opacity-70"
                                        onClick={() => setExpandedTrx(isExpanded ? null : trx.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#10B981] text-white rounded-lg p-1.5 flex flex-col items-center justify-center min-w-[36px] shadow-sm">
                                                <span className="text-sm font-bold leading-none">{trx.date}</span>
                                                <span className="text-[10px] font-bold leading-none mt-1">{trx.month}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{trx.name}</p>
                                                <p className="text-xs text-[#10B981] mt-0.5">{trx.inv}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right flex flex-col items-end">
                                                <p className="text-sm font-bold text-gray-800"><span className="text-[10px] text-gray-400 mr-1">Rp</span>{trx.amount}</p>
                                                <span className="text-[9px] font-bold bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded mt-1 inline-block">
                                                    {trx.method}
                                                </span>
                                            </div>
                                            <div className={`w-7 h-7 bg-[#E8F8F5] text-[#10B981] rounded-lg flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'rotate-180 bg-emerald-200' : ''}`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Detail View */}
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
                                                <button className="w-10 h-10 rounded-lg bg-[#10B981] text-white flex items-center justify-center shadow-sm hover:bg-emerald-600 active:scale-95 transition-transform">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                </button>
                                                <button className="w-10 h-10 rounded-lg bg-[#F59E0B] text-white flex items-center justify-center shadow-sm hover:bg-amber-600 active:scale-95 transition-transform">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </button>
                                                <button className="w-10 h-10 rounded-lg bg-gray-500 text-white flex items-center justify-center shadow-sm hover:bg-gray-600 active:scale-95 transition-transform">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                </button>
                                                <button className="flex-1 rounded-lg bg-[#10B981] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-600 active:scale-95 transition-transform">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    LUNAS
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

        </div>
    );
}