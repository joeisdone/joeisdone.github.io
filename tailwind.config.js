/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_includes/**/*.{html,js}',
    './_layouts/**/*.{html,js}',
    './_posts/**/*.{html,md}',
    './_pages/**/*.{html,md}',
    './florida/**/*.{html,js}',
    './*.{html,js}',
  ],
  safelist: [
    'md:gap-4',
    // You can also use patterns
    // 'bg-[0-9]+',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 