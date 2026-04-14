import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { ids, mois, annee } = await req.json()

  let query = supabase.from('notes_frais').select('*').eq('user_id', user.id)
  if (ids?.length) {
    query = query.in('id', ids)
  } else if (mois && annee) {
    const debut = `${annee}-${String(mois).padStart(2, '0')}-01`
    const fin = new Date(annee, mois, 0).toISOString().split('T')[0]
    query = query.gte('date_frais', debut).lte('date_frais', fin)
  }

  const { data: notes, error } = await query.order('date_frais')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Retourne les données pour génération côté client avec jsPDF
  const total = notes?.reduce((acc, n) => acc + Number(n.montant_ttc), 0) || 0
  return NextResponse.json({ notes, total })
}
