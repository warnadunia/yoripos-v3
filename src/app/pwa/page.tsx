'use client';

import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';
import RiwayatView from './components/RiwayatView';
import PesananView from './components/PesananView';
import PiutangView from './components/PiutangView';
import BiayaView from './components/BiayaView';
import PosView from './components/PosView';
import KitchenView from './components/KitchenView';
import SidebarMenu from './components/SidebarMenu';

// Dummy Komponen untuk tab yang belum dibikin
const DummyView = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-screen text-slate-400 font-bold">{title}</div>
);

export default function PwaMainContainer() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [isKitchenOpen, setIsKitchenOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {/* Tumpukan Layar Full Screen (Prioritas Tertinggi) */}
      {isPosOpen && <PosView onBack={() => setIsPosOpen(false)} />}
      {isKitchenOpen && <KitchenView onBack={() => setIsKitchenOpen(false)} />}

      {/* Tampilkan layout utama HANYA JIKA POS & Kitchen tertutup */}
      {!isPosOpen && !isKitchenOpen && (
        <div className="min-h-screen mx-auto shadow-2xl relative overflow-x-hidden antialiased bg-slate-50">

          {/* RENDER PAGES BERDASARKAN SELECTION */}
          <div className="transition-all duration-150">

            {activeTab === 'dashboard' && (
              <DashboardView
                onOpenKitchen={() => setIsKitchenOpen(true)}
                onOpenPos={() => setIsPosOpen(true)}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            )}
            {activeTab === 'transaksi' && (
              <RiwayatView
                onOpenKitchen={() => setIsKitchenOpen(true)}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            )}
            {activeTab === 'pesanan' && (
              <PesananView
                onOpenKitchen={() => setIsKitchenOpen(true)}
                onOpenPos={() => setIsPosOpen(true)}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            )}
            {activeTab === 'piutang' && (
              <PiutangView
                onOpenKitchen={() => setIsKitchenOpen(true)}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            )}
            {activeTab === 'biaya' && (
              <BiayaView
                onOpenKitchen={() => setIsKitchenOpen(true)}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            )}
          </div>

          {/* FIXED BOTTOM NAV COMPONENT */}
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}
    </>
  );
}