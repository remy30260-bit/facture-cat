export type Facture = {
  id: string;
  user_id: string;
  date_facture: string;
  numero_facture: string | null;
  fournisseur_id: string | null;
  societe: string;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  statut: "brouillon" | "valide" | "comptabilise" | "rembourse";
  fichier_url: string | null;
  created_at: string;
};

export type NoteFrais = {
  id: string;
  user_id: string;
  date_frais: string;
  societe: string;
  categorie: "repas" | "transport" | "hebergement" | "fournitures" | "telecommunication" | "autre";
  description: string | null;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  fichier_url: string | null;
  statut: "brouillon" | "valide" | "comptabilise";
  created_at: string;
};

export type Fournisseur = {
  id: string;
  user_id: string;
  nom: string;
  siren: string | null;
  compte_comptable: string;
  created_at: string;
};
