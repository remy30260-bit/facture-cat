export type TypeJournal = 'ACH' | 'VTE' | 'BNQ' | 'OD' | 'NF'

export interface EcritureComptable {
  id: string
  user_id: string

  // Journal
  journal: TypeJournal
  date_ecriture: string
  numero_piece: string
  libelle: string

  // Compte (Plan Comptable Général 2025)
  compte_debit: string
  compte_credit: string
  montant: number

  // Lien vers une pièce
  facture_id: string | null
  note_frais_id: string | null

  // Statut
  lettre: string | null  // lettrage comptable
  valide: boolean

  created_at: string
  updated_at: string
}

export type EcritureInsert = Omit<EcritureComptable, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type EcritureUpdate = Partial<EcritureInsert>
