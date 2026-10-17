import { useEffect, useLayoutEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { hasSavedTheme, initialTheme, saveTheme, type Theme } from './theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: dark)')
    const syncPreference = (event: MediaQueryListEvent) => {
      if (!hasSavedTheme()) setTheme(event.matches ? 'dark' : 'light')
    }
    preference.addEventListener('change', syncPreference)
    return () => preference.removeEventListener('change', syncPreference)
  }, [])

  const toggleTheme = (button: HTMLButtonElement) => {
    const next = theme === 'light' ? 'dark' : 'light'
    saveTheme(next)
    const transitionDocument = document as Document & {
      startViewTransition?: (update: () => void) => { ready: Promise<void> }
    }
    if (!transitionDocument.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTheme(next)
      return
    }

    const bounds = button.getBoundingClientRect()
    const x = bounds.left + bounds.width / 2
    const y = bounds.top + bounds.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.documentElement.style.setProperty('--reveal-x', `${x}px`)
    document.documentElement.style.setProperty('--reveal-y', `${y}px`)
    document.documentElement.style.setProperty('--reveal-radius', `${radius}px`)
    transitionDocument.startViewTransition(() => flushSync(() => setTheme(next)))
  }

  return { theme, toggleTheme }
}
