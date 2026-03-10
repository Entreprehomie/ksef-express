/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gov-blue': {
          50: '#e8f0fa',
          100: '#c5d9f2',
          200: '#9fc1e9',
          300: '#79a9e0',
          400: '#5c96d9',
          500: '#3f84d2',
          600: '#0d3f7c',
          700: '#0a3060',
          800: '#072144',
          900: '#041128',
          950: '#020914',
        },
      },
      fontFamily: {
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
