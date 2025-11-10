/** @type {import('tailwindcss').Config} */
export default {
  // 1. Enable class-based dark mode
  darkMode: 'class',
  
  // 2. Tell Tailwind where your files are
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {},
  },
  plugins: [],
}