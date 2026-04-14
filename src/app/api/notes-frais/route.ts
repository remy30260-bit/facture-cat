import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const mois = searchParams.get('mois')
  const annee = searchParams.get('annee')

  let query = supabase
    .from('notes_frais')
    .select('*')
    .eq('user_id', user.id)
    .order('date_frais', { ascending: false })

  if (mois && annee) {
    const debut = `${annee}-${mois.padStart(2, '0')}-01`
    const fin = new Date(parseInt(annee), parseInt(mois), 0).toISOString().split('T')[0]
    query = query.gte('date_frais', debut).lte('date_frais', fin)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('notes_frais')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
