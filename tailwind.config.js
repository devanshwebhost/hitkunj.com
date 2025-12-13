/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,mdx}",
    "./src/components/**/*.{js,jsx,mdx}",
    "./src/app/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spiritual: {
          light: "#E0F7FA", // Halka Aasmani
          sky: "#4FC3F7",   // Sky blue
          gold: "#FFD54F",  // Sona/Peela
          amber: "#FFB300", // Gehra Peela
          dark: "#01579B",  // Dark blue text
        },
      },
      backgroundImage: {
        'divine-gradient': 'linear-gradient(to bottom right, #E0F7FA, #FFF9C4)',
      }
    },
  },
  plugins: [],
};