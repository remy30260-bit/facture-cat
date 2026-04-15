/**
 * Hook React pour déclencher l'analyse Gemini depuis le frontend
 */
import { useState, useCallback } from 'react'
import type { AnalyseGemini } from '@/types/facture'

type Etat = 'idle' | 'loading' | 'success' | 'error'

export interface UseGeminiAnalyseReturn {
  etat: Etat
  analyse: AnalyseGemini | null
  erreur: string | null
  duree_ms: number | null
  analyserFichier: (file: File) => Promise<AnalyseGemini | null>
  analyserUrl: (url: string, factureId?: string) => Promise<AnalyseGemini | null>
  reset: () => void
}

export function useGeminiAnalyse(): UseGeminiAnalyseReturn {
  const [etat, setEtat] = useState<Etat>('idle')
  const [analyse, setAnalyse] = useState<AnalyseGemini | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [duree_ms, setDuree] = useState<number | null>(null)

  const reset = useCallback(() => {
    setEtat('idle')
    setAnalyse(null)
    setErreur(null)
    setDuree(null)
  }, [])

  const analyserFichier = useCallback(async (file: File): Promise<AnalyseGemini | null> => {
    setEtat('loading')
    setErreur(null)
    setAnalyse(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error ?? `Erreur ${res.status}`)
      }

      setAnalyse(json.analyse)
      setDuree(json.duree_ms)
      setEtat('success')
      return json.analyse as AnalyseGemini
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setErreur(msg)
      setEtat('error')
      return null
    }
  }, [])

  const analyserUrl = useCallback(async (
    url: string,
    factureId?: string
  ): Promise<AnalyseGemini | null> => {
    setEtat('loading')
    setErreur(null)
    setAnalyse(null)

    try {
      const res = await fetch('/api/gemini/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, facture_id: factureId }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `Erreur ${res.status}`)

      setAnalyse(json.analyse)
      setDuree(json.duree_ms)
      setEtat('success')
      return json.analyse as AnalyseGemini
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setErreur(msg)
      setEtat('error')
      return null
    }
  }, [])

  return { etat, analyse, erreur, duree_ms, analyserFichier, analyserUrl, reset }
}
