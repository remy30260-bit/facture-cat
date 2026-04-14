export type NoteFraisCategorie =
  | 'repas'
  | 'transport'
  | 'hebergement'
  | 'fournitures'
  | 'kilometrique'
  | 'telecommunication'
  | 'autre'

export type NoteFraisStatut = 'brouillon' | 'valide' | 'rembourse' | 'refuse'

export interface NoteFrais {
  id: string
  user_id: string
  date_frais: string
  societe: string
  categorie: NoteFraisCategorie
  description?: string
  montant_ht?: number
  montant_tva: number
  montant_ttc: number
  devise: string
  tva_recuperable: boolean
  km?: number
  puissance_fiscale?: number
  fichier_url?: string
  fichier_nom?: string
  statut: NoteFraisStatut
  donnees_gemini?: Record<string, unknown>
  comptabilise: boolean
  created_at: string
  updated_at: string
}

export interface NoteFraisCreate {
  date_frais: string
  societe: string
  categorie: NoteFraisCategorie
  description?: string
  montant_ht?: number
  montant_tva?: number
  montant_ttc: number
  devise?: string
  tva_recuperable?: boolean
  km?: number
  puissance_fiscale?: number
  fichier_url?: string
  fichier_nom?: string
  donnees_gemini?: Record<string, unknown>
}
