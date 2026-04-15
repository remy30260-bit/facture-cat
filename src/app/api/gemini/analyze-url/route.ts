/**
 * POST /api/gemini/analyze-url
 * Analyse une facture déjà uploadée dans Supabase Storage
 * Body: { url: string, facture_id?: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { analyserFactureUrl } from '@/lib/gemini'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { url, facture_id } = body as { url: string; facture_id?: string }

    if (!url) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
    }

    const resultat = await analyserFactureUrl(url, { timeout: 45_000 })

    if (!resultat.succes || !resultat.analyse) {
      return NextResponse.json(
        { error: resultat.erreur ?? 'Analyse échouée', duree_ms: resultat.duree_ms },
        { status: 422 }
      )
    }

    // Si facture_id fourni, on met à jour directement en base
    if (facture_id) {
      const { error: dbError } = await supabase
        .from('factures')
        .update({
          analyse_ia: resultat.analyse,
          confiance_ia: resultat.analyse.confiance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', facture_id)
        .eq('user_id', user.id)

      if (dbError) {
        console.warn('[API/gemini/analyze-url] Mise à jour BDD échouée:', dbError.message)
      }
    }

    return NextResponse.json({
      analyse: resultat.analyse,
      duree_ms: resultat.duree_ms,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
