/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
        background: '#F9FAFB',
        card: '#FFFFFF',
        'hover-bg': '#F3F4F6',
        'subtle-divider': '#E5E7EB',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
        risk: {
          critical: {
            text: '#DC2626',
            bg: '#FEF2F2',
            border: '#FECACA',
          },
          medium: {
            text: '#F59E0B',
            bg: '#FFFBEB',
            border: '#FCD34D',
          },
          low: {
            text: '#10B981',
            bg: '#F0FDF4',
            border: '#6EE7B7',
          },
        },
        chart: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          pink: '#EC4899',
          green: '#10B981',
          orange: '#F59E0B',
        },
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
      },
      borderRadius: {
        '6': '6px',
        '8': '8px',
        '12': '12px',
      },
      fontSize: {
        '32': '32px',
        '24': '24px',
        '18': '18px',
        '16': '16px',
        '14': '14px',
        '13': '13px',
        '12': '12px',
      },
      boxShadow: {
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
