/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 使用 CSS 变量，支持主题切换
        pri: { 
          DEFAULT: 'var(--color-pri, #c46d9c)', 
          light: 'var(--color-pri-light, #fdf0f5)', 
          dim: 'var(--color-pri-dim, #f4d4e4)' 
        },
        sec: { 
          DEFAULT: 'var(--color-sec, #8c7a3a)', 
          light: 'var(--color-sec-light, #ffe170)', 
          dim: 'var(--color-sec-dim, #e8d588)' 
        },
        ter: { 
          DEFAULT: 'var(--color-ter, #8e6dbf)', 
          light: 'var(--color-ter-light, #f5f0fa)', 
          dim: 'var(--color-ter-dim, #e4d8f2)' 
        },
        surface: { 
          DEFAULT: 'var(--color-surface, #faf9fb)', 
          card: 'var(--color-surface-card, #eeedef)', 
          high: 'var(--color-surface-high, #e8e8ea)' 
        },
        text: { 
          DEFAULT: 'var(--color-text, #1a1c1d)', 
          secondary: 'var(--color-text-secondary, #6b5860)', 
          muted: 'var(--color-text-muted, #a08e96)' 
        }
      },
      borderRadius: {
        'sm': '8px', 'md': '16px', 'lg': '24px', 'xl': '32px', 'full': '999px'
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
}
