/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        egat: {
          navy:        '#1B3A6B',
          'navy-dark': '#0D2240',
          'navy-mid':  '#2A5298',
          gold:        '#E8960C',
          'gold-lt':   '#F5B942',
          bg:          '#F0F4F8',
          surface:     '#FFFFFF',
          'surface-alt':'#F7FAFC',
          border:      '#DDE3ED',
          'border-lt': '#EEF2F7',
          text:        '#1A202C',
          'text-sub':  '#4A5568',
          'text-muted':'#8896A4',
          green:       '#1A7F4B',
          'green-bg':  '#EAFAF1',
          yellow:      '#B7791F',
          'yellow-bg': '#FEFCE8',
          orange:      '#C05621',
          'orange-bg': '#FFF5ED',
          red:         '#C53030',
          'red-bg':    '#FFF0F0',
          blue:        '#1A56DB',
          'blue-bg':   '#EBF5FF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'IBM Plex Sans Thai', 'Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
        'card-md': '0 4px 12px rgba(0,0,0,0.08)',
        sidebar: '2px 0 16px rgba(0,0,0,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
      },
    },
  },
  plugins: [],
}
