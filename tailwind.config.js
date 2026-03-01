/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cute-pink': '#FFB7C5',
        'cute-purple': '#DDA0DD',
        'cute-blue': '#B0E0E6',
      },
    },
  },
  plugins: [],
}
