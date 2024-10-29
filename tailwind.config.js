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
    'size-2',
    'size-3',
    'size-4',
    'size-5',
    'size-6',
    // You can also use patterns
    // 'bg-[0-9]+',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 