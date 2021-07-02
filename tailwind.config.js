module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '8rem',
        xl: '10rem',
        '2xl': '6rem',
      },
    },
    backgroundColor: theme => ({
      'dark': '#132c44',
      'light': '#275a8c',
      'lighter': '#73a7d8'
    }),
    borderColor: theme => ({
      'dark': '#132c44',
      'light': '#275a8c',
      'lighter': '#73a7d8'
    }),
    backgroundImage: theme => ({
      'image-left': "url('/src/images/image-left.png')",
      'image-right': "url('/src/images/image-right.png')",
     }),
    colors: {
      'dark': '#132c44',
      'light': '#275a8c',
      'lighter': '#73a7d8'
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
