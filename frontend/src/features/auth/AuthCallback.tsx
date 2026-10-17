import { useEffect, useRef, useState } from 'react'
import { completeSignIn } from './actions'

export default function AuthCallback() {
  const started = useRef(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (started.current) return
    started.current = true
    const params = new URLSearchParams(window.location.search)
    const authError = params.get('error_description') || params.get('error')
    const code = params.get('code')

    if (authError) {
      setError(authError)
      return
    }
    if (!code) {
      setError('This sign-in link is incomplete. Please try again.')
      return
    }

    void completeSignIn(code).then(() => {
      window.location.replace('/library')
    }).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'Sign-in could not finish.')
    })
  }, [])

  if (error) {
    return <>
      <h1>Sign-in did not finish.</h1>
      <p className="auth-error" role="alert">{error}</p>
      <a href="/auth">Try Google sign-in again</a>
    </>
  }

  return <>
    <h1>Finishing sign-in…</h1>
    <p>Wave is checking your Google sign-in.</p>
  </>
}
