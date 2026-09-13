/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        canvas: '#FFFFFF',       // Clean white canvas (Coinbase style)
        surface: {
          soft: '#F7F8FA',       // Soft elevation band
          strong: '#EEF0F3',     // Secondary button & input plate fill
          dark: '#0A0B0D',       // Editorial deep dark hero background
          elevated: '#16181C',   // Dark mode card elevation
        },
        saas: {
          primary: '#14B8A6',        // Toska utama (SIPANDU Brand)
          'primary-active': '#0D9488', // Darker Toska press state
          'primary-light': '#CCFBF1',  // Soft Toska fill/badge
          dark: '#0A0B0D',           // Coinbase Ink text
          muted: '#5B616E',          // Coinbase body text color
          'muted-soft': '#9CA3AF',     // Subdued text
          lightBg: '#FFFFFF',        // Card background
        },
        hairline: {
          DEFAULT: '#DEE1E6',
          soft: '#EEF0F3',
        },
        trend: {
          successBg: '#ECFDF5',
          successText: '#05B169',    // Coinbase semantic up
          dangerBg: '#FEF2F2',
          dangerText: '#CF202F',     // Coinbase semantic down
          warningBg: '#FFFBEB',
          warningText: '#F59E0B',
        }
      },
      borderRadius: {
        'card': '12px',          // Match /puskesmas rounded-xl card radius
        'input': '12px',
        'pill': '100px',         // Coinbase signature CTA pill
      },
      boxShadow: {
        'soft-card': '0 4px 12px rgba(11, 15, 25, 0.04)',
        'elevated': '0 12px 32px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
