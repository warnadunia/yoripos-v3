'use client';

import React, { useState } from 'react';

export default function PiutangView() {
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedMonth, setSelectedMonth] = useState(5); // Index 5 = Juni
    const [expandedInv, setExpandedInv] = useState<number | null>(null);

    // Modal States
    const [activeModal, setActiveModal] = useState('none'); // 'none' | 'pembayaran' | 'sukses_bayar'
    const [paymentMethod, setPaymentMethod] = useState('TUNAI'); // 'TUNAI' | 'QRIS' | 'Transfer'

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    const chartRatio = [
        { real: 80, sisa: 20 }, { real: 60, sisa: 40 }, { real: 90, sisa: 10 },
        { real: 40, sisa: 60 }, { real: 70, sisa: 30 }, { real: 50, sisa: 50 },
        { real: 10, sisa: 90 }, { real: 0, sisa: 0 }, { real: 0, sisa: 0 },
        { real: 0, sisa: 0 }, { real: 0, sisa: 0 }, { real: 0, sisa: 0 },
    ];

    const invoices = [
        { id: 1, date: '12', month: '06', name: 'Agam Warmindo', inv: 'INV - 123456789', amount: '534.234', status: 'BELUM LUNAS', badge: 'bg-amber-100 text-amber-600' },
        { id: 2, date: '10', month: '06', name: 'SS Telur', inv: 'INV - 123456789', amount: '230.234', status: 'JATUH TEMPO', badge: 'bg-red-100 text-red-600' },
        { id: 3, date: '08', month: '06', name: 'Bakpia 3 Generasi', inv: 'INV - 123456789', amount: '123.098', status: 'BELUM LUNAS', badge: 'bg-amber-100 text-amber-600' },
        { id: 4, date: '05', month: '06', name: 'Lisa Untari', inv: 'INV - 123456789', amount: '34.098', status: 'LUNAS', badge: 'bg-emerald-100 text-emerald-600' },
        { id: 5, date: '01', month: '06', name: 'Modang', inv: 'INV - 123456789', amount: '12.098', status: 'LUNAS', badge: 'bg-emerald-100 text-emerald-600' },
    ];

    return (
        <div className="w-full pb-28 relative">
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />

            {/* HEADER & CHART RASIO */}
            <div className="w-full bg-emerald-500 rounded-b-3xl pb-8">
                <div className="flex justify-between items-center p-4 text-white">
                    <button><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                    <h1 className="text-lg font-bold tracking-wide">Piutang Konsumen</h1>
                    <button className="w-8 h-8 rounded-full border-2 border-white/50 font-bold flex items-center justify-center">!</button>
                </div>

                <div className="px-4 pb-4 pt-2 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Toko Tuan dan Nyonya</h2>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-white text-gray-800 text-xs font-bold py-1.5 px-3 rounded-lg outline-none cursor-pointer">
                        <option value="2026">2026</option><option value="2025">2025</option>
                    </select>
                </div>

                <div className="mx-4 bg-teal-50 bg-opacity-95 rounded-2xl p-4 shadow-sm mb-4">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-emerald-800">Rasio Penagihan</span>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold"><span className="w-2 h-2 rounded-sm bg-emerald-500"></span>Realisasi</span>
                            <span className="flex items-center gap-1 text-[9px] text-amber-600 font-bold"><span className="w-2 h-2 rounded-sm bg-amber-400"></span>Sisa</span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between h-28 gap-1 pb-2 border-b border-emerald-200/50">
                        {chartRatio.map((data, i) => {
                            const isActive = selectedMonth === i;
                            return (
                                <div key={i} className={`flex-1 flex flex-col justify-end h-full w-full gap-0.5 opacity-90 ${isActive ? 'opacity-100 scale-105' : ''}`}>
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

                <div className="flex overflow-x-auto gap-2 px-4 pb-2 snap-x hide-scrollbar">
                    {months.map((m, i) => (
                        <div key={i} onClick={() => setSelectedMonth(i)} className={`snap-center shrink-0 w-24 p-2.5 rounded-xl cursor-pointer transition-colors ${selectedMonth === i ? 'bg-emerald-900 text-white' : 'bg-emerald-400 bg-opacity-40 text-emerald-900'}`}>
                            <span className="text-xs font-bold">{m.toUpperCase()}</span>
                            <p className="text-xs font-bold mt-2">12 INV</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CARD SUMMARY PIUTANG */}
            <div className="mx-4 -mt-6 relative z-10">
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">Total Piutang {months[selectedMonth]}</span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">23 INVOICE</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800 mb-4">Rp 15.000.000</p>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                            <span className="text-[10px] font-bold text-emerald-700 block mb-1 uppercase">Realisasi</span>
                            <p className="text-xs text-emerald-600 mb-0.5">Rp</p>
                            <p className="text-sm font-black text-emerald-800 leading-none">12.345.678</p>
                            <div className="mt-2 w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-600 h-full" style={{ width: '80%' }}></div></div>
                        </div>
                        <div className="flex-1 bg-amber-50 rounded-xl p-3 border border-amber-100">
                            <span className="text-[10px] font-bold text-amber-700 block mb-1 uppercase">Sisa Piutang</span>
                            <p className="text-xs text-amber-600 mb-0.5">Rp</p>
                            <p className="text-sm font-black text-amber-800 leading-none">2.654.322</p>
                            <div className="mt-2 w-full bg-amber-200 h-1.5 rounded-full overflow-hidden"><div className="bg-amber-500 h-full" style={{ width: '20%' }}></div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LISTING PIUTANG */}
            <div className="mx-4 mt-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 mb-4">Data Piutang Konsumen bulan {months[selectedMonth]}</h3>
                <div className="flex flex-col space-y-4">
                    {invoices.map(inv => {
                        const isExpanded = expandedInv === inv.id;
                        const isLunas = inv.status === 'LUNAS';

                        return (
                            <div key={inv.id} className={`border-b border-slate-100 pb-4 last:border-0 last:pb-0 transition-opacity ${isLunas ? 'opacity-60' : 'opacity-100'}`}>
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
                                        <div className={`w-6 h-6 bg-slate-100 text-slate-600 rounded flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180 bg-slate-200' : ''}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200 pl-12 pr-1 animate-fadeIn">
                                        <div className="flex items-start gap-1.5 mb-3 text-emerald-600">
                                            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            <span className="text-xs scale-90 origin-left leading-tight font-medium text-slate-600">Alamat lengkap pengiriman / tagihan konsumen</span>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <button className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm bg-lime-500 text-white hover:bg-lime-600">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                            </button>
                                            <button className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm bg-gray-500 text-white hover:bg-gray-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                            </button>
                                            <button
                                                disabled={isLunas}
                                                onClick={() => setActiveModal('pembayaran')}
                                                className={`flex-1 rounded-lg text-xs font-bold tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all ${isLunas ? 'bg-slate-200 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'}`}
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

            {/* ========================================================================= */}
            {/* OVERLAYS / BOTTOM SHEETS SECTION                                          */}
            {/* ========================================================================= */}
            {activeModal !== 'none' && (
                <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 60 }}>
                    <div className="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal('none')}></div>

                    {/* 1. BOTTOM SHEET : P E M B A Y A R A N */}
                    {activeModal === 'pembayaran' && (
                        <div className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-28 shadow-2xl animate-slideUp flex flex-col" style={{ maxHeight: '90vh' }}>
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
                                        <button key={method} onClick={() => setPaymentMethod(method)} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors flex justify-center items-center gap-1 ${paymentMethod === method ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                            {method}
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod === 'TUNAI' && (
                                    <div className="space-y-4">
                                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Uang Diterima</label><input type="text" placeholder="Rp" className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 font-bold focus:outline-none focus:border-emerald-500" /></div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button className="bg-emerald-100 text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Rp 550.000</button>
                                            <button className="bg-emerald-100 text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Rp 600.000</button>
                                            <button className="bg-emerald-100 text-emerald-800 text-xs font-bold py-2 rounded-lg border border-emerald-200">Uang Pas</button>
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
                                        <div><label className="text-xs font-bold text-slate-600 block mb-1">Pilih Rekening Tujuan</label><div className="border border-slate-300 rounded-lg p-3 flex items-center gap-3 bg-white"><input type="radio" checked readOnly className="w-4 h-4 text-emerald-600" /><div><p className="text-sm font-bold text-slate-800">BCA</p><p className="text-xs text-indigo-600 font-bold">8465581987</p></div></div></div>
                                    </div>
                                )}

                                <button className="w-full bg-emerald-500 text-white rounded-lg py-3 mt-6 text-sm font-bold shadow-md hover:bg-emerald-600" onClick={() => setActiveModal('sukses_bayar')}>
                                    SELESAIKAN PEMBAYARAN
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. BOTTOM SHEET : S U K S E S   B A Y A R   ( K W I ) */}
                    {activeModal === 'sukses_bayar' && (
                        <div className="relative w-full max-w-md bg-emerald-700 rounded-t-3xl p-5 pb-28 shadow-2xl flex flex-col items-center animate-slideUp" style={{ maxHeight: '95vh' }}>
                            <div className="w-12 h-1.5 bg-emerald-500 rounded-full mx-auto mb-4 shrink-0"></div>
                            <button onClick={() => setActiveModal('none')} className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>

                            <h2 className="text-white text-xl font-bold mb-2 text-center">Piutang Berhasil Dilunasi!</h2>
                            <p className="text-emerald-200 text-xs text-center mb-6">Cetak / Kirim Struk di bawah ini</p>

                            <div className="bg-white w-full rounded-2xl p-6 shadow-2xl relative overflow-y-auto hide-scrollbar">
                                <div className="text-center mb-6"><h1 className="text-2xl font-black text-indigo-700">Yori Egg</h1></div>
                                <div className="border-t border-dashed border-slate-300 py-3 flex justify-between items-start"><div><p className="text-[10px] text-slate-500">No. Kwitansi</p><p className="text-xs font-bold text-indigo-700">KWI - 202606121452</p></div></div>
                                <div className="mb-4 bg-emerald-50 rounded-lg p-3 border border-emerald-100"><p className="text-[10px] font-bold text-emerald-700 uppercase">Pelunasan Tagihan Piutang</p></div>
                                <div className="border-t border-dashed border-slate-300 py-4 mb-2"><div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-800">Total Dibayar</span><span className="text-lg font-black text-emerald-600">Rp 534.234</span></div></div>
                                <div className="grid grid-cols-2 gap-2 mt-6">
                                    <button className="bg-emerald-500 text-white rounded-lg py-2.5 text-xs font-bold">Print Struk</button>
                                    <button className="bg-lime-500 text-white rounded-lg py-2.5 text-xs font-bold">Kirim Struk</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}