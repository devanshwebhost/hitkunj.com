/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spiritual: {
          light: "#E0F7FA", 
          sky: "#4FC3F7",   
          gold: "#FFD54F",  
          amber: "#FFB300", 
          dark: "#01579B",  
        },
      },
      backgroundImage: {
        'divine-gradient': 'linear-gradient(to bottom right, #E0F7FA, #FFF9C4)',
      }
    },
  },
  plugins: [],
};