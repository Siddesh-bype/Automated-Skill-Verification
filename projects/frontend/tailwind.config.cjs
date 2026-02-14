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
          50: '#e6fafb',
          100: '#b3eff2',
          200: '#80e4e8',
          300: '#4dd9df',
          400: '#1aced5',
          500: '#00ADB5',
          600: '#009299',
          700: '#00777d',
          800: '#005c61',
          900: '#004145',
        },
        surface: {
          50: '#222831',
          100: '#2a2e36',
          200: '#313640',
          300: '#393E46',
          400: '#565c66',
          500: '#6b7280',
          600: '#9a9a9a',
          700: '#b8b8b8',
          800: '#d5d5d5',
          900: '#EEEEEE',
          950: '#f5f5f5',
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
          primary: '#00ADB5',
          'primary-content': '#EEEEEE',
          secondary: '#393E46',
          'secondary-content': '#EEEEEE',
          accent: '#1aced5',
          'accent-content': '#222831',
          neutral: '#393E46',
          'neutral-content': '#EEEEEE',
          'base-100': '#EEEEEE',
          'base-200': '#d5d5d5',
          'base-300': '#b8b8b8',
          'base-content': '#222831',
          info: '#00ADB5',
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
