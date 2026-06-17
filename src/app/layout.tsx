// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YoriPOS V3 Command Center",
  description: "Enterprise Resource Planning & Point of Sale by Asayori Tech",
  manifest: "/manifest.json", // Persiapan PWA
};

// Optimasi viewport untuk perangkat mobile & Capacitor
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body 
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased selection:bg-blue-200 selection:text-blue-900`}
      >
        {/* Container Utama:
          - min-h-screen: Memastikan tinggi penuh
          - pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]: Menangani notch/home indicator pada iOS/Android via Capacitor 
        */}
        <main className="relative flex min-h-screen flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
          {children}
        </main>
      </body>
    </html>
  );
}