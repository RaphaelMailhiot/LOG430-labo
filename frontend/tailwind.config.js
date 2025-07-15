/** @type {import('tailwindcss').Config} */
import flowbite from 'flowbite/plugin';

export default {
  content: [
    './src/**/*.{html,js,ts,ejs}',
    './node_modules/flowbite/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        }
      }
    },
  },
  plugins: [
    flowbite
  ],
  safelist: [
    'bg-blue-500',
    'hover:bg-blue-700',
    'text-white',
    'font-bold',
    'py-2',
    'px-4',
    'rounded',
    'focus:outline-none',
    'focus:shadow-outline',
    'bg-primary-700',
    'hover:bg-primary-800',
    'focus:ring-primary-300',
    'dark:bg-primary-600',
    'dark:hover:bg-primary-700',
    'dark:focus:ring-primary-800'
  ],
};