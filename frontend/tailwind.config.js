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
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9ddfd',
          500: '#1d68bd',
          600: '#1351a3',
          700: '#0e3e80',
          800: '#0b2f63',
          900: '#081f44',
        },
        navy: {
          800: '#0f1f38',
          900: '#0a1426',
        }
      }
    },
  },
  plugins: [],
}
