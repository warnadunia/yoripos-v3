'use client';

import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';
import RiwayatView from './components/RiwayatView';
import PesananView from './components/PesananView';
import PiutangView from './components/PiutangView';
import BiayaView from './components/BiayaView';
import PosView from './components/PosView';

export default function PwaMainContainer() {
  // Default tab saat pertama kali render
  const [activeTab, setActiveTab] = useState('dashboard');

  // State ini yang pegang kendali untuk nampilin POS full screen
  const [isPosOpen, setIsPosOpen] = useState(false);

  return (
    <>
      {isPosOpen ? (
        // Render POS full screen menutupi semuanya
        <PosView onBack={() => setIsPosOpen(false)} />
      ) : (
        // Render struktur Dashboard dan BottomNav yang sebelumnya
        <div className="min-h-screen mx-auto shadow-2xl relative overflow-x-hidden antialiased bg-teal-50">

          {/* RENDER PAGES BERDASARKAN SELECTION */}
          <div className="transition-all duration-150">
            {/* PASSING fungsi setIsPosOpen ke DashboardView lewat props */}
            {activeTab === 'dashboard' && <DashboardView onOpenPos={() => setIsPosOpen(true)} />}

            {activeTab === 'transaksi' && <RiwayatView />}
            {activeTab === 'pesanan' && <PesananView />}
            {activeTab === 'piutang' && <PiutangView />}
            {activeTab === 'biaya' && <BiayaView />}
          </div>

          {/* FIXED BOTTOM NAV COMPONENT */}
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}
    </>
  );
}