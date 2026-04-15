/**
 * Intégration Google Gemini 1.5 Flash pour l'analyse OCR de factures
 * Utilise la vision multimodale pour extraire les données structurées
 */
import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import type { AnalyseGemini, DeviseFacture } from '@/types/facture'

if (!process.env.GEMINI_API_KEY) {
  console.warn('[Gemini] GEMINI_API_KEY manquante — les analyses IA seront désactivées')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

// Modèle Flash pour vision (rapide + économique)
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.1,       // Faible pour des extractions factuelles précises
    topP: 0.8,
    maxOutputTokens: 2048,
    responseMimeType: 'application/json',
  },
})

// ─── Prompt système ──────────────────────────────────────────────────────────

const PROMPT_ANALYSE = `Tu es un assistant comptable français expert en analyse de factures.
Analyse cette image de facture/document comptable et extrait toutes les informations dans un JSON structuré.

Réponds UNIQUEMENT avec un JSON valide respectant exactement ce schéma :
{
  "numero_facture": string | null,
  "type_document": "facture" | "avoir" | "devis" | "recu" | "inconnu",
  "nom_emetteur": string | null,
  "siret_emetteur": string | null,
  "tva_emetteur": string | null,
  "adresse_emetteur": string | null,
  "nom_destinataire": string | null,
  "date_emission": string | null,
  "date_echeance": string | null,
  "devise": "EUR" | "USD" | "GBP" | "CHF",
  "montant_ht": number | null,
  "montant_tva": number | null,
  "montant_ttc": number | null,
  "taux_tva": number | null,
  "lignes": [
    {
      "description": string,
      "quantite": number,
      "prix_unitaire_ht": number,
      "montant_ht": number
    }
  ],
  "compte_comptable_suggere": string | null,
  "categorie_suggere": string | null,
  "confiance": number,
  "avertissements": string[]
}

Règles importantes :
- Les dates doivent être au format ISO YYYY-MM-DD
- Les montants sont des nombres (pas de chaîne avec symbole €)
- devise est "EUR" par défaut sauf si explicitement différent
- compte_comptable_suggere : compte PCG français (ex: "606100" pour fournitures, "626000" pour frais postaux)
- confiance : 0 à 100 selon la lisibilité et complétude du document
- avertissements : liste les champs manquants ou ambigus
- Si le document n'est pas une facture, type_document = "inconnu" et confiance = 0`

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

/**
 * Convertit un Buffer ou ArrayBuffer en Part Gemini
 */
function bufferToPart(buffer: Buffer | ArrayBuffer, mimeType: string): Part {
  const base64 = Buffer.from(buffer).toString('base64')
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  }
}

/**
 * Détecte le MIME type à partir de l'extension ou des magic bytes
 */
function detectMimeType(fileName: string, buffer?: Buffer): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
  }
  if (ext && mimeTypes[ext]) return mimeTypes[ext]

  // Détection par magic bytes si buffer fourni
  if (buffer && buffer.length >= 4) {
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg'
    if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png'
    if (buffer[0] === 0x25 && buffer[1] === 0x50) return 'application/pdf'
  }

  return 'image/jpeg' // fallback
}

// ─── Analyse principale ───────────────────────────────────────────────────────

export interface OptionsAnalyse {
  /** Timeout en ms (défaut: 30000) */
  timeout?: number
  /** Relancer l'analyse si confiance < seuil (défaut: 50) */
  seuilConfiance?: number
}

export interface ResultatAnalyse {
  succes: boolean
  analyse: AnalyseGemini | null
  erreur?: string
  duree_ms: number
}

/**
 * Analyse un fichier facture avec Gemini Vision
 * @param fileBuffer - Contenu binaire du fichier
 * @param fileName - Nom du fichier (pour détecter le MIME type)
 * @param options - Options supplémentaires
 */
