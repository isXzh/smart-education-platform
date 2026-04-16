/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#030213',
        'primary-foreground': '#ffffff',
        secondary: '#e0e7ff',
        'secondary-foreground': '#030213',
        muted: '#ececf0',
        'muted-foreground': '#717182',
        accent: '#e9ebef',
        'accent-foregroundforeground': '#030213',
        destructive: '#d4183d',
        'destructive-foreground': '#ffffff',
        border: 'rgba(0, 0, 0, 0.1)',
        input: 'transparent',
        'input-background': '#f3f3f5',
        ring: '#94a3b8',
        // 蓝色主题色系（从React原型提取）
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        }
      },
      borderRadius: {
        DEFAULT: '0.625rem',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      boxShadow: {
        'card': '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
