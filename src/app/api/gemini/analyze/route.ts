/**
 * POST /api/gemini/analyze
 * Reçoit un fichier (multipart/form-data) et retourne l'analyse Gemini
 */
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { analyserFacture } from '@/lib/gemini'

export const maxDuration = 60 // secondes (Vercel)
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Auth
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validation taille (max 10 MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max 10 MB, reçu ${(file.size / 1024 / 1024).toFixed(1)} MB)` },
        { status: 400 }
      )
    }

    // Validation type MIME
    const TYPES_ACCEPTES = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'image/heic', 'image/heif', 'application/pdf'
    ]
    if (!TYPES_ACCEPTES.includes(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier non supporté: ${file.type}. Acceptés: JPG, PNG, WebP, PDF` },
        { status: 400 }
      )
    }

    // Conversion en Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Analyse Gemini
    const resultat = await analyserFacture(buffer, file.name, {
      timeout: 45_000,
      seuilConfiance: 30,
    })

    if (!resultat.succes || !resultat.analyse) {
      return NextResponse.json(
        {
          error: resultat.erreur ?? 'Analyse échouée',
          duree_ms: resultat.duree_ms,
        },
        { status: 422 }
      )
    }

    return NextResponse.json({
      analyse: resultat.analyse,
      duree_ms: resultat.duree_ms,
      fichier: {
        nom: file.name,
        taille: file.size,
        type: file.type,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    console.error('[API/gemini/analyze]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
