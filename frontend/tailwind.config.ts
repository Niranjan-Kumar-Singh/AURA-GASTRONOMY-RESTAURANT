import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          obsidian: '#0B0B0F',
          gold: '#D4AF37',
          'gold-hover': '#B89628',
          emerald: '#10B981',
          velvet: '#16161E',
          ivory: '#F8FAFC',
          slate: '#A1A1AA',
          container: '#14141B',
          border: 'rgba(212, 175, 55, 0.15)',
        },
      },
      fontFamily: {
        serif: ['Outfit', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
