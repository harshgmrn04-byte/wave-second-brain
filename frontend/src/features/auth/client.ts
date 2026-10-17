import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// The public preview can run without private-library configuration.
export const authConfigured = Boolean(url && publishableKey)

export const supabase = authConfigured
  ? createClient(url, publishableKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
      },
    })
  : null
