import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sathi brand colors
        sathi: {
          green: '#10b981',
          'green-dark': '#059669',
          'green-light': '#d1fae5',
          orange: '#f97316',
          red: '#ef4444',
          blue: '#3b82f6',
          gray: '#6b7280',
        },
      },
      fontSize: {
        // Elder-friendly sizes
        'elder-sm': ['18px', '28px'],
        'elder-base': ['20px', '30px'],
        'elder-lg': ['24px', '34px'],
        'elder-xl': ['28px', '38px'],
        'elder-2xl': ['32px', '42px'],
        'elder-3xl': ['40px', '50px'],
      },
    },
  },
  plugins: [],
}

export default config
