/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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
        admin: {
          dark: '#1e293b',
          sidebar: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
