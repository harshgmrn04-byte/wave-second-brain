import { useAuthSession } from '../auth/useAuthSession'
import NotesSection from './NotesSection'

export default function LibraryPage() {
  const { session, ready, error } = useAuthSession()

  if (!ready) return <><h1>Opening your library…</h1><p>Checking your session.</p></>
  if (error) return <>
    <h1>Library unavailable.</h1>
    <p className="auth-error" role="alert">{error}</p>
    <a href="/auth">Return to sign-in</a>
  </>
  if (!session) return <>
    <h1>Sign in to continue.</h1>
    <p>Your private library needs a Google sign-in.</p>
    <a className="auth-action" href="/auth">Continue with Google</a>
  </>

  return <>
    <h1>Welcome to your library.</h1>
    <p>Signed in as <strong>{session.user.email || 'your Google account'}</strong>.</p>
    <p>Save plain-text notes privately in your library.</p>
    <NotesSection session={session} />
  </>
}
