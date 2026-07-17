/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // zinc-950
        surface: '#18181b', // zinc-900
        surfaceHighlight: '#27272a', // zinc-800
        primary: '#8b5cf6', // violet-500
        primaryHover: '#7c3aed', // violet-600
        accent: '#10b981', // emerald-500
        textMain: '#ffffff',
        textMuted: '#a1a1aa', // zinc-400
      }
    },
  },
  plugins: [],
}
