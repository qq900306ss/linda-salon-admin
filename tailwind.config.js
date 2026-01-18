/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        primary: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a08075', // Muted Terracotta/Rose
          600: '#8a6a5f',
          700: '#72554d',
          800: '#5d433b',
          900: '#4a342e',
        },
        secondary: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d', // Warm Charcoal/Stone
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
        },
        ethereal: {
          dark: '#0c0a09', // Warm Black
          surface: '#1c1917', // Deep Stone
          accent: '#e7a1b0', // Muted Rose Glow
        },
        admin: {
          dark: '#0c0a09',
          sidebar: '#1c1917',
          bg: '#0c0a09', // Ethereal dark background
        }
      },
      boxShadow: {
        'ethereal': '0 20px 50px -12px rgba(0, 0, 0, 0.7)',
        'glow': '0 0 20px rgba(231, 161, 176, 0.15)',
        'neon': '0 0 10px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.05)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
