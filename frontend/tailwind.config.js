/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f4',
          100: '#fbe8e8',
          200: '#f8d5d5',
          300: '#f2b5b5',
          400: '#e88888',
          500: '#db5858',
          600: '#c53d3d',
          700: '#a52f2f',
          800: '#892929',
          900: '#732727',
          950: '#3e1111',
        },
        kannada: {
          gold: '#FF9933',
          red: '#CC0000',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans Kannada"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
