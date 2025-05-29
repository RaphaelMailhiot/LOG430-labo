/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,ejs}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
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
  // Ajoute ici toutes les classes utilisées dynamiquement
],
}

