import type { Config } from 'tailwindcss'

function rgb(token: string) {
  return `rgb(var(${token}) / <alpha-value>)`
}

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: rgb('--canvas'),
        surface: rgb('--surface'),
        'surface-variant': rgb('--surface-variant'),
        'text-primary': rgb('--text-primary'),
        'text-secondary': rgb('--text-secondary'),
        'text-muted': rgb('--text-muted'),
        outline: rgb('--outline'),
        'outline-subtle': rgb('--outline-subtle'),
        'action-yellow': rgb('--action-yellow'),
        'action-on': rgb('--action-on'),
        success: rgb('--success'),
        error: rgb('--error'),
        warning: rgb('--warning'),
      },
    },
  },
  plugins: [],
}

export default config
