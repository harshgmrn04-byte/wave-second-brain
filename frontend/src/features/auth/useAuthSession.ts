import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { signOut as signOutFromSupabase } from './actions'
import { supabase } from './client'

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!supabase)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let active = true
    let receivedAuthEvent = false

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      receivedAuthEvent = true
      setSession(nextSession)
      setReady(true)
    })

    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError(sessionError.message)
      if (!receivedAuthEvent) setSession(data.session)
      setReady(true)
    }).catch((cause: unknown) => {
      if (!active) return
      setError(cause instanceof Error ? cause.message : 'Could not check your session.')
      setReady(true)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    setError('')
    try {
      await signOutFromSupabase()
      setSession(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign out.')
    }
  }

  return { session, ready, error, signOut }
}
