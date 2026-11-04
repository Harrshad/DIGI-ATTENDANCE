import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED', // Primary brand purple/indigo
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        sidebar: {
          bg: '#FFFFFF',
          hover: '#F9FAFB',
          active: '#F5F3FF',
          text: '#374151',
          activeText: '#6D28D9',
        },
        surface: {
          bg: '#F9FAFB', // Light gray page background
          card: '#FFFFFF',
          border: '#E5E7EB',
          subtle: '#F3F4F6',
        },
        status: {
          present: {
            bg: '#ECFDF5',
            text: '#065F46',
            dot: '#10B981',
          },
          late: {
            bg: '#FEF3C7',
            text: '#92400E',
            dot: '#F59E0B',
          },
          absent: {
            bg: '#FEE2E2',
            text: '#991B1B',
            dot: '#EF4444',
          },
          rejected: {
            bg: '#FEE2E2',
            text: '#B91C1C',
            dot: '#DC2626',
          },
          flagged: {
            bg: '#FFFBEB',
            text: '#B45309',
            dot: '#D97706',
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
