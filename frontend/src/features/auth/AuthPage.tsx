import AuthCallback from './AuthCallback'
import GoogleSignIn from './GoogleSignIn'
import LibraryPage from '../library/LibraryPage'

type AuthRoute = 'sign-in' | 'callback' | 'library'

export default function AuthPage({ route }: { route: AuthRoute }) {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <a href="/" className="auth-brand">Wave<span>.</span></a>
        <a href="/">Back to preview</a>
      </header>
      <main className={route === 'library' ? 'auth-panel library-panel' : 'auth-panel'}>
        {route === 'callback' ? <AuthCallback /> : route === 'library' ? <LibraryPage /> : <GoogleSignIn />}
      </main>
    </div>
  )
}
