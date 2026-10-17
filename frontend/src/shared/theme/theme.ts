export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'wave-theme'

export function initialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyInitialTheme(): void {
  document.documentElement.dataset.theme = initialTheme()
}

export function saveTheme(theme: Theme): void {
  window.localStorage.setItem(STORAGE_KEY, theme)
}

export function hasSavedTheme(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) !== null
}
