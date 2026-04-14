export type CategorieNotesFrais =
  | 'repas'
  | 'transport'
  | 'hebergement'
  | 'fournitures'
  | 'kilometrique'
  | 'telecommunication'
  | 'autre';

export type StatutNoteFrais = 'brouillon' | 'valide' | 'comptabilise';

export interface NoteFrais {
  id: string;
  user_id: string;
  date_frais: string;
  societe: string;
  categorie: CategorieNotesFrais;
  description: string | null;
  montant_ht: number | null;
  montant_tva: number | null;
  montant_ttc: number;
  tva_recuperable: boolean;
  km: number | null;
  puissance_fiscale: number | null;
  fichier_url: string | null;
  fichier_nom: string | null;
  donnees_gemini: Record<string, unknown> | null;
  statut: StatutNoteFrais;
  comptabilise: boolean;
  created_at: string;
}

export interface BaremeKilometrique {
  id: string;
  annee: number;
  puissance_fiscale: number;
  tranche_km: string;
  coefficient: number;
  montant_fixe: number | null;
  created_at: string;
}

export interface GeminiNotesFraisResponse {
  date: string;
  societe: string;
  montant_ttc: number;
  montant_ht: number;
  tva: number;
  categorie: CategorieNotesFrais;
  description: string;
}

export interface RecapMensuelItem {
  categorie: CategorieNotesFrais;
  total_ttc: number;
  count: number;
}
