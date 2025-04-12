/** @type {import('tailwindcss').Config} */

// FOR MAC/LINUX:
// module.exports = {
//   content: ['./src/**/*.{js,jsx,ts,tsx}'],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };

// FOR WINDOWS:
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};


// Colors for the theme:
// Even Lighter Blue: #74c1f2 // Used mainly for highlighting stuff on hover
// Light Blue: #419cd6 | rgb(65, 156, 214) // Used for buttons
// Dark Blue: #1c4c71 | rgb(28, 76, 113) // Used for navbar and buttons
// Red: #c23232| rgb(194, 50, 50) // Used for accent color, along with delete buttons