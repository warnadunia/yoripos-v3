'use client';

import React, { useState } from 'react';

export default function PesananView() {
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedMonth, setSelectedMonth] = useState(3);
    const [expandedTrx, setExpandedTrx] = useState<number | null>(null);

    // Filter state: 'ALL', 'AMBIL_TOKO', 'DELIVERY'
    const [filterType, setFilterType] = useState('ALL');

    // Modal States
    const [activeModal, setActiveModal] = useState('none'); // 'none' | 'proses' | 'pembayaran' | 'sukses_bayar' | 'sukses_piutang'
    const [paymentMethod, setPaymentMethod] = useState('TUNAI'); // 'TUNAI' | 'QRIS' | 'Transfer'

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const chartData = [80, 45, 65, 90, 45, 65, 5, 2, 5, 2, 5, 2];

    // Dummy data pesanan
    const orders = [
        { id: 1, date: '12', month: '04', name: 'Agam Warmindo', ord: 'ORD - 123456789', amount: '534.234', status: 'DITERIMA', type: 'DELIVERY' },
        { id: 2, date: '12', month: '04', name: 'SS Telur', ord: 'ORD - 123456789', amount: '230.234', status: 'DITERIMA', type: 'AMBIL_TOKO' },
        { id: 3, date: '11', month: '04', name: 'Bakpia 3 Generasi', ord: 'ORD - 123456789', amount: '123.098', status: 'SIAP', type: 'DELIVERY' },
        { id: 4, date: '10', month: '04', name: 'Lisa Untari', ord: 'ORD - 123456789', amount: '34.098', status: 'SIAP', type: 'AMBIL_TOKO' },
        { id: 5, date: '08', month: '04', name: 'Modang', ord: 'ORD - 123456789', amount: '12.098', status: 'SIAP', type: 'DELIVERY' },
    ];

    const handleFilterClick = (type: string) => {
        setFilterType(prev => prev === type ? 'ALL' : type);
    };

    const filteredOrders = filterType === 'ALL' ? orders : orders.filter(o => o.type === filterType);

    return (
        <div className="w-full pb-28 relative">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* HEADER & CHART */}
            <div className="w-full bg-emerald-500 rounded-b-3xl pb-8">
                <div className="flex justify-between items-center p-4 text-white">
                    <button><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                    <h1 className="text-lg font-bold tracking-wide">Riwayat Pesanan</h1>
                    <button className="w-8 h-8 rounded-full border-2 border-white/50 font-bold flex items-center justify-center">!</button>
                </div>

                <div className="px-4 pb-4 pt-2 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Toko Tuan dan Nyonya</h2>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-white text-gray-800 text-xs font-bold py-1.5 px-3 rounded-lg outline-none cursor-pointer">
                        <option value="2026">2026</option><option value="2025">2025</option>
                    </select>
                </div>

                <div className="mx-4 bg-teal-50 bg-opacity-95 rounded-2xl p-4 shadow-sm mb-4">
                    <div className="flex items-end justify-between h-32 gap-1 pb-2 border-b border-emerald-200/50">
                        {chartData.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                                <div className={`w-full rounded-t-sm transition-colors ${selectedMonth === i ? 'bg-emerald-600' : 'bg-emerald-300'}`} style={{ height: `${h}%` }}></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        {months.map((m, i) => <span key={i} className="text-xs scale-75 origin-center -rotate-90 block mt-2 text-emerald-800 font-medium">{m}</span>)}
                    </div>
                </div>

                <div className="flex overflow-x-auto gap-2 px-4 pb-2 snap-x hide-scrollbar">
                    {months.map((m, i) => (
                        <div key={i} onClick={() => setSelectedMonth(i)} className={`snap-center shrink-0 w-24 p-2.5 rounded-xl cursor-pointer transition-colors ${selectedMonth === i ? 'bg-emerald-900 text-white' : 'bg-emerald-400 bg-opacity-40 text-emerald-900'}`}>
                            <span className="text-xs font-bold">{m.toUpperCase()}</span>
                            <p className="text-xs font-bold mt-2">12 Trx</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CARD FILTER */}
            <div className="mx-4 -mt-6 relative z-10">
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-700">Total Pesanan {months[selectedMonth]} {selectedYear}</span>
                        <span className="text-lg font-black text-slate-700">9 ORDER</span>
                    </div>

                    <div className="flex gap-2">
                        <div onClick={() => handleFilterClick('AMBIL_TOKO')} className={`flex-1 rounded-xl p-3 border cursor-pointer transition-all ${filterType === 'AMBIL_TOKO' ? 'bg-teal-100 border-teal-300 ring-2 ring-teal-500 ring-opacity-50' : 'bg-gradient-to-b from-teal-50 to-teal-100/50 border-teal-100/50 opacity-80 hover:opacity-100'}`}>
                            <div className="w-5 h-5 text-emerald-600 mb-1.5"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
                            <span className="text-xs font-bold text-slate-700 block mb-1">AMBIL TOKO</span>
                            <p className="text-sm font-black text-slate-900 leading-none">4 ORDER</p>
                            <span className="text-xs scale-75 origin-left text-slate-500 block mt-1">Total Rp 123.456</span>
                        </div>
                        <div onClick={() => handleFilterClick('DELIVERY')} className={`flex-1 rounded-xl p-3 border cursor-pointer transition-all ${filterType === 'DELIVERY' ? 'bg-amber-100 border-amber-300 ring-2 ring-amber-500 ring-opacity-50' : 'bg-gradient-to-b from-amber-50 to-amber-100/50 border-amber-100/50 opacity-80 hover:opacity-100'}`}>
                            <div className="w-5 h-5 text-amber-600 mb-1.5"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg></div>
                            <span className="text-xs font-bold text-slate-700 block mb-1">DELIVERY</span>
                            <p className="text-sm font-black text-slate-900 leading-none">5 ORDER</p>
                            <span className="text-xs scale-75 origin-left text-slate-500 block mt-1">Total Rp 234.567</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LISTING PESANAN */}
            <div className="mx-4 mt-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 mb-4">Data Pesanan bulan {months[selectedMonth]} {selectedYear}</h3>

                <div className="flex flex-col space-y-4">
                    {filteredOrders.map(trx => {
                        const isExpanded = expandedTrx === trx.id;
                        const isDiterima = trx.status === 'DITERIMA';

                        return (
                            <div key={trx.id} className={`border-b border-slate-100 pb-4 last:border-0 last:pb-0 transition-opacity ${isDiterima ? 'opacity-50' : 'opacity-100'}`}>
                                <div className="flex items-center justify-between cursor-pointer active:opacity-70" onClick={() => setExpandedTrx(isExpanded ? null : trx.id)}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500 text-white rounded-lg p-1.5 flex flex-col items-center justify-center min-w-[36px] shadow-sm">
                                            <span className="text-xs font-bold leading-none">{trx.date}</span>
                                            <span className="text-[10px] scale-90 leading-none mt-0.5">{trx.month}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{trx.name}</p>
                                            <p className="text-xs scale-75 origin-left text-emerald-500 font-mono mt-0.5">{trx.ord}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-xs font-mono text-slate-700 font-semibold"><span className="text-[10px] scale-90 text-slate-400 mr-1">Rp</span>{trx.amount}</p>
                                            <span className={`text-xs scale-75 origin-right font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block ${isDiterima ? 'bg-amber-100 text-amber-600' : 'bg-amber-400 text-white shadow-sm'}`}>
                                                {trx.status}
                                            </span>
                                        </div>
                                        <div className={`w-6 h-6 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180 bg-emerald-200' : ''}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200 pl-12 pr-1 animate-fadeIn">
                                        <div className="flex items-start gap-1.5 mb-3 text-emerald-500">
                                            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="text-xs scale-90 origin-left leading-tight font-medium">Alamat yang tercatat di database konsumen</span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p className="text-xs font-semibold text-slate-700">Rincian Menu</p>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-1.5"><span className="text-slate-400 text-[10px] mt-0.5">{'>'}</span><div><p className="text-[10px] text-slate-700 font-medium">Menu Paket A</p><p className="text-[9px] text-emerald-500">1 x Rp 5.000</p></div></div>
                                                <span className="text-[10px] font-mono text-slate-600">Rp 5.000</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button disabled={isDiterima} className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${isDiterima ? 'bg-gray-300 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                            </button>
                                            <button disabled={isDiterima} className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${isDiterima ? 'bg-gray-300 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </button>
                                            <button disabled={isDiterima} className={`flex-1 rounded-lg text-xs font-bold tracking-widest flex items-center justify-center gap-1 shadow-sm ${isDiterima ? 'bg-gray-300 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'}`} onClick={() => setActiveModal('proses')}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                PROSES PESANAN
                                            </button>
                                        </div>
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
            {activeModal !== 'none' && (
                <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 60 }}>
                    <div className="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal('none')}></div>

                    {/* 1. M O D A L : P R O S E S   P E S A N A N */}
                    {activeModal === 'proses' && (
                        <div className="relative w-full max-w-md bg-emerald-500 rounded-t-3xl p-5 pb-28 shadow-2xl animate-slideUp flex flex-col" style={{ maxHeight: '90vh' }}>
                            <div className="w-12 h-1.5 bg-emerald-300 rounded-full mx-auto mb-4 shrink-0"></div>

                            <div className="flex justify-between items-center mb-4 text-white shrink-0">
                                <h3 className="text-lg font-bold">Detail Pengiriman</h3>
                                <button onClick={() => setActiveModal('none')} className="p-1 rounded-full bg-emerald-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow-inner overflow-y-auto hide-scrollbar">
                                <p className="text-emerald-500 font-semibold text-xs mb-2 flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Senin, 22 Juni 2026</p>
                                <div className="flex items-start gap-2 mb-3">
                                    <svg className="w-5 h-5 text-emerald-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <div>
                                        <p className="text-lg font-bold text-slate-800">Modang (nama konsumen)</p>
                                        <span className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded">ORD-1234567</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 mb-4">
                                    <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-800">Lokasi Pengiriman / Alamat Konsumen</p>
                                        <span className="bg-lime-500 text-white text-xs px-2 py-0.5 rounded inline-block mt-1 cursor-pointer">Buka di Maps</span>
                                    </div>
                                </div>

                                <div className="border border-slate-200 rounded-xl p-4 mb-4">
                                    <p className="text-xs font-bold text-slate-800 mb-3">Rincian Menu</p>
                                    <div className="flex justify-between text-xs text-slate-600 mb-2"><span>1x Menu Paket A</span><span>Rp 5.000</span></div>
                                    <div className="flex justify-between text-xs text-slate-600 mb-4"><span>1x Menu Paket B</span><span>Rp 7.000</span></div>
                                    <div className="bg-emerald-100 rounded-lg p-3 flex justify-between items-center font-bold text-emerald-800">
                                        <span>Total Tagihan</span><span>Rp 12.000</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <button className="bg-lime-500 text-white rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> Kirim Nota WA</button>
                                    <button className="bg-gray-500 text-white rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> Print Nota</button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="bg-red-600 text-white rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-1 shadow-md" onClick={() => setActiveModal('sukses_piutang')}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> PIUTANG</button>
                                    <button className="bg-emerald-500 text-white rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-1 shadow-md" onClick={() => setActiveModal('pembayaran')}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> PEMBAYARAN</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. M O D A L : P E M B A Y A R A N */}
                    {activeModal === 'pembayaran' && (
                        <div className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-28 shadow-2xl animate-slideUp flex flex-col" style={{ maxHeight: '90vh' }}>
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0"></div>

                            <div className="flex justify-between items-center mb-4 text-slate-800 shrink-0">
                                <h3 className="text-lg font-bold">Metode Pembayaran</h3>
                                <button onClick={() => setActiveModal('proses')} className="p-1 rounded-full hover:bg-slate-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
                            </div>

                            <div className="overflow-y-auto hide-scrollbar">
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center mb-4">
                                    <p className="text-xs font-bold text-slate-500 mb-1">TOTAL TAGIHAN</p>
                                    <p className="text-3xl font-black text-emerald-700">Rp 12.000</p>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    {['TUNAI', 'QRIS', 'Transfer'].map((method) => (
                                        <button key={method} onClick={() => setPaymentMethod(method)} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors flex justify-center items-center gap-1 ${paymentMethod === method ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                            {method}
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod === 'TUNAI' && (
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Uang Diterima</label><input type="text" placeholder="Rp" className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 font-bold focus:outline-none focus:border-emerald-500" /></div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button className="bg-emerald-100 text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Rp 50.000</button>
                                            <button className="bg-emerald-100 text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Rp 100.000</button>
                                            <button className="bg-emerald-100 text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Uang Pas</button>
                                        </div>
                                        <div><label className="text-xs font-bold text-orange-600 block mb-1">Kembalian / Sisa Bayar</label><div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-red-500 font-bold text-sm">Rp ( Uang Kurang )</div></div>
                                    </div>
                                )}
                                {paymentMethod === 'QRIS' && (
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Pilih QRIS Tujuan</label><select className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 font-bold bg-white outline-none"><option>YoriEgg Dana</option></select></div>
                                        <div className="border border-slate-200 rounded-xl p-4 flex justify-center bg-slate-50"><div className="w-48 h-48 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 font-bold">[ GAMBAR QRIS ]</div></div>
                                    </div>
                                )}
                                {paymentMethod === 'Transfer' && (
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Pilih Rekening Tujuan</label><div className="border border-slate-300 rounded-lg p-3 flex items-center gap-3 bg-white"><input type="radio" checked readOnly className="w-4 h-4 text-emerald-600" /><div><p className="text-sm font-bold text-slate-800">BCA</p><p className="text-xs text-indigo-600 font-bold">8465581987</p></div></div></div>
                                    </div>
                                )}

                                <button className="w-full bg-emerald-500 text-white rounded-lg py-3 mt-6 text-sm font-bold shadow-md hover:bg-emerald-600" onClick={() => setActiveModal('sukses_bayar')}>
                                    SELESAIKAN PESANAN
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 3. M O D A L : S U K S E S   B A Y A R   ( K W I ) */}
                    {activeModal === 'sukses_bayar' && (
                        <div className="relative w-full max-w-md bg-emerald-700 rounded-t-3xl p-5 pb-28 shadow-2xl flex flex-col items-center animate-slideUp" style={{ maxHeight: '95vh' }}>
                            <div className="w-12 h-1.5 bg-emerald-500 rounded-full mx-auto mb-4 shrink-0"></div>
                            <button onClick={() => setActiveModal('none')} className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>

                            <h2 className="text-white text-xl font-bold mb-2 text-center">Pembayaran Berhasil!</h2>
                            <p className="text-emerald-200 text-xs text-center mb-6">Cetak / Kirim Struk di bawah ini</p>

                            <div className="bg-white w-full rounded-2xl p-6 shadow-2xl relative overflow-y-auto hide-scrollbar">
                                <div className="text-center mb-6"><h1 className="text-2xl font-black text-indigo-700">Yori Egg</h1><p className="text-[10px] text-slate-500 mt-1">Telp: 085124243869<br />Minggiran, Yogyakarta</p></div>
                                <div className="border-t border-dashed border-slate-300 py-3 flex justify-between items-start"><div><p className="text-[10px] text-slate-500">No. Nota</p><p className="text-xs font-bold text-indigo-700">KWI - 2026061214521271</p></div><div className="text-right"><p className="text-[10px] text-slate-500">Tanggal</p><p className="text-[10px] font-bold text-slate-800">12 Jun 2026, 14:52</p></div></div>
                                <div className="border-t border-dashed border-slate-300 py-4 mb-2"><div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-800">Total Tagihan</span><span className="text-lg font-black text-emerald-600">Rp 135.000</span></div><div className="flex justify-between items-center"><span className="text-[10px] text-slate-500">Status Pembayaran</span><span className="text-xs font-black text-slate-800">{paymentMethod}</span></div></div>
                                <div className="grid grid-cols-2 gap-2 mt-6">
                                    <button className="bg-emerald-500 text-white rounded-lg py-2.5 text-xs font-bold">Print Nota</button>
                                    <button className="bg-lime-500 text-white rounded-lg py-2.5 text-xs font-bold">Kirim Nota</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. M O D A L : S U K S E S   P I U T A N G   ( I N V ) */}
                    {activeModal === 'sukses_piutang' && (
                        <div className="relative w-full max-w-md bg-orange-600 rounded-t-3xl p-5 pb-28 shadow-2xl flex flex-col items-center animate-slideUp" style={{ maxHeight: '95vh' }}>
                            <div className="w-12 h-1.5 bg-orange-400 rounded-full mx-auto mb-4 shrink-0"></div>
                            <button onClick={() => setActiveModal('none')} className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>

                            <h2 className="text-white text-xl font-bold mb-2 text-center">Pesanan Telah Terkirim</h2>
                            <p className="text-orange-200 text-xs text-center mb-6">Cetak / Kirim Struk di bawah ini</p>

                            <div className="bg-white w-full rounded-2xl p-6 shadow-2xl relative overflow-y-auto hide-scrollbar">
                                <div className="text-center mb-6"><h1 className="text-2xl font-black text-indigo-700">Yori Egg</h1><p className="text-[10px] text-slate-500 mt-1">Telp: 085124243869<br />Minggiran, Yogyakarta</p></div>
                                <div className="border-t border-dashed border-slate-300 py-3 flex justify-between items-start"><div><p className="text-[10px] text-slate-500">No. Nota</p><p className="text-xs font-bold text-orange-600">INV - 12345676543</p></div><div className="text-right"><p className="text-[10px] text-slate-500">Tanggal</p><p className="text-[10px] font-bold text-slate-800">12 Jun 2026, 14:52</p></div></div>
                                <div className="border-t border-dashed border-slate-300 py-4 mb-2"><div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-800">Total Tagihan</span><span className="text-lg font-black text-emerald-600">Rp 135.000</span></div><div className="flex justify-between items-center"><span className="text-[10px] text-slate-500">Status Pembayaran</span><span className="text-xs font-black text-orange-600">PIUTANG</span></div></div>
                                <div className="grid grid-cols-2 gap-2 mt-6">
                                    <button className="bg-emerald-500 text-white rounded-lg py-2.5 text-xs font-bold">Print Invoice</button>
                                    <button className="bg-lime-500 text-white rounded-lg py-2.5 text-xs font-bold">Kirim Invoice</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}