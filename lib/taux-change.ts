const CACHE_DURATION_MS = 60 * 60 * 1000

interface RatesCache {
  rates:     Record<string, number>
  timestamp: number
}

let cache: RatesCache | null = null

export async function getTauxChange(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION_MS) {
    return cache.rates
  }
  const apiKey = process.env.EXCHANGE_RATE_API_KEY
  const url    = apiKey
    ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/EUR`
    : 'https://open.er-api.com/v6/latest/EUR'
  try {
    const res   = await fetch(url, { next: { revalidate: 3600 } })
    const data  = await res.json()
    const rates = data.rates as Record<string, number>
    cache = { rates, timestamp: Date.now() }
    return rates
  } catch {
    return { USD: 1.09, GBP: 0.86, EUR: 1 }
  }
}

export async function convertToEur(montant: number, devise: string): Promise<{
  montant_eur: number
  taux:        number
}> {
  if (devise === 'EUR') return { montant_eur: montant, taux: 1 }
  const rates      = await getTauxChange()
  const tauxDevise = rates[devise]
  if (!tauxDevise) return { montant_eur: montant, taux: 1 }
  const taux       = 1 / tauxDevise
  const montantEur = Math.round(montant * taux * 100) / 100
  return { montant_eur: montantEur, taux }
}
