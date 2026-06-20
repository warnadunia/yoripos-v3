'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // 1. Fetch user data
    fetch('/api/auth/user')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setCurrentUser({ username: data.username, role: data.role });
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Set time clock running and theme sync
    const timer = setTimeout(() => {
      setCurrentTime(new Date());
      const saved = localStorage.getItem('yoripos_dark_mode') === 'true';
      setIsDarkMode(saved);
      document.documentElement.classList.toggle('dark', saved);
    }, 0);

    const clock = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(clock);
    };
  }, [router]);

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem('yoripos_dark_mode', String(nextDark));
    document.documentElement.classList.toggle('dark', nextDark);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch {
      alert('Gagal keluar dari sistem.');
    }
  };

  const getGreeting = () => {
    if (!currentTime) return 'Selamat Datang';
    const hrs = currentTime.getHours();
    if (hrs >= 5 && hrs < 12) return 'Selamat Pagi';
    if (hrs >= 12 && hrs < 16) return 'Selamat Siang';
    if (hrs >= 16 && hrs < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading || !currentTime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 transition-colors duration-200">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-stone-400 font-mono tracking-widest uppercase animate-pulse">Menghubungkan Sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 transition-colors duration-200 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs font-black tracking-wider px-3 py-1 rounded-xl bg-stone-950 dark:bg-stone-800 text-stone-50 shadow-inner">
            YoriPOS <span className="text-emerald-500">V3</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-lg uppercase">
            {currentUser?.role || 'Guest'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleTheme}
            className="p-2.5 rounded-xl transition bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400"
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-[0.98]"
          >
            Keluar Sesi ✕
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl w-full mx-auto space-y-8">
        {/* Greetings Section */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 bg-gradient-to-r from-stone-900 to-stone-500 dark:from-white dark:to-stone-500 bg-clip-text text-transparent">
            {getGreeting()}, {currentUser?.username || 'User'}!
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-xs text-stone-500 dark:text-stone-400 font-mono">
            <span>📅 {formatDate(currentTime)}</span>
            <span className="hidden sm:inline text-stone-300 dark:text-stone-750">•</span>
            <span className="bg-stone-100 dark:bg-stone-900/60 px-2.5 py-0.5 rounded-md font-bold text-stone-600 dark:text-stone-300">
              🕒 {formatTime(currentTime)}
            </span>
          </div>
          <p className="text-sm font-medium text-stone-400 dark:text-stone-500 pt-2">
            Apakah yang akan kamu lakukan hari ini?
          </p>
        </div>

        {/* Portal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {/* Card 1: Buka Kasir */}
          <div
            onClick={() => router.push('/pos?action=open_kasir')}
            className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-500 dark:hover:border-emerald-450 shadow-sm hover:shadow-md cursor-pointer transition-all duration-205 group active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-all duration-200 shrink-0">
                🛒
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Buka Kasir / POS
                </h3>
                <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                  Mulai shift laci kasir baru, input saldo awal kasir, dan lakukan checkout transaksi konsumen.
                </p>
                <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-2">
                  Mulai Transaksi →
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Masukkan Stok */}
          <div
            onClick={() => router.push('/pos?tab=STOK')}
            className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-blue-500 dark:hover:border-blue-450 shadow-sm hover:shadow-md cursor-pointer transition-all duration-205 group active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-all duration-200 shrink-0">
                📦
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Manajemen Stok FIFO
                </h3>
                <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                  Catat bahan baku masuk, edit data item, dan pantau rincian harga eceran batch stok aktif.
                </p>
                <span className="inline-block text-[10px] font-bold text-blue-600 dark:text-blue-400 pt-2">
                  Update Inventaris →
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Lihat Laporan */}
          <div
            onClick={() => router.push('/pos?tab=RINGKASAN')}
            className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-purple-500 dark:hover:border-purple-450 shadow-sm hover:shadow-md cursor-pointer transition-all duration-205 group active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-all duration-200 shrink-0">
                📈
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Laporan & Grafik Analitik
                </h3>
                <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                  Analisis perolehan omset penjualan, laba kotor resep, piutang, dan tren komparasi bulanan.
                </p>
                <span className="inline-block text-[10px] font-bold text-purple-600 dark:text-purple-400 pt-2">
                  Buka Dashboard →
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Catat Pengeluaran */}
          <div
            onClick={() => router.push('/pos?tab=PENGELUARAN')}
            className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-rose-500 dark:hover:border-rose-450 shadow-sm hover:shadow-md cursor-pointer transition-all duration-205 group active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-all duration-200 shrink-0">
                💸
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Catat Pengeluaran
                </h3>
                <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                  Rekam biaya operasional operasional seperti listrik, air, sewa ruko, gaji, dan biaya pemasaran.
                </p>
                <span className="inline-block text-[10px] font-bold text-rose-600 dark:text-rose-400 pt-2">
                  Input Pengeluaran →
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center shrink-0 border-t border-stone-200/50 dark:border-stone-800/50 text-[10px] text-stone-400 dark:text-stone-600 font-mono">
        YoriPOS V3 Executive Dashboard • Powered by Antigravity Engine
      </footer>
    </div>
  );
}