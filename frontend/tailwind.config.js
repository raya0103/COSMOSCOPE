/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: 'var(--space-950, #030712)',
          900: 'var(--space-900, #070D1E)',
          850: 'var(--space-850, #0C152E)',
          800: 'var(--space-800, #111E3F)',
          700: 'var(--space-700, #1A2E5E)',
          border: 'var(--space-border, #1F3366)',
        },
        cyan: {
          glow: '#00F0FF',
        },
        violet: {
          glow: '#9D4EDD',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
