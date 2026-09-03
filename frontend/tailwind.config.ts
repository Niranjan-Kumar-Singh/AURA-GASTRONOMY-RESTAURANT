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
          obsidian: '#090A0F',
          velvet: '#10131E',
          container: '#161A28',
          card: '#1E2336',
          cyan: '#38BDF8',
          'cyan-light': '#7DD3FC',
          'cyan-dark': '#0284C7',
          'cyan-hover': '#0EA5E9',
          platinum: '#E2E8F0',
          emerald: '#10B981',
          ruby: '#F43F5E',
          ivory: '#FFFFFF',
          slate: '#94A3B8',
          border: 'rgba(56, 189, 248, 0.2)',
          'border-hover': 'rgba(56, 189, 248, 0.55)',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(56, 189, 248, 0.35)',
        'cyan-glow-lg': '0 0 35px rgba(56, 189, 248, 0.55)',
        'card-luxury': '0 12px 32px -8px rgba(0, 0, 0, 0.85), 0 0 15px rgba(56, 189, 248, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
