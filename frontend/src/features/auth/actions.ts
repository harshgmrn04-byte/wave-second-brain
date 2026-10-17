import { supabase } from './client'

function requireAuthClient() {
  if (!supabase) throw new Error('Sign-in is not configured for this build.')
  return supabase
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await requireAuthClient().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) throw error
}

export async function completeSignIn(code: string): Promise<void> {
  const { error } = await requireAuthClient().auth.exchangeCodeForSession(code)
  if (error) throw error
}
