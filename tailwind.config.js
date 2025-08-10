/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          green: '#00a884',
          'green-dark': '#008069',
          'light-green': '#d9fdd3',
          dark: '#128C7E',
          gray: '#F0F2F5',
          darkgray: '#667781',
          chatbg: '#EFEAE2',
          header: '#F0F2F5',
          sidebar: '#FFFFFF',
          message: {
            sent: '#DCF8C6',
            received: '#FFFFFF',
          },
          // Dark theme colors (real WhatsApp Web)
          bg: '#111b21',
          'sidebar-dark': '#202c33',
          'chat-dark': '#0b141a',
          'input-dark': '#2a3942',
          'text-primary': '#e9edef',
          'text-secondary': '#8696a0',
          'border-dark': '#313d45',
          'hover-dark': '#2a3942',
          'bubble-out': '#005c4b',
          'bubble-in': '#202c33',
          'selected': '#2a3942',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
