/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cliff: {
          bg: '#070a13',
          card: '#0d1322',
          surface: '#131b2e',
          border: '#1e293b',
          teal: '#14b8a6',
          tealGlow: '#0d9488',
          amber: '#f59e0b',
          coral: '#f43f5e',
          emerald: '#10b981',
          gold: '#eab308',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
