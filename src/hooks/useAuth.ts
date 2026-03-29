import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // Clean up the URL hash after successful login
      if (event === 'SIGNED_IN' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname)
      }
    })

    // If we have a hash with access_token, let Supabase handle it
    // Otherwise check for existing session
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      // Supabase will process this via onAuthStateChange above
      // Set a timeout fallback in case it doesn't fire
      const timeout = setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null)
          setLoading(false)
        })
      }, 2000)
      return () => { subscription.unsubscribe(); clearTimeout(timeout) }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signInWithGoogle, signOut }
}