export async function analyserFacture(
  fileBuffer: Buffer | ArrayBuffer,
  fileName: string,
  options: OptionsAnalyse = {}
): Promise<ResultatAnalyse> {
  const debut = Date.now()
  const { timeout = 30_000, seuilConfiance = 50 } = options

  if (!process.env.GEMINI_API_KEY) {
    return {
      succes: false,
      analyse: null,
      erreur: 'Clé API Gemini non configurée (GEMINI_API_KEY manquante)',
      duree_ms: Date.now() - debut,
    }
  }

  try {
    const mimeType = detectMimeType(fileName, Buffer.from(fileBuffer))
    const filePart = bufferToPart(fileBuffer, mimeType)

    // Appel API avec timeout
    const analysePromise = model.generateContent([
      PROMPT_ANALYSE,
      filePart,
    ])

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout Gemini après ${timeout}ms`)), timeout)
    )

    const result = await Promise.race([analysePromise, timeoutPromise])
    const text = result.response.text()

    // Parser le JSON
    let analyse: AnalyseGemini
    try {
      analyse = JSON.parse(text) as AnalyseGemini
    } catch {
      // Gemini retourne parfois du JSON avec markdown ```json...```
      const match = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
      if (match) {
        analyse = JSON.parse(match[1]) as AnalyseGemini
      } else {
        throw new Error('Réponse Gemini non parseable comme JSON')
      }
    }

    // Validation et nettoyage
    analyse = sanitiserAnalyse(analyse)

    return {
      succes: true,
      analyse,
      duree_ms: Date.now() - debut,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue Gemini'
    console.error('[Gemini] Erreur analyse:', message)
    return {
      succes: false,
      analyse: null,
      erreur: message,
      duree_ms: Date.now() - debut,
    }
  }
}

/**
 * Analyse une URL publique (ex: fichier Supabase Storage)
 */
export async function analyserFactureUrl(
  url: string,
  options: OptionsAnalyse = {}
): Promise<ResultatAnalyse> {
  const debut = Date.now()

  if (!process.env.GEMINI_API_KEY) {
    return {
      succes: false,
      analyse: null,
      erreur: 'Clé API Gemini non configurée',
      duree_ms: Date.now() - debut,
    }
  }

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Erreur téléchargement fichier: ${response.status}`)
    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') ?? 'image/jpeg'
    const fileName = url.split('/').pop() ?? 'facture.jpg'
    const mimeType = contentType.split(';')[0] ?? detectMimeType(fileName)

    const filePart = bufferToPart(buffer, mimeType)
    const analysePromise = model.generateContent([PROMPT_ANALYSE, filePart])
    const result = await analysePromise
    const text = result.response.text()

    let analyse: AnalyseGemini
    try {
      analyse = JSON.parse(text) as AnalyseGemini
    } catch {
      const match = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
      if (match) analyse = JSON.parse(match[1]) as AnalyseGemini
      else throw new Error('Réponse Gemini non parseable')
    }

    return { succes: true, analyse: sanitiserAnalyse(analyse), duree_ms: Date.now() - debut }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return { succes: false, analyse: null, erreur: message, duree_ms: Date.now() - debut }
  }
}

// ─── Nettoyage / validation du résultat ──────────────────────────────────────

const DEVISES_VALIDES: DeviseFacture[] = ['EUR', 'USD', 'GBP', 'CHF']
const TYPES_VALIDES = ['facture', 'avoir', 'devis', 'recu', 'inconnu'] as const

function sanitiserAnalyse(raw: Partial<AnalyseGemini>): AnalyseGemini {
  return {
    numero_facture: raw.numero_facture ?? null,
    type_document: TYPES_VALIDES.includes(raw.type_document as typeof TYPES_VALIDES[number])
      ? (raw.type_document as AnalyseGemini['type_document'])
      : 'inconnu',
    nom_emetteur: raw.nom_emetteur ?? null,
    siret_emetteur: raw.siret_emetteur ?? null,
    tva_emetteur: raw.tva_emetteur ?? null,
    adresse_emetteur: raw.adresse_emetteur ?? null,
    nom_destinataire: raw.nom_destinataire ?? null,
    date_emission: normaliserDate(raw.date_emission),
    date_echeance: normaliserDate(raw.date_echeance),
    devise: DEVISES_VALIDES.includes(raw.devise as DeviseFacture)
      ? (raw.devise as DeviseFacture)
      : 'EUR',
    montant_ht: normaliserMontant(raw.montant_ht),
    montant_tva: normaliserMontant(raw.montant_tva),
    montant_ttc: normaliserMontant(raw.montant_ttc),
    taux_tva: normaliserMontant(raw.taux_tva),
    lignes: Array.isArray(raw.lignes) ? raw.lignes : [],
    compte_comptable_suggere: raw.compte_comptable_suggere ?? null,
    categorie_suggere: raw.categorie_suggere ?? null,
    confiance: typeof raw.confiance === 'number'
      ? Math.min(100, Math.max(0, raw.confiance))
      : 0,
    avertissements: Array.isArray(raw.avertissements) ? raw.avertissements : [],
  }
}

function normaliserDate(val: string | null | undefined): string | null {
  if (!val) return null
  // Accepte YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
  const isoMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) return val
  const frMatch = val.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/)
  if (frMatch) return `${frMatch[3]}-${frMatch[2]}-${frMatch[1]}`
  return null
}

function normaliserMontant(val: number | string | null | undefined): number | null {
  if (val === null || val === undefined) return null
  const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val
  return isNaN(num) ? null : Math.round(num * 100) / 100
}
