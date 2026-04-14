import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface BaremeEntry {
  puissance_fiscale: number
  km_min: number
  km_max: number | null
  coefficient: number
  montant_fixe: number | null
}

export async function getBaremeKilometrique(annee: number = new Date().getFullYear()): Promise<BaremeEntry[]> {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase
    .from('bareme_kilometrique')
    .select('*')
    .eq('annee', annee)
    .order('puissance_fiscale')
    .order('km_min')

  if (error) throw error
  return data || []
}

export function calculerIndemnitesKm(km: number, puissanceFiscale: number, bareme: BaremeEntry[]): number {
  const tranches = bareme.filter(b => b.puissance_fiscale === puissanceFiscale)
  if (tranches.length === 0) return 0

  const tranche = tranches.find(t => {
    const minOk = km >= t.km_min
    const maxOk = t.km_max === null || km <= t.km_max
    return minOk && maxOk
  })

  if (!tranche) return 0

  if (tranche.montant_fixe !== null) {
    return km * tranche.coefficient + tranche.montant_fixe
  }
  return km * tranche.coefficient
}
