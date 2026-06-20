'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface SaleDetailItem {
  id: number;
  qty: number;
  price_sell_at_sale: string;
  product: {
    name: string;
    sku: string;
  };
}

interface SaleData {
  id: number;
  invoice_no: string;
  total_amount: string;
  amount_paid: string;
  status: string;
  type: string;
  payment_method: string;
  payment_proof: string | null;
  created_at: string;
  customer: {
    name: string;
    phone: string | null;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
  } | null;
  sale_details: SaleDetailItem[];
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; color: string }> = {
    lunas: { label: 'LUNAS', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
    proses: { label: 'PROSES', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
    piutang: { label: 'PIUTANG', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' },
    terkirim: { label: 'TERKIRIM', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
    voided: { label: 'VOID', color: 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400' },
  };
  const s = map[status] || { label: status.toUpperCase(), color: 'bg-stone-100 text-stone-600' };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
  );
};

export default function StrukPage({ params }: { params: Promise<{ invoice_no: string }> }) {
  const { invoice_no } = use(params);
  const [data, setData] = useState<SaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/checkout/${encodeURIComponent(invoice_no)}`);
        const result = await res.json();
        if (res.ok && result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Struk tidak ditemukan.');
        }
      } catch {
        setError('Gagal terhubung ke server.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [invoice_no]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-pulse text-4xl">🧾</div>
          <p className="text-xs text-muted-foreground font-mono animate-pulse">Memuat struk...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <span className="text-5xl block">🔍</span>
          <h1 className="font-bold text-lg text-foreground">Struk Tidak Ditemukan</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">{error || `Invoice "${invoice_no}" tidak tersedia.`}</p>
          <Link
            href="/"
            className="inline-block mt-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = new Date(data.created_at);
  const dateStr = createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = createdDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const subtotal = data.sale_details.reduce((sum, d) => sum + Number(d.price_sell_at_sale) * d.qty, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Toggle View Button */}
      <button
        onClick={() => setShowReceipt(!showReceipt)}
        className="mb-4 px-4 py-2 bg-card border border-border rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition"
      >
        {showReceipt ? '📄 Tampilan Layar' : '🧾 Tampilan Struk'}
      </button>

      {/* Digital Receipt */}
      <div
        className={`w-full max-w-sm bg-card border border-border/80 shadow-lg overflow-hidden transition-all duration-300 ${
          showReceipt ? 'rounded-3xl' : 'rounded-3xl'
        }`}
      >
        {/* Receipt Content */}
        <div className={`p-6 sm:p-8 ${showReceipt ? 'font-mono' : ''}`}>
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-border pb-5 mb-5">
            <h1 className={`font-bold tracking-tight ${showReceipt ? 'text-lg' : 'text-xl'} text-foreground`}>
              {showReceipt ? 'YORIPOS V3' : 'YoriPOS V3'}
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Asayori Tech • Command Center</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-xs font-bold text-foreground font-mono">{data.invoice_no}</span>
              {statusBadge(data.status)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
              {dateStr} • {timeStr}
            </p>
          </div>

          {/* Customer Info */}
          {data.customer && (
            <div className="mb-4 pb-4 border-b border-dashed border-border">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Pelanggan</p>
              <p className="text-xs font-semibold text-foreground">{data.customer.name}</p>
              {data.customer.phone && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{data.customer.phone}</p>
              )}
              {data.customer.address && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{data.customer.address}</p>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="mb-4">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Pesanan</p>
            <div className="space-y-2">
              {/* Header Row */}
              <div className="flex items-center text-[9px] text-muted-foreground font-bold uppercase tracking-wider pb-1 border-b border-border">
                <span className="flex-1">Item</span>
                <span className="w-12 text-right">Qty</span>
                <span className="w-20 text-right">Harga</span>
                <span className="w-20 text-right">Subtotal</span>
              </div>
              {data.sale_details.map((detail) => (
                <div key={detail.id} className="flex items-center text-xs text-foreground">
                  <span className="flex-1 truncate">{detail.product.name}</span>
                  <span className="w-12 text-right font-mono">{detail.qty}x</span>
                  <span className="w-20 text-right font-mono text-muted-foreground">{formatRupiah(Number(detail.price_sell_at_sale))}</span>
                  <span className="w-20 text-right font-mono font-semibold">{formatRupiah(Number(detail.price_sell_at_sale) * detail.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-dashed border-border pt-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono text-foreground">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold border-t border-border pt-1.5">
              <span className="text-foreground">Total</span>
              <span className="font-mono text-foreground">{formatRupiah(Number(data.total_amount))}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Dibayar</span>
              <span className="font-mono text-foreground">{formatRupiah(Number(data.amount_paid))}</span>
            </div>
            {Number(data.total_amount) > Number(data.amount_paid) && (
              <div className="flex justify-between text-xs text-destructive font-bold">
                <span>Sisa</span>
                <span className="font-mono">{formatRupiah(Number(data.total_amount) - Number(data.amount_paid))}</span>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="mt-4 pt-4 border-t border-dashed border-border">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Metode</span>
              <span className="font-semibold text-foreground">{data.payment_method}</span>
            </div>
            <div className="flex justify-between text-[10px] mt-1">
              <span className="text-muted-foreground">Tipe</span>
              <span className="font-semibold text-foreground">{data.type === 'delivery' ? '🏍️ DIKIRIM' : '🏬 AMBIL TOKO'}</span>
            </div>
            {data.payment_proof && (
              <div className="mt-2">
                <p className="text-[9px] text-muted-foreground mb-1">Bukti Pembayaran:</p>
                <img
                  src={data.payment_proof}
                  alt="Bukti bayar"
                  className="w-full h-32 object-contain rounded-xl border border-border bg-muted"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t-2 border-dashed border-border text-center">
            <p className="text-[9px] text-muted-foreground leading-relaxed">
              Terima kasih atas kunjungan Anda!<br />
              Barang yang sudah dibeli tidak dapat dikembalikan.<br />
              <span className="font-bold text-foreground">Asayori Tech</span>
            </p>
            <div className="mt-3 text-[8px] text-muted-foreground font-mono">
              {'—'.repeat(28)}
            </div>
            <p className="text-[8px] text-muted-foreground mt-1 font-mono">
              Dicetak digital • {new Date().toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Download/Print Button */}
      {typeof window !== 'undefined' && (
        <button
          onClick={() => window.print()}
          className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-sm active:scale-[0.98] print:hidden"
        >
          🖨️ Cetak / Simpan PDF
        </button>
      )}

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
