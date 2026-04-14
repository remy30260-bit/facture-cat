import type { NoteFraisCategorie, NoteFraisStatut } from '@/types/note-frais'

export const CATEGORIES_LABELS: Record<NoteFraisCategorie, string> = {
  repas: 'Repas',
  transport: 'Transport',
  hebergement: 'Hébergement',
  fournitures: 'Fournitures',
  kilometrique: 'Kilométrique',
  telecommunication: 'Télécommunication',
  autre: 'Autre',
}

export const STATUT_COLORS: Record<NoteFraisStatut, string> = {
  brouillon: 'bg-[#FFD166]/30 text-yellow-700',
  valide: 'bg-[#7BC47F]/30 text-green-700',
  rembourse: 'bg-[#7EB8DA]/30 text-blue-700',
  refuse: 'bg-[#EF8B8B]/30 text-red-700',
}

export const COMPTE_PCG_CATEGORIE: Record<NoteFraisCategorie, string> = {
  repas: '625100',
  transport: '625000',
  hebergement: '625200',
  fournitures: '606400',
  kilometrique: '625100',
  telecommunication: '626000',
  autre: '625800',
}
