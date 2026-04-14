export interface Fournisseur {
  id: string
  user_id: string
  nom: string
  email: string | null
  telephone: string | null
  adresse: string | null
  code_postal: string | null
  ville: string | null
  pays: string
  siret: string | null
  numero_tva: string | null
  compte_pcg: string | null
  devise_defaut: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type FournisseurInsert = Omit<Fournisseur, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type FournisseurUpdate = Partial<FournisseurInsert>
