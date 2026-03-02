/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f0',
          100: '#faefd8',
          200: '#f5dba8',
          300: '#eec272',
          400: '#e6a340',
          500: '#d4851e',
          600: '#b86b15',
          700: '#955213',
          800: '#784116',
          900: '#623715',
        },
        warm: {
          50: '#faf7f2',
          100: '#f3ece0',
          200: '#e8d9c0',
          300: '#d9be97',
          400: '#c89d6c',
          500: '#bc8650',
          600: '#ae7444',
          700: '#915e3a',
          800: '#754d34',
          900: '#60402d',
        },
        stone: {
          850: '#1c1917',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Lato', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
