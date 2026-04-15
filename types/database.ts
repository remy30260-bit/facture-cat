// types/database.ts
// Types TypeScript générés depuis le schéma Supabase de Facture Cat

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      factures: {
        Row: {
          id:                  string
          user_id:             string
          fournisseur_id:      string | null
          numero_facture:      string | null
          date_facture:        string
          type:                'achat' | 'vente'
          montant_ht:          number | null
          montant_tva:         number | null
          montant_ttc:         number | null
          devise:              string
          taux_change:         number
          montant_ttc_eur:     number | null
          conditions_paiement: string | null
          description:         string | null
          fichier_url:         string
          fichier_type:        string | null
          donnees_gemini:      Json | null
          statut:              'brouillon' | 'valide' | 'comptabilise'
          created_at:          string
          updated_at:          string
        }
        Insert: Omit<Database['public']['Tables']['factures']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['factures']['Insert']>
      }
      fournisseurs: {
        Row: {
          id:            string
          user_id:       string
          nom:           string
          adresse:       string | null
          siret:         string | null
          numero_tva:    string | null
          compte_pcg:    string | null
          email:         string | null
          telephone:     string | null
          devise_defaut: string
          created_at:    string
          updated_at:    string
        }
        Insert: Omit<Database['public']['Tables']['fournisseurs']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['fournisseurs']['Insert']>
      }
      notes_frais: {
        Row: {
          id:               string
          user_id:          string
          date_frais:       string
          societe:          string
          categorie:        'repas' | 'transport' | 'hebergement' | 'fournitures' | 'kilometrique' | 'telecommunication' | 'autre'
          description:      string | null
          montant_ht:       number | null
          montant_tva:      number | null
          montant_ttc:      number | null
          tva_recuperable:  boolean
          km:               number | null
          puissance_fiscale: number | null
          fichier_url:      string | null
          fichier_nom:      string | null
          donnees_gemini:   Json | null
          statut:           'brouillon' | 'valide'
          comptabilise:     boolean
          created_at:       string
        }
        Insert: Omit<Database['public']['Tables']['notes_frais']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['notes_frais']['Insert']>
      }
      ecritures_comptables: {
        Row: {
          id:            string
          user_id:       string
          journal:       'HA' | 'VE' | 'BQ' | 'OD' | 'AN'
          date_ecriture: string
          numero_piece:  string | null
          facture_id:    string | null
          libelle:       string
          compte_numero: string
          debit:         number
          credit:        number
          lettrage:      string | null
          date_lettrage: string | null
          exercice_id:   string | null
          statut:        'brouillon' | 'valide'
          created_at:    string
        }
        Insert: Omit<Database['public']['Tables']['ecritures_comptables']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['ecritures_comptables']['Insert']>
      }
      immobilisations: {
        Row: {
          id:                   string
          user_id:              string
          libelle:              string
          date_acquisition:     string
          date_mise_service:    string | null
          valeur_acquisition:   number
          duree_amortissement:  number
          mode_amortissement:   'lineaire' | 'degressif' | 'adefinir'
          compte_immo:          string | null
          compte_amort:         string | null
          compte_dotation:      string | null
          valeur_residuelle:    number
          cede:                 boolean
          date_cession:         string | null
          prix_cession:         number | null
          created_at:           string
        }
        Insert: Omit<Database['public']['Tables']['immobilisations']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['immobilisations']['Insert']>
      }
      company_profile: {
        Row: {
          id:          string
          user_id:     string
          nom_societe: string | null
          siret:       string | null
          adresse:     string | null
          logo_url:    string | null
          created_at:  string
          updated_at:  string
        }
        Insert: Omit<Database['public']['Tables']['company_profile']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['company_profile']['Insert']>
      }
      plan_comptable: {
        Row: {
          id:            string
          numero:        string
          libelle:       string
          classe:        string | null
          type:          string | null
          parent_numero: string | null
          is_active:     boolean
          created_at:    string
        }
        Insert: Omit<Database['public']['Tables']['plan_comptable']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['plan_comptable']['Insert']>
      }
      declarations_tva: {
        Row: {
          id:                      string
          user_id:                 string
          type:                    'CA3' | 'CA12'
          periode_debut:           string
          periode_fin:             string
          tva_collectee:           number
          tva_deductible_biens:    number
          tva_deductible_services: number
          tva_deductible_immo:     number
          credit_tva_precedent:    number
          tva_nette:               number
          statut:                  'brouillon' | 'deposee'
          created_at:              string
        }
        Insert: Omit<Database['public']['Tables']['declarations_tva']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['declarations_tva']['Insert']>
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}
