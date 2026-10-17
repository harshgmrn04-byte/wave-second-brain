import LandingPage from './features/landing/LandingPage'
import AuthPage from './features/auth/AuthPage'

export default function App() {
  const path = typeof window === 'undefined' ? '/' : window.location.pathname
  const route = path === '/auth/callback' ? 'callback' : path === '/library' ? 'library' : path === '/auth' ? 'sign-in' : null
  return route ? <AuthPage route={route} /> : <LandingPage />
}
