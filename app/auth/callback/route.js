import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.session?.user) {
      const user = data.session.user
      const isRecovery = data.redirectType === 'recovery'
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
      if (!profile) {
        await supabase.from('profiles').insert({
          id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          email: user.email || null,
          role: 'customer',
        })
      }
      return NextResponse.redirect(`${origin}${isRecovery ? '/auth/reset-password' : next}`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`)
}
