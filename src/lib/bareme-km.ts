/**
 * Barème kilométrique 2025 — Arrêté du 25 février 2025
 * Source : https://www.impots.gouv.fr
 */

export interface TrancheBareme {
  jusqu_a: number | null; // null = au-delà
  formule: (km: number) => number;
  description: string;
}

export interface BaremeParPuissance {
  cv: number;
  tranches: TrancheBareme[];
}

export const BAREME_KM_2025: BaremeParPuissance[] = [
  {
    cv: 3,
    tranches: [
      { jusqu_a: 5000,  formule: (d) => d * 0.529,          description: 'd × 0,529' },
      { jusqu_a: 20000, formule: (d) => d * 0.316 + 1065,   description: '(d × 0,316) + 1 065' },
      { jusqu_a: null,  formule: (d) => d * 0.370,          description: 'd × 0,370' },
    ],
  },
  {
    cv: 4,
    tranches: [
      { jusqu_a: 5000,  formule: (d) => d * 0.606,          description: 'd × 0,606' },
      { jusqu_a: 20000, formule: (d) => d * 0.340 + 1330,   description: '(d × 0,340) + 1 330' },
      { jusqu_a: null,  formule: (d) => d * 0.407,          description: 'd × 0,407' },
    ],
  },
  {
    cv: 5,
    tranches: [
      { jusqu_a: 5000,  formule: (d) => d * 0.636,          description: 'd × 0,636' },
      { jusqu_a: 20000, formule: (d) => d * 0.357 + 1395,   description: '(d × 0,357) + 1 395' },
      { jusqu_a: null,  formule: (d) => d * 0.427,          description: 'd × 0,427' },
    ],
  },
  {
    cv: 6,
    tranches: [
      { jusqu_a: 5000,  formule: (d) => d * 0.665,          description: 'd × 0,665' },
      { jusqu_a: 20000, formule: (d) => d * 0.374 + 1457,   description: '(d × 0,374) + 1 457' },
      { jusqu_a: null,  formule: (d) => d * 0.447,          description: 'd × 0,447' },
    ],
  },
  {
    cv: 7,
    tranches: [
      { jusqu_a: 5000,  formule: (d) => d * 0.697,          description: 'd × 0,697' },
      { jusqu_a: 20000, formule: (d) => d * 0.394 + 1515,   description: '(d × 0,394) + 1 515' },
      { jusqu_a: null,  formule: (d) => d * 0.470,          description: 'd × 0,470' },
    ],
  },
];

/**
 * Calcule l'indemnité kilométrique selon le barème 2025.
 * @param km - Distance totale annuelle en kilomètres
 * @param puissanceFiscale - Puissance fiscale du véhicule (3 à 7 CV)
 * @returns Montant de l'indemnité en euros
 */
export function calculerIndemniteKm(km: number, puissanceFiscale: number): number {
  const cv = Math.min(Math.max(puissanceFiscale, 3), 7);
  const bareme = BAREME_KM_2025.find((b) => b.cv === cv) ?? BAREME_KM_2025[4];

  for (const tranche of bareme.tranches) {
    if (tranche.jusqu_a === null || km <= tranche.jusqu_a) {
      return Math.round(tranche.formule(km) * 100) / 100;
    }
  }

  return 0;
}

/**
 * Retourne la description de la formule applicable.
 */
export function getFormuleBareme(km: number, puissanceFiscale: number): string {
  const cv = Math.min(Math.max(puissanceFiscale, 3), 7);
  const bareme = BAREME_KM_2025.find((b) => b.cv === cv) ?? BAREME_KM_2025[4];

  for (const tranche of bareme.tranches) {
    if (tranche.jusqu_a === null || km <= tranche.jusqu_a) {
      return tranche.description;
    }
  }

  return '';
}

/**
 * Génère la nomenclature automatique du fichier : SOCIÉTÉ MOIS JOUR
 * Ex: AMAZON 04 26
 */
export function genererNomFichier(societe: string, date: string): string {
  const d = new Date(date);
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  const jour = String(d.getDate()).padStart(2, '0');
  return `${societe.toUpperCase().replace(/\s+/g, '_')} ${mois} ${jour}`;
}
