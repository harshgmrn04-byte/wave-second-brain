import { useState } from 'react'
import { signInWithGoogle } from './actions'
import { authConfigured } from './client'

export default function GoogleSignIn() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const startSignIn = async () => {
    setBusy(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open Google sign-in.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1>Make room for what matters.</h1>
      <p>Continue with Google to open your private Wave library. Your first sign-in creates your account.</p>
      {authConfigured ? (
        <button className="auth-action" type="button" disabled={busy} onClick={startSignIn}>
          {busy ? 'Opening Google…' : 'Continue with Google'}
        </button>
      ) : (
        <p role="alert">Sign-in is not configured for this build.</p>
      )}
      {error && <p className="auth-error" role="alert">{error}</p>}
    </>
  )
}
