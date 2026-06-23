'use client';

import React, { useState, useEffect } from 'react';

export default function PiutangView({ onOpenKitchen }: { onOpenKitchen?: () => void }) {
    const [selectedYear, setSelectedYear] = useState('2026');

    // Otomatis deteksi bulan berjalan (0 = Jan, 11 = Des)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const [expandedInv, setExpandedInv] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Modal States
    const [activeModal, setActiveModal] = useState('none');
    const [paymentMethod, setPaymentMethod] = useState('TUNAI');

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    // Auto Center Scroll Logic
    useEffect(() => {
        // Dikasih timeout kecil biar nunggu DOM selesai render dulu sebelum scroll
        const timeout = setTimeout(() => {
            const activeCard = document.getElementById(`piutang-month-${selectedMonth}`);
            if (activeCard) {
                activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }, 100);
        return () => clearTimeout(timeout);
    }, [selectedMonth]);

    const chartRatio = [
        { real: 80, sisa: 20 }, { real: 60, sisa: 40 }, { real: 90, sisa: 10 },
        { real: 40, sisa: 60 }, { real: 70, sisa: 30 }, { real: 50, sisa: 50 },
        { real: 10, sisa: 90 }, { real: 0, sisa: 0 }, { real: 0, sisa: 0 },
        { real: 0, sisa: 0 }, { real: 0, sisa: 0 }, { real: 0, sisa: 0 },
    ];

    const invoices = [
        { id: 1, date: '12', month: '06', name: 'Agam Warmindo', inv: 'INV - 123456789', amount: '534.234', status: 'BELUM LUNAS', badge: 'bg-amber-100 text-amber-600', type: 'SISA' },
        { id: 2, date: '10', month: '06', name: 'SS Telur', inv: 'INV - 123456789', amount: '230.234', status: 'JATUH TEMPO', badge: 'bg-red-100 text-red-600', type: 'SISA' },
        { id: 3, date: '08', month: '06', name: 'Bakpia 3 Generasi', inv: 'INV - 123456789', amount: '123.098', status: 'BELUM LUNAS', badge: 'bg-amber-100 text-amber-600', type: 'SISA' },
        { id: 4, date: '05', month: '06', name: 'Lisa Untari', inv: 'INV - 123456789', amount: '34.098', status: 'LUNAS', badge: 'bg-emerald-100 text-emerald-600', type: 'LUNAS' },
        { id: 5, date: '01', month: '06', name: 'Modang', inv: 'INV - 123456789', amount: '12.098', status: 'LUNAS', badge: 'bg-emerald-100 text-emerald-600', type: 'LUNAS' },
    ];

    const filteredInvoices = invoices.filter(inv => activeFilter ? inv.type === activeFilter : true);

    return (
        <div className="w-full pb-28 relative bg-slate-50 min-h-screen">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* HEADER & CHART RASIO */}
            <div className="w-full bg-emerald-500 rounded-b-3xl pb-8 shadow-sm">

                {/* NAVBAR DENGAN KITCHEN NOTIF */}
                <div className="flex justify-between items-center p-4 text-white">
                    <button className="hover:opacity-80 transition-opacity"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                    <h1 className="text-lg font-bold tracking-wide">Monitoring Piutang</h1>
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
                        <span className="text-xs font-bold text-emerald-800">Rasio Penagihan</span>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold"><span className="w-2 h-2 rounded-sm bg-emerald-500"></span>Realisasi</span>
                            <span className="flex items-center gap-1 text-[9px] text-amber-600 font-bold"><span className="w-2 h-2 rounded-sm bg-amber-400"></span>Sisa</span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between h-28 gap-1 pb-2 border-b border-emerald-200/50 transform-gpu">
                        {chartRatio.map((data, i) => {
                            const isActive = selectedMonth === i;
                            return (
                                <div key={i} className={`flex-1 flex flex-col justify-end h-full w-full gap-0.5 opacity-90 transition-transform ${isActive ? 'opacity-100 scale-105' : ''}`}>
                                    <div className={`w-full rounded-t-sm transition-all duration-300 ${isActive ? 'bg-amber-400' : 'bg-amber-200'}`} style={{ height: `${data.sisa}%` }}></div>
                                    <div className={`w-full rounded-b-sm transition-all duration-300 ${isActive ? 'bg-emerald-600' : 'bg-emerald-300'}`} style={{ height: `${data.real}%` }}></div>
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
                            id={`piutang-month-${i}`} // ID untuk target scroll
                            onClick={() => setSelectedMonth(i)}
                            className={`snap-center shrink-0 w-24 p-2.5 rounded-xl cursor-pointer transition-colors transform-gpu duration-300 ${selectedMonth === i ? 'bg-emerald-900 text-white shadow-inner scale-[1.02]' : 'bg-emerald-400 bg-opacity-40 text-emerald-900 hover:bg-opacity-60'}`}
                        >
                            <span className="text-xs font-bold">{m.toUpperCase()}</span>
                            <p className="text-xs font-bold mt-2">12 INV</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CARD SUMMARY PIUTANG (SEKALIGUS FILTER) */}
            <div className="mx-4 -mt-6 relative z-10">
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">Total Piutang {months[selectedMonth]}</span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">23 INVOICE</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 mb-4">Rp 15.000.000</p>

                    <p className="text-[9px] text-slate-400 italic mb-2">*Klik kartu untuk filter data, Double-Klik untuk reset filter.</p>

                    <div className="flex gap-2">
                        {/* KARTU LUNAS / REALISASI */}
                        <div
                            onClick={() => setActiveFilter('LUNAS')}
                            onDoubleClick={() => setActiveFilter(null)}
                            className={`flex-1 bg-emerald-50 rounded-xl p-3 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activeFilter === 'LUNAS' ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-md scale-[1.02]' : 'border-emerald-100 hover:border-emerald-300'}`}
                        >
                            <span className="text-[10px] font-bold text-emerald-700 block mb-1 uppercase">Realisasi</span>
                            <p className="text-xs text-emerald-600 mb-0.5">Rp</p>
                            <p className="text-sm font-black text-emerald-800 leading-none">12.345.678</p>
                            <div className="mt-2 w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-600 h-full" style={{ width: '80%' }}></div></div>
                        </div>

                        {/* KARTU BELUM LUNAS / SISA */}
                        <div
                            onClick={() => setActiveFilter('SISA')}
                            onDoubleClick={() => setActiveFilter(null)}
                            className={`flex-1 bg-amber-50 rounded-xl p-3 border cursor-pointer transition-all duration-200 transform-gpu backface-hidden select-none ${activeFilter === 'SISA' ? 'border-amber-500 ring-2 ring-amber-200 shadow-md scale-[1.02]' : 'border-amber-100 hover:border-amber-300'}`}
                        >
                            <span className="text-[10px] font-bold text-amber-700 block mb-1 uppercase">Sisa Piutang</span>
                            <p className="text-xs text-amber-600 mb-0.5">Rp</p>
                            <p className="text-sm font-black text-amber-800 leading-none">2.654.322</p>
                            <div className="mt-2 w-full bg-amber-200 h-1.5 rounded-full overflow-hidden"><div className="bg-amber-500 h-full" style={{ width: '20%' }}></div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LISTING PIUTANG */}
            <div className="mx-4 mt-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-800">Data Piutang Konsumen bulan {months[selectedMonth]}</h3>
                    {activeFilter && <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${activeFilter === 'LUNAS' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>Filter: {activeFilter}</span>}
                </div>

                <div className="flex flex-col space-y-4">
                    {filteredInvoices.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm font-medium">Tidak ada data piutang untuk filter ini.</div>
                    ) : filteredInvoices.map(inv => {
                        const isExpanded = expandedInv === inv.id;
                        const isLunas = inv.status === 'LUNAS';

                        return (
                            <div key={inv.id} className={`border-b border-slate-100 pb-4 last:border-0 last:pb-0 transition-opacity duration-300 ${isLunas ? 'opacity-60' : 'opacity-100'}`}>
                                <div className="flex items-center justify-between cursor-pointer active:opacity-70" onClick={() => setExpandedInv(isExpanded ? null : inv.id)}>
                                    <div className="flex items-center gap-3">
                                        <div className={`${isLunas ? 'bg-emerald-500' : 'bg-amber-500'} text-white rounded-lg p-1.5 flex flex-col items-center justify-center min-w-[36px] shadow-sm`}>
                                            <span className="text-xs font-bold leading-none">{inv.date}</span>
                                            <span className="text-[10px] scale-90 leading-none mt-0.5">{inv.month}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{inv.name}</p>
                                            <p className="text-xs scale-75 origin-left text-slate-500 font-mono mt-0.5">{inv.inv}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-xs font-mono text-slate-700 font-semibold"><span className="text-[10px] scale-90 text-slate-400 mr-1">Rp</span>{inv.amount}</p>
                                            <span className={`text-xs scale-75 origin-right font-bold px-2 py-0.5 rounded mt-1 inline-block ${inv.badge}`}>
                                                {inv.status}
                                            </span>
                                        </div>
                                        <div className={`w-6 h-6 bg-slate-100 text-slate-600 rounded flex items-center justify-center transition-transform duration-300 transform-gpu backface-hidden ${isExpanded ? 'rotate-180 bg-slate-200' : ''}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200 pl-12 pr-1 animate-slideUp">
                                        <div className="flex items-start gap-1.5 mb-3 text-emerald-600">
                                            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="text-xs scale-90 origin-left leading-tight font-medium text-slate-600">Alamat lengkap pengiriman / tagihan konsumen</span>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <button className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-transform transform-gpu">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                            </button>
                                            <button
                                                disabled={isLunas}
                                                onClick={() => setActiveModal('pembayaran')}
                                                className={`flex-1 rounded-lg text-xs font-bold tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all transform-gpu ${isLunas ? 'bg-slate-200 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                                {isLunas ? 'SUDAH LUNAS' : 'BAYAR INVOICE'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* OVERLAYS / BOTTOM SHEETS SECTION */}
            {activeModal !== 'none' && (
                <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 60 }}>
                    <div className="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal('none')}></div>

                    {activeModal === 'pembayaran' && (
                        <div className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-28 shadow-2xl animate-slideUp flex flex-col transform-gpu backface-hidden will-change-transform" style={{ maxHeight: '90vh' }}>
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0"></div>

                            <div className="flex justify-between items-center mb-4 text-slate-800 shrink-0">
                                <h3 className="text-lg font-bold">Bayar Tagihan Piutang</h3>
                                <button onClick={() => setActiveModal('none')} className="p-1 rounded-full hover:bg-slate-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>

                            <div className="overflow-y-auto hide-scrollbar">
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center mb-4">
                                    <p className="text-xs font-bold text-slate-500 mb-1">TOTAL TAGIHAN INVOICE</p>
                                    <p className="text-3xl font-black text-emerald-700">Rp 534.234</p>
                                    <p className="text-[10px] font-mono text-slate-400 mt-1">INV - 123456789</p>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    {['TUNAI', 'QRIS', 'Transfer'].map((method) => (
                                        <button key={method} onClick={() => setPaymentMethod(method)} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors flex justify-center items-center gap-1 ${paymentMethod === method ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300'}`}>
                                            {method}
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod === 'TUNAI' && (
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Uang Diterima</label><input type="text" placeholder="Rp" className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 font-bold focus:outline-none focus:border-emerald-500" /></div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button className="bg-emerald-50 text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Rp 550.000</button>
                                            <button className="bg-emerald-50 text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Rp 600.000</button>
                                            <button className="bg-emerald-50 text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Uang Pas</button>
                                        </div>
                                    </div>
                                )}
                                {paymentMethod === 'QRIS' && (
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Pilih QRIS Tujuan</label><select className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 font-bold bg-white outline-none"><option>YoriEgg Dana</option></select></div>
                                    </div>
                                )}
                                {paymentMethod === 'Transfer' && (
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Pilih Rekening Tujuan</label><div className="border border-slate-300 rounded-lg p-3 flex items-center gap-3 bg-white"><input type="radio" checked readOnly className="w-4 h-4 text-emerald-600" /><div><p className="text-sm font-bold text-slate-800">BCA</p><p className="text-xs text-indigo-600 font-bold">8465581987 <span className="text-slate-400 font-normal">(Windy Kusuma)</span></p></div></div></div>
                                    </div>
                                )}

                                <button className="w-full bg-emerald-500 text-white rounded-lg py-3 mt-6 text-sm font-bold shadow-md hover:bg-emerald-600 transform-gpu active:scale-95 transition-transform" onClick={() => setActiveModal('sukses_bayar')}>
                                    SELESAIKAN PEMBAYARAN
                                </button>
                            </div>
                        </div>
                    )}

                    {activeModal === 'sukses_bayar' && (
                        <div className="relative w-full max-w-md bg-emerald-600 rounded-t-3xl p-5 pb-28 shadow-2xl flex flex-col items-center animate-slideUp transform-gpu backface-hidden will-change-transform" style={{ maxHeight: '95vh' }}>
                            <div className="w-12 h-1.5 bg-emerald-400 rounded-full mx-auto mb-4 shrink-0"></div>
                            <button onClick={() => setActiveModal('none')} className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>

                            <h2 className="text-white text-xl font-bold mb-2 text-center">Piutang Berhasil Dilunasi!</h2>
                            <p className="text-emerald-100 text-xs text-center mb-6">Cetak / Kirim Struk di bawah ini</p>

                            <div className="bg-white w-full rounded-2xl p-6 shadow-2xl relative overflow-y-auto hide-scrollbar">
                                <div className="text-center mb-6"><h1 className="text-2xl font-black text-indigo-700">Yori Egg</h1></div>
                                <div className="border-t border-dashed border-slate-300 py-3 flex justify-between items-start"><div><p className="text-[10px] text-slate-500">No. Kwitansi</p><p className="text-xs font-bold text-indigo-700">KWI - 202606121452</p></div></div>
                                <div className="mb-4 bg-emerald-50 rounded-lg p-3 border border-emerald-100"><p className="text-[10px] font-bold text-emerald-700 uppercase">Pelunasan Tagihan Piutang</p></div>
                                <div className="border-t border-dashed border-slate-300 py-4 mb-2"><div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-800">Total Dibayar</span><span className="text-lg font-black text-emerald-600">Rp 534.234</span></div></div>
                                <div className="grid grid-cols-2 gap-2 mt-6">
                                    <button className="bg-emerald-500 text-white rounded-lg py-2.5 text-xs font-bold shadow-sm transform-gpu active:scale-95 transition-transform">Print Struk</button>
                                    <button className="bg-emerald-700 text-white rounded-lg py-2.5 text-xs font-bold shadow-sm transform-gpu active:scale-95 transition-transform">Kirim Struk</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}