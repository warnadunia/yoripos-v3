/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Ganti 'tailwindcss' lama dengan package baru khusus v4 ini
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;