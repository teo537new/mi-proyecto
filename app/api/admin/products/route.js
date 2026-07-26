import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function checkAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export async function PUT(request) {
  const supabase = await createClient()

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id, active } = await request.json()

  const { error } = await supabase
    .from('products')
    .update({ active })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  const supabase = await createClient()

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Falta id' }, { status: 400 })
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
