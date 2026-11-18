import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f8f8f8',
        surface: '#ffffff',
        'surface-variant': '#f0f0f0',
        'text-primary': '#1a1a1a',
        'text-secondary': '#4a4a4a',
        'text-muted': '#7a7a7a',
        outline: '#dcdcdc',
        'outline-subtle': '#eeeeee',
        'action-yellow': '#ffde58',
        'action-on': '#1a1a1a',
        success: '#2e7d32',
        error: '#c62828',
        warning: '#f57f17',
      },
    },
  },
  plugins: [],
}

export default config
