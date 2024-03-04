import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      'DEFAULT': 'rgb(60, 214, 51)',
      "lightyellow": 'rgb(255,252,118)',
      "yellow": 'rgb(255,255,118)',
      "darkyellow": 'rgb(255,247,0)',
      "white": 'rgb(255,255,255)',
      "black": 'rgb(0,0,0)',
      "black38": 'rgb(30, 31, 33)',
      "black56": 'rgb(66, 67, 66)',
      "black72": 'rgb(118, 121, 118)',
      "black84": 'rgb(194, 196, 196)',
      "black96": 'rgb(259, 251, 247)',
      "grey": 'rgb(252,253,249)',
      "darkgrey": 'rgb(210,210,210)',
      "red": 'rgb(240, 58, 38)',
      "sand": 'rgb(239,236,236)',
      "green": 'rgb(60, 246, 51)',
      "lightblue": 'rgb(228, 241, 251)',
      "blue": 'rgb(106, 176, 254)',
      "darkblue": 'rgb(0, 42, 196)',
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
