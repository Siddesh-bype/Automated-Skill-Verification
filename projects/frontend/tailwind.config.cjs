/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fdf8f0',
          100: '#f5ead4',
          200: '#ebd5a8',
          300: '#d4a94e',
          400: '#c4922a',
          500: '#b07d1e',
          600: '#96691a',
          700: '#7a5416',
          800: '#5e4012',
          900: '#3d2a0c',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  daisyui: {
    themes: [
      {
        certifyme: {
          primary: '#b07d1e',
          'primary-content': '#ffffff',
          secondary: '#334155',
          'secondary-content': '#f8fafc',
          accent: '#d4a94e',
          'accent-content': '#0f172a',
          neutral: '#1e293b',
          'neutral-content': '#cbd5e1',
          'base-100': '#0f172a',
          'base-200': '#1e293b',
          'base-300': '#334155',
          'base-content': '#f1f5f9',
          info: '#64748b',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
        },
      },
    ],
    logs: false,
  },
  plugins: [require('daisyui')],
}
