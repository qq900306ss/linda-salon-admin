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
          50: '#fef7ee',
          100: '#fdead6',
          200: '#fad2ac',
          300: '#f7b377',
          400: '#f3854c',
          500: '#f0653a',
          600: '#e1481f',
          700: '#bb341b',
          800: '#942a1c',
          900: '#78251b',
        },
        secondary: {
          50: '#f0f9ff', // Maintain legacy secondary for now if used, or switch to stone
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        admin: {
          dark: '#1c1917', // stone-900
          sidebar: '#292524', // stone-800
          bg: '#fafaf9', // stone-50
        }
      }
    },
  },
  plugins: [],
}
