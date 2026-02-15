/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
        'spring-in': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'spring-out': 'cubic-bezier(0.75, 0, 0.22, 1)',
      },
      colors: {
        brand: {
          50: '#e0fbfd',
          100: '#bdf4f9',
          200: '#8bebf4',
          300: '#4cdced',
          400: '#22ccde',
          500: '#00adb5', /* Primary Brand Color from Palette */
          600: '#008b96',
          700: '#066f7a',
          800: '#0e5a63',
          900: '#114a53',
        },
        accent: {
          50: '#f2fcfd',
          100: '#e0fbfd',
          200: '#bdf4f9',
          300: '#8bebf4',
          400: '#4cdced',
          500: '#00adb5', /* Matching Brand for consistency in this strict palette */
          600: '#008b96',
          700: '#066f7a',
          800: '#0e5a63',
          900: '#114a53',
        },
        surface: {
          50: '#eeeeee', /* Lightest from Palette */
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#606060',
          600: '#393e46', /* Second Darkest from Palette */
          700: '#2d3238',
          800: '#222831', /* Darkest from Palette */
          900: '#1a1e25',
          950: '#0e1115',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pop-in': 'popIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.98)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        xl: '20px',
      },
      scale: {
        102: '1.02',
      }
    },
  },
  daisyui: {
    themes: [
      {
        /* ── Dark Theme (Palette Based) ── */
        certifyme: {
          primary: '#00adb5',
          'primary-content': '#222831',
          secondary: '#393e46',
          'secondary-content': '#eeeeee',
          accent: '#00adb5',
          'accent-content': '#222831',
          neutral: '#393e46',
          'neutral-content': '#eeeeee',
          'base-100': '#222831', /* Darkest */
          'base-200': '#393e46', /* Lighter Dark */
          'base-300': '#222831',
          'base-content': '#eeeeee',
          info: '#00adb5',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      {
        /* ── Light Theme (Palette Based) ── */
        'certifyme-light': {
          primary: '#00adb5',
          'primary-content': '#ffffff',
          secondary: '#393e46',
          'secondary-content': '#eeeeee',
          accent: '#00adb5',
          'accent-content': '#ffffff',
          neutral: '#eeeeee',
          'neutral-content': '#222831',
          'base-100': '#eeeeee', /* Lightest */
          'base-200': '#ffffff',
          'base-300': '#e3e3e3',
          'base-content': '#222831',
          info: '#00adb5',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
    logs: false,
  },
  plugins: [require('daisyui')],
}
