/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lv: {
          bg: '#1a1d23',
          surface: '#22262e',
          border: '#2d333b',
          muted: '#8b949e',
          accent: '#3b82f6',
          'accent-hover': '#2563eb',
        },
      },
      boxShadow: {
        window: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};
