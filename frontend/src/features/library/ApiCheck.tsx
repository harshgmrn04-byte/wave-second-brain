import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'

const apiUrl = import.meta.env.VITE_WAVE_API_URL

export default function ApiCheck({ session }: { session: Session }) {
  const [result, setResult] = useState('')
  if (!apiUrl) return null

  const check = async () => {
    setResult('Checking…')
    try {
      const response = await fetch(`${apiUrl}/auth/check`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data: { user_id?: string; detail?: string } = await response.json()
      if (!response.ok) throw new Error(data.detail || 'The API could not verify this session.')
      if (data.user_id !== session.user.id) throw new Error('The API returned a different user ID.')
      setResult('FastAPI verified this Google session.')
    } catch (cause) {
      setResult(cause instanceof Error ? cause.message : 'Could not reach the API.')
    }
  }

  return <>
    <button className="auth-action" type="button" onClick={check}>Check local API sign-in</button>
    {result && <p role="status">{result}</p>}
  </>
}
