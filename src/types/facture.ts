export type StatutFacture =
  | 'brouillon'
  | 'en_attente'
  | 'validee'
  | 'payee'
  | 'annulee'
  | 'avoir'

export type TypeFacture = 'client' | 'fournisseur'

export type DeviseFacture = 'EUR' | 'USD' | 'GBP' | 'CHF'

export interface LigneFacture {
  id?: string
  description: string
  quantite: number
  prix_unitaire_ht: number
  taux_tva: number
  montant_ht: number
  montant_tva: number
  montant_ttc: number
}

export interface Facture {
  id: string
  user_id: string

  // Identification
  numero: string
  type: TypeFacture
  statut: StatutFacture

  // Dates
  date_emission: string
  date_echeance: string | null
  date_paiement: string | null

  // Tiers
  client_id: string | null
  fournisseur_id: string | null
  nom_tiers: string
  email_tiers: string | null
  adresse_tiers: string | null

  // Montants
  devise: DeviseFacture
  taux_change: number
  montant_ht: number
  montant_tva: number
  montant_ttc: number
  montant_ttc_eur: number

  // Détails lignes (JSON)
  lignes: LigneFacture[]

  // Fichier
  fichier_url: string | null
  fichier_nom: string | null

  // Gemini OCR
  analyse_ia: AnalyseGemini | null
  confiance_ia: number | null // 0-100

  // Comptabilité
  compte_comptable: string | null
  journal: string | null

  // Métadonnées
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export type FactureInsert = Omit<Facture, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type FactureUpdate = Partial<FactureInsert>

// Résultat d'analyse Gemini
export interface AnalyseGemini {
  // Identification
  numero_facture: string | null
  type_document: 'facture' | 'avoir' | 'devis' | 'recu' | 'inconnu'

  // Tiers
  nom_emetteur: string | null
  siret_emetteur: string | null
  tva_emetteur: string | null
  adresse_emetteur: string | null
  nom_destinataire: string | null

  // Dates
  date_emission: string | null  // format ISO YYYY-MM-DD
  date_echeance: string | null

  // Montants
  devise: DeviseFacture
  montant_ht: number | null
  montant_tva: number | null
  montant_ttc: number | null
  taux_tva: number | null

  // Lignes détectées
  lignes: {
    description: string
    quantite: number
    prix_unitaire_ht: number
    montant_ht: number
  }[]

  // Comptabilité suggérée
  compte_comptable_suggere: string | null
  categorie_suggere: string | null

  // Confiance globale (0-100)
  confiance: number
  avertissements: string[]
}
