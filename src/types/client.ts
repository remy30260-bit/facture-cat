export interface Client {
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
  notes: string | null
  created_at: string
  updated_at: string
}

export type ClientInsert = Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type ClientUpdate = Partial<ClientInsert>
