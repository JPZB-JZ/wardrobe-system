import { create } from 'zustand'

export type Theme = 'soft' | 'minimal'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const THEME_KEY = 'aura_theme'

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem(THEME_KEY) as Theme) || 'soft',
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.setAttribute('data-theme', theme)
    set({ theme })
  },
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'soft' ? 'minimal' : 'soft'
      localStorage.setItem(THEME_KEY, newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
      return { theme: newTheme }
    })
  },
}))

// 初始化主题
export function initTheme() {
  const theme = (localStorage.getItem(THEME_KEY) as Theme) || 'soft'
  document.documentElement.setAttribute('data-theme', theme)
}
