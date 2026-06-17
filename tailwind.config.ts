import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Jika lu pakai struktur root /app
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Jalur aman jika sewaktu-waktu lu pindah ke folder /src
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;