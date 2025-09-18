/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'ui-sans-serif', 'Segoe UI', 'Inter', 'Roboto', 'Arial', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'ui-sans-serif', 'Segoe UI', 'Inter', 'Roboto', 'Arial', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#b9dbff',
          300: '#8cc4ff',
          400: '#58a5ff',
          500: '#2f83f7',
          600: '#2167d1',
          700: '#1b53a8',
          800: '#1a4688',
          900: '#193c71'
        },
        success: { 
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#14532d'
        },
        warning: { 
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        },
        danger: { 
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        }
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.1)',
        'card-dark': '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
        popover: '0 4px 12px rgba(16,24,40,0.14)',
        'popover-dark': '0 4px 12px rgba(0,0,0,0.4)'
      }
    },
  },
  plugins: [],
}
