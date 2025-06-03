/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#010066',
          50: '#e6e6f2',
          100: '#c2c2e0',
          200: '#9a9acc',
          300: '#7272b8',
          400: '#4a4aa6',
          500: '#010066',
          600: '#01005c',
          700: '#010052',
          800: '#010047',
          900: '#01003d',
        },
        accent: {
          DEFAULT: '#FCCD02',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#FCCD02',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Colores para modo claro
        light: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          text: '#000000',
          'text-secondary': '#666666',
          border: '#E5E5E5',
        },
        // Colores para modo oscuro
        dark: {
          background: '#0A0A0A',
          surface: '#1A1A1A',
          text: '#F5F5F5',
          'text-secondary': '#B0B0B0',
          border: '#2A2A2A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}