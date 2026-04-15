'use server'

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
})

export interface FactureOCRResult {
  date:                string
  numero_facture:      string
  fournisseur:         string
  adresse_fournisseur: string
  montant_ht:          number
  taux_tva:            number
  montant_tva:         number
  montant_ttc:         number
  devise:              string
  conditions_paiement: string
  description:         string
  type:                'achat' | 'vente'
  tva_details?:        { taux: number; base_ht: number; montant_tva: number }[]
  confidence:          number
}

export interface NoteFraisOCRResult {
  date:        string
  societe:     string
  montant_ttc: number
  montant_ht:  number
  tva:         number
  categorie:   'repas' | 'transport' | 'hebergement' | 'fournitures' | 'kilometrique' | 'telecommunication' | 'autre'
  description: string
  confidence:  number
}

async function fileToGenerativePart(file: File) {
  const buffer     = await file.arrayBuffer()
  const base64Data = Buffer.from(buffer).toString('base64')
  return { inlineData: { data: base64Data, mimeType: file.type } }
}

function cleanJson(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

export async function analyzeFacture(file: File): Promise<FactureOCRResult> {
  const imagePart = await fileToGenerativePart(file)
  const prompt = `Analyse cette facture et retourne UNIQUEMENT un JSON valide (pas de markdown, pas de texte autour) avec exactement ces champs :
{
  "date": "YYYY-MM-DD",
  "numero_facture": "",
  "fournisseur": "",
  "adresse_fournisseur": "",
  "montant_ht": 0.00,
  "taux_tva": 20,
  "montant_tva": 0.00,
  "montant_ttc": 0.00,
  "devise": "EUR",
  "conditions_paiement": "",
  "description": "",
  "type": "achat",
  "tva_details": [],
  "confidence": 0.95
}
Règles :
- type = "achat" si facture reçue, "vente" si émise
- devise = "EUR", "USD" ou "GBP" uniquement
- Si plusieurs taux TVA, remplis tva_details avec [{taux, base_ht, montant_tva}]
- confidence entre 0 et 1
- Tous les montants en nombres décimaux
- Date au format YYYY-MM-DD obligatoire`
  const result  = await model.generateContent([prompt, imagePart])
  const raw     = result.response.text()
  const cleaned = cleanJson(raw)
  try {
    return JSON.parse(cleaned) as FactureOCRResult
  } catch {
    throw new Error(`Gemini OCR — réponse non parseable : ${raw.slice(0, 200)}`)
  }
}

export async function analyzeNoteFrais(file: File): Promise<NoteFraisOCRResult> {
  const imagePart = await fileToGenerativePart(file)
  const prompt = `Analyse ce ticket ou reçu et retourne UNIQUEMENT un JSON valide avec ces champs :
{
  "date": "YYYY-MM-DD",
  "societe": "",
  "montant_ttc": 0.00,
  "montant_ht": 0.00,
  "tva": 0.00,
  "categorie": "autre",
  "description": "",
  "confidence": 0.90
}
categorie parmi : repas, transport, hebergement, fournitures, kilometrique, telecommunication, autre`
  const result  = await model.generateContent([prompt, imagePart])
  const raw     = result.response.text()
  const cleaned = cleanJson(raw)
  try {
    return JSON.parse(cleaned) as NoteFraisOCRResult
  } catch {
    throw new Error(`Gemini OCR NDF — réponse non parseable : ${raw.slice(0, 200)}`)
  }
}

export async function suggestComptesPCG(
  fournisseur: string,
  description: string,
  montant_ttc: number,
  type: 'achat' | 'vente'
): Promise<{ compte_debit: string; compte_credit: string; libelle: string }> {
  const prompt = `Tu es un expert-comptable français. Pour cette opération, donne les imputations comptables :
- Fournisseur/Client : ${fournisseur}
- Description : ${description}
- Montant TTC : ${montant_ttc} €
- Type : ${type}

Retourne UNIQUEMENT ce JSON :
{
  "compte_debit": "601000",
  "compte_credit": "401000",
  "libelle": "Achat marchandises ${fournisseur}"
}
Utilise les numéros PCG 2025 France.`
  const result  = await model.generateContent(prompt)
  const raw     = result.response.text()
  const cleaned = cleanJson(raw)
  try {
    return JSON.parse(cleaned)
  } catch {
    return {
      compte_debit:  type === 'achat' ? '607000' : '411000',
      compte_credit: type === 'achat' ? '401000' : '706000',
      libelle:       `${type === 'achat' ? 'Achat' : 'Vente'} - ${fournisseur}`,
    }
  }
}

export async function convertToEur(montant: number, devise: string): Promise<number> {
  if (devise === 'EUR') return montant
  const prompt = `Quel est le taux de change actuel approximatif ${devise}/EUR ? Retourne UNIQUEMENT un nombre décimal, ex: 0.92`
  try {
    const result = await model.generateContent(prompt)
    const taux   = parseFloat(result.response.text().trim())
    if (isNaN(taux)) throw new Error('Taux invalide')
    return Math.round(montant * taux * 100) / 100
  } catch {
    const fallback: Record<string, number> = { USD: 0.92, GBP: 1.17 }
    return Math.round(montant * (fallback[devise] ?? 1) * 100) / 100
  }
}
