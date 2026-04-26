/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#30D158',
          dim: 'rgba(48, 209, 88, 0.1)',
          border: 'rgba(48, 209, 88, 0.2)',
          dark: '#249C42',
        },
        bg: {
          base: '#0A0A0B',
          elevated: '#121214',
          hover: '#18181A',
        },
        text: {
          primary: '#F2F2F7',
          secondary: '#A1A1AA',
          muted: '#71717A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

