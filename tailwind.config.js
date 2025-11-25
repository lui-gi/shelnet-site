/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#1b1b1d',
          grid: '#212124',
          ink: '#e8e8ea',
          muted: '#a7a7ad',
          accent: '#ffffff',
          card: '#202024',
          border: '#2a2a2f',
          success: '#b6f39b',
          navy: '#0b3a6f',
          navyDim: '#0a2d56',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}

