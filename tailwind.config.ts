import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#202e51',
        secondary: '#425B7D',
        

        btn:{
          primary: '#425B7D',
          hover:'#202e5' 
        }
      },
      fontFamily: {
        sans: ['Avenir Next LT Pro', 'system-ui', 'sans-serif'],
        header: ['DM Serif Display', 'serif']
      },

      borderRadius:{
        lg: '16px',
        md: '12px',
        pill: '999px',
        card: '20px'
      }
    },
  },
  plugins: [
    typography,
  ],
}
export default config
