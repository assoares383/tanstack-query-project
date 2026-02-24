/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#f3f6fb',
          card: '#ffffff',
          border: '#dbe4f0',
          text: '#0f172a',
          muted: '#475569',
          primary: '#2563eb',
          'primary-hover': '#1d4ed8',
          danger: '#dc2626',
          success: '#059669',
        },
      },
      boxShadow: {
        card: '0 10px 25px -20px rgba(15,23,42,0.55)',
      },
    },
  },
  plugins: [],
}
