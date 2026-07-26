'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const AuthContext = createContext({ user: null, profile: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const ensureProfile = async (user) => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()
    if (!existing) {
      await supabase.from('profiles').insert({
        id: user.id,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
        email: user.email || null,
        role: 'customer',
      })
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await ensureProfile(session.user)
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          if (event === 'SIGNED_IN') {
            await ensureProfile(session.user)
          }
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(data)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
