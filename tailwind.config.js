/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F1F6F3',
          100: '#DFEAE3',
          200: '#BFD4C7',
          600: '#2A5A46',
          700: '#204737',
          800: '#173428',
          900: '#0F221A',
        },
        terracotta: {
          50: '#FDF6F3',
          100: '#FAECE6',
          500: '#C85A32',
          600: '#B04B25',
          700: '#943C1B',
        },
        sand: {
          50: '#FAF8F5',
          100: '#F4F0E8',
          200: '#E7DFD1',
          300: '#D5C7B2',
          800: '#2C2825',
          900: '#1A1816',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
