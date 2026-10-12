/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#E9967A',
        secondary: '#FFDAB9',
        accent: '#FF7F50',
        danger: '#FF6B6B',
        success: '#98FB98',
        background: {
          light: '#F8F9FA',
          dark: '#F1F3F5',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'slide-in': 'slide-in 0.5s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(2rem)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-in': {
          '0%': { 
            opacity: '0',
            transform: 'translateX(2rem)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      fontSize: {
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      screens: {
        'tv': '1920px',
        '4k': '2560px',
      },
    },
  },
  plugins: [],
};