'use client';

import React, { useState } from 'react';

export default function SidebarMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [isDark, setIsDark] = useState(false);
    const [activeTheme, setActiveTheme] = useState('emerald');

    if (!isOpen) return null;

    const themes = [
        { id: 'emerald', color: 'bg-emerald-500' },
        { id: 'blue', color: 'bg-blue-500' },
        { id: 'rose', color: 'bg-rose-500' },
        { id: 'amber', color: 'bg-amber-500' },
        { id: 'indigo', color: 'bg-indigo-500' },
    ];

    const menuItems = [
        { name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Manajemen Menu', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { name: 'Daftar Pelanggan', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'Laporan Penjualan', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Pengaturan Toko', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex font-sans">
            <div onClick={onClose} className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}></div>

            <div className={`relative w-[87.5%] max-w-sm h-full bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Sidebar Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="flex justify-between items-center mb-5">
                        <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">Y</div>
                        <button onClick={onClose} className="w-9 h-9 bg-white text-slate-500 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-100 active:scale-95 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <h2 className="text-lg font-black text-slate-800">YoriPOS v3</h2>
                    <p className="text-xs font-bold text-emerald-600">Admin Panel</p>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1 hide-scrollbar">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-3">Fitur Utama</p>
                    {menuItems.map((item, i) => (
                        <button key={i} className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-sm transition-all active:scale-95">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                            {item.name}
                        </button>
                    ))}
                </div>

                {/* Appearance Settings */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tampilan</p>

                    <div className="flex justify-between items-center mb-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            <span className="text-sm font-bold text-slate-700">Dark Mode</span>
                        </div>
                        <button onClick={() => setIsDark(!isDark)} className={`w-12 h-6 rounded-full p-1 transition-colors ${isDark ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <span className="text-xs font-bold text-slate-600 block mb-3">Warna Aksen</span>
                    <div className="flex gap-3">
                        {themes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTheme(t.id)}
                                className={`w-9 h-9 rounded-2xl shadow-sm ${t.color} flex items-center justify-center transform transition-transform active:scale-90 ${activeTheme === t.id ? 'ring-4 ring-slate-200 scale-110' : ''}`}
                            >
                                {activeTheme === t.id && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logout */}
                <div className="p-5 bg-white shrink-0">
                    <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-rose-50 text-rose-600 font-bold text-sm active:scale-95 transition-transform transform-gpu">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout PWA
                    </button>
                </div>
            </div>
        </div>
    );
}