/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    "bg-blue-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-gray-500",
    "rounded-sm",
    "rounded-md",
    "rounded-full",
  ],
};