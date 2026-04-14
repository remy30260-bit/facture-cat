import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  // Nomenclature automatique : SOCIÉTÉ MOIS JOUR
  const now = new Date()
  const mois = String(now.getMonth() + 1).padStart(2, '0')
  const jour = String(now.getDate()).padStart(2, '0')
  const ext = file.name.split('.').pop()
  const tempNom = `NF_${mois}_${jour}.${ext}`
  const storagePath = `notes-frais/${user.id}/${Date.now()}_${tempNom}`

  // Upload vers Supabase Storage
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, buffer, { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storagePath)

  // OCR via Gemini
  let donnees_gemini = null
  let fichier_nom = tempNom
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const base64 = buffer.toString('base64')
    const prompt = `Analyse ce ticket/reçu et retourne UNIQUEMENT un JSON valide sans markdown avec ces champs:
{
  "date": "YYYY-MM-DD",
  "societe": "NOM_SOCIETE_MAJUSCULES",
  "montant_ttc": 0.00,
  "montant_ht": 0.00,
  "tva": 0.00,
  "categorie": "repas|transport|hebergement|fournitures|telecommunication|autre",
  "description": ""
}`
    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType: file.type } },
      prompt
    ])
    const text = result.response.text().replace(/```json|```/g, '').trim()
    donnees_gemini = JSON.parse(text)

    // Nomenclature avec le nom de la société
    if (donnees_gemini?.societe) {
      fichier_nom = `${donnees_gemini.societe} ${mois} ${jour}.${ext}`
    }
  } catch (e) {
    console.error('Erreur Gemini OCR:', e)
  }

  return NextResponse.json({
    fichier_url: publicUrl,
    fichier_nom,
    donnees_gemini
  })
}
