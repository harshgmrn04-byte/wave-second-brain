import { authConfigured } from '../../auth/client'
import { useAuthSession } from '../../auth/useAuthSession'
import WaveMark from '../../../shared/brand/WaveMark'
import ThemeIcon from '../../../shared/theme/ThemeIcon'
import { useTheme } from '../../../shared/theme/useTheme'

export default function SiteHeader() {
  const { theme, toggleTheme } = useTheme()
  const { session } = useAuthSession()

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Wave home">
        <span className="brand-mark" aria-hidden="true"><WaveMark /></span>
        Wave<span className="brand-dot">.</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#journey">How it works</a>
        <button
          type="button"
          className="theme-toggle"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-pressed={theme === 'dark'}
          onClick={(event) => toggleTheme(event.currentTarget)}
        >
          <ThemeIcon theme={theme} />
        </button>
        <a href="#preview">
          <span className="nav-label">Explore the preview</span>
          <span className="nav-short">Preview</span> <span aria-hidden="true">↗</span>
        </a>
        {authConfigured && (
          <a className="account-link" href={session ? '/library' : '/auth'}>
            {session ? 'My library' : 'Get started'}
          </a>
        )}
      </nav>
    </header>
  )
}
