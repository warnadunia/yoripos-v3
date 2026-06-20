'use client';

// src/components/layout/AppLayoutMaster.tsx (Full Fixed - Responsive Context Switcher Layout)
import { useState, useEffect } from 'react';

type ViewMode = 'OPERATOR' | 'BISNIS';
type OperatorRole = 'KASIR' | 'DAPUR' | 'KURIR';

interface AppLayoutMasterProps {
  children: React.ReactNode;
}

export default function AppLayoutMaster({ children }: AppLayoutMasterProps) {
  const [hasMounted, setHasMounted] = useState(false);
  
  // State Utama ala Akun DANA (Private vs Bisnis)
  const [viewMode, setViewMode] = useState<ViewMode>('OPERATOR');
  
  // State internal untuk simulasi role operator
  const [operatorRole, setOperatorRole] = useState<OperatorRole>('KASIR');
  
  // State untuk minimize sidebar kasir di desktop/tablet
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setHasMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center font-sans">
        <p className="text-xs text-stone-400 animate-pulse">Menyiapkan Engine Asayori Tech...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* TOPBAR GLOBAL (Sakelar Mode Akun ala DANA & Informasi Profil)             */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-stone-200/80 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold tracking-wider text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
            YoriPOS <span className="text-emerald-600">V3</span>
          </span>
          
          {/* Simulasi Selector Role jika di Mode Operator (Hanya untuk testing dev) */}
          {viewMode === 'OPERATOR' && (
            <select 
              value={operatorRole} 
              onChange={(e) => setOperatorRole(e.target.value as OperatorRole)}
              className="text-[11px] bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5 font-medium text-stone-600 focus:outline-none"
            >
              <option value="KASIR">Role: Kasir</option>
              <option value="DAPUR">Role: Dapur</option>
              <option value="KURIR">Role: Kurir</option>
            </select>
          )}
        </div>

        {/* TOGGLE SAKELAR UTAMA ALA DANA (Private / Bisnis) */}
        <div className="bg-stone-100 p-1 rounded-xl flex items-center shadow-inner border border-stone-200/40">
          <button
            onClick={() => setViewMode('OPERATOR')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              viewMode === 'OPERATOR'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            📱 Operator
          </button>
          <button
            onClick={() => setViewMode('BISNIS')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              viewMode === 'BISNIS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            💼 Bisnis
          </button>
        </div>

        {/* User Info Right Corner */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-medium text-stone-900">Yori DevHouse</p>
            <p className="text-[10px] text-stone-400 font-mono">ID-202603</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold font-mono">
            Y
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* BODY WRAPPER (Pembagian Area Konten Berdasarkan Mode & Perangkat)        */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-row relative h-[calc(100vh-53px)] overflow-hidden">
        
        {/* SIDEBAR: Muncul jika di Mode BISNIS ATAU Mode KASIR di Layar Desktop/Tablet */}
        {(viewMode === 'BISNIS' || (viewMode === 'OPERATOR' && operatorRole === 'KASIR')) && (
          <aside 
            className={`hidden md:flex flex-col bg-white border-r border-stone-200 shrink-0 transition-all duration-300 ${
              isSidebarMinimized ? 'w-16' : 'w-64'
            }`}
          >
            {/* Tombol Minimize Sidebar (1.b) */}
            <div className="p-3 border-b border-stone-100 flex items-center justify-between">
              {!isSidebarMinimized && (
                <span className="text-[11px] font-mono tracking-wider text-stone-400 uppercase font-semibold">
                  {viewMode === 'BISNIS' ? 'Main Menu Owner' : 'Kasir Desk Menu'}
                </span>
              )}
              <button 
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 mx-auto md:ml-auto transition"
                title={isSidebarMinimized ? "Perluas Menu" : "Sembunyikan Menu"}
              >
                {isSidebarMinimized ? '❯' : '❮'}
              </button>
            </div>

            {/* Menu Links List Content */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {viewMode === 'BISNIS' ? (
                // DAFTAR MENU LENGKAP MODE BISNIS
                <>
                  <SidebarItem icon="📊" label="Ringkasan Analitik" minimized={isSidebarMinimized} active={true} />
                  <SidebarItem icon="📦" label="Stok Batch FIFO" minimized={isSidebarMinimized} />
                  <SidebarItem icon="🧾" label="Piutang & Invoice (SIXTY)" minimized={isSidebarMinimized} />
                  <SidebarItem icon="👥" label="Pegawai & AbsenPWA" minimized={isSidebarMinimized} />
                  <SidebarItem icon="⚙️" label="Pengaturan Sistem" minimized={isSidebarMinimized} />
                </>
              ) : (
                // DAFTAR MENU OPERATOR KASIR DESKTOP
                <>
                  <SidebarItem icon="🛒" label="Mesin Kasir POS" minimized={isSidebarMinimized} active={true} />
                  <SidebarItem icon="⏱️" label="Riwayat Nota Masuk" minimized={isSidebarMinimized} />
                  <SidebarItem icon="📥" label="Pending Order" minimized={isSidebarMinimized} />
                </>
              )}
            </nav>
          </aside>
        )}

        {/* AREA UTAMA AREA KONTEN (Pola 1.c Kasir Mobile Simple Full Page Terpenuhi Otomatis) */}
        <main className="flex-1 overflow-y-auto bg-stone-50 p-4 sm:p-6 pb-24 md:pb-6">
          
          {/* Banner Indikator Mode Aktif Minimalis */}
          <div className={`mb-4 px-4 py-2 rounded-xl border flex items-center justify-between text-xs font-medium ${
            viewMode === 'BISNIS' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60' 
              : 'bg-stone-900 text-stone-100 border-stone-800'
          }`}>
            <div>
              Mode Terbuka: <span className="font-bold underline">{viewMode} CONTROL</span> 
              {viewMode === 'OPERATOR' && ` (Peran: ${operatorRole})`}
            </div>
            <span className="text-[10px] font-mono opacity-80">Secure Connected to TiDB</span>
          </div>

          {/* Render Isi Halaman Utama Aplikasi */}
          {children}
          
        </main>

        {/* ========================================================================= */}
        {/* BOTTOM NAVIGATION: Hanya aktif di HP/Mobile untuk Dapur & Kurir (1.a)     */}
        {/* ========================================================================= */}
        {viewMode === 'OPERATOR' && (operatorRole === 'DAPUR' || operatorRole === 'KURIR') && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-2 flex items-center justify-around z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            {operatorRole === 'DAPUR' ? (
              <>
                <BottomNavItem icon="🍳" label="Antrean Masak" active={true} />
                <BottomNavItem icon="✅" label="Selesai Diolah" />
                <BottomNavItem icon="⚠️" label="Stok Habis" />
              </>
            ) : (
              <>
                <BottomNavItem icon="🏍️" label="Siap Antar" active={true} />
                <BottomNavItem icon="📍" label="Dalam Perjalanan" />
                <BottomNavItem icon="🏁" label="Sampai Tujuan" />
              </>
            )}
          </nav>
        )}

      </div>
    </div>
  );
}

// Sub-Komponen Pembantu: Item Sidebar
function SidebarItem({ icon, label, minimized, active = false }: { icon: string; label: string; minimized: boolean; active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition ${
      active 
        ? 'bg-stone-900 text-white' 
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
    }`}>
      <span className="text-base shrink-0">{icon}</span>
      {!minimized && <span className="truncate">{label}</span>}
    </button>
  );
}

// Sub-Komponen Pembantu: Item Navigasi Bawah Mobile
function BottomNavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <button className="flex flex-col items-center justify-center py-1 px-3 text-center transition group">
      <span className={`text-xl mb-0.5 transition-transform ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
        {icon}
      </span>
      <span className={`text-[10px] font-medium tracking-tight whitespace-nowrap ${active ? 'text-emerald-700 font-bold' : 'text-stone-500'}`}>
        {label}
      </span>
    </button>
  );
}