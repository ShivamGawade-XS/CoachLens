/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:     'rgb(var(--color-primary))',
        surface1:    'rgb(var(--color-surface1))',
        surface2:    'rgb(var(--color-surface2))',
        surface3:    'rgb(var(--color-surface3))',
        border:      'rgb(var(--color-border))',
        borderHover: 'rgb(var(--color-border-hover))',
        accent:      'rgb(var(--color-accent))',
        accentHover: 'rgb(var(--color-accent-hover))',
        textPrimary:   'rgb(var(--color-text-primary))',
        textSecondary: 'rgb(var(--color-text-secondary))',
        textTertiary:  'rgb(var(--color-text-tertiary))',
        aggressor: { 
          bg:     'rgb(var(--color-aggressor-bg))', 
          text:   'rgb(var(--color-aggressor-text))', 
          border: 'rgb(var(--color-aggressor-border))', 
        },
        anchor: { 
          bg:     'rgb(var(--color-anchor-bg))', 
          text:   'rgb(var(--color-anchor-text))', 
          border: 'rgb(var(--color-anchor-border))', 
        },
        improving: { 
          bg:     'rgb(var(--color-improving-bg))', 
          text:   'rgb(var(--color-improving-text))', 
          border: 'rgb(var(--color-improving-border))', 
        },
        liability: { 
          bg:     'rgb(var(--color-liability-bg))', 
          text:   'rgb(var(--color-liability-text))', 
          border: 'rgb(var(--color-liability-border))', 
        },
        success: 'rgb(var(--color-success))',
        warning: 'rgb(var(--color-warning))',
        error:   'rgb(var(--color-error))',
      },
      fontFamily: {
        sans: ['"DM Sans"', '"DM Sans Fallback"', 'Arial', 'sans-serif'],
        display: ['Fraunces', '"Fraunces Fallback"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"JetBrains Mono Fallback"', '"Courier New"', 'monospace']
      },
      fontSize: {
        'display-xl': ['32px', { lineHeight: '1.2', fontWeight: '500', letterSpacing: '-0.02em' }],
        'display-lg': ['24px', { lineHeight: '1.3', fontWeight: '500', letterSpacing: '-0.02em' }],
        'heading-md': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-md': ['15px', { lineHeight: '1.75', fontWeight: '400', letterSpacing: '0.012em' }],
        'body-sm': ['12px', { lineHeight: '1.75', fontWeight: '400', letterSpacing: '0.012em' }],
        'mono-stat': ['20px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.04em' }],
        'mono-sm': ['12px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.04em' }],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
          '50%':       { boxShadow: '0 0 20px 4px rgba(59, 130, 246, 0.15)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-12px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-out': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-12px) scale(0.95)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.3s ease-out forwards',
        'scale-pop': 'scale-pop 0.3s ease-out forwards',
        'progress-fill': 'progress-fill 3s ease-in-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 2s linear infinite',
        'toast-in': 'toast-in 0.3s ease-out forwards',
        'toast-out': 'toast-out 0.2s ease-in forwards',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'glow-amber': '0 0 20px rgba(232, 160, 32, 0.2)',
        'glow-accent': '0 0 20px var(--glow-accent)',
        'glow-green': '0 0 16px rgba(34, 197, 94, 0.15)',
        'glow-blue': '0 0 16px rgba(59, 130, 246, 0.15)',
        'glow-red': '0 0 16px rgba(239, 68, 68, 0.15)',
        'glow-yellow': '0 0 16px rgba(234, 179, 8, 0.15)',
      }
    },
  },
  plugins: [],
}
