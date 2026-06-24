/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: { 50: '#edf8f0', 100: '#d4efdb', 300: '#7bc594', 500: '#248a4c', 600: '#176b3a', 700: '#11532d', 900: '#0b351e' },
        clay: { 50: '#fff4ed', 100: '#fde4d3', 500: '#d86634', 600: '#b94c21' },
      },
      boxShadow: { panel: '0 8px 24px rgba(23, 107, 58, 0.08)' },
    },
  },
  plugins: [],
};
