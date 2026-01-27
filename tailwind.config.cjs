/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#1e3a8a',
        'brand-orange': '#f59e0b',
        'brand-blue': '#3b82f6',
        'slate-gray': '#64748b',
        'off-white': '#f8fafc',
      },
    },
  },
  plugins: [],
}
