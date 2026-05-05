/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D0F12',
        surface1: '#141720',
        surface2: '#1C2030',
        border: '#2A2F3E',
        accent: '#E8A020',
        accentHover: '#F0B040',
        textPrimary: '#F0F2F6',
        textSecondary: '#8B93A8',
        textTertiary: '#4A5268',
        aggressor: { bg: '#0F2A1A', text: '#22C55E', border: '#22C55E' },
        anchor: { bg: '#0F1E35', text: '#3B82F6', border: '#3B82F6' },
        improving: { bg: '#2A2200', text: '#EAB308', border: '#EAB308' },
        liability: { bg: '#2A0F0F', text: '#EF4444', border: '#EF4444' }
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
