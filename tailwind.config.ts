import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans-tc)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fff1f4',
          100: '#ffe4e9',
          200: '#fecdd6',
          300: '#fda4b3',
          400: '#fb7189',
          500: '#f43f5e',
          600: '#e11d48',
        },
      },
      animation: {
        'blob': 'blob 18s infinite ease-in-out',
        'shimmer': 'shimmer 1.8s infinite linear',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -60px) scale(1.15)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.9)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
