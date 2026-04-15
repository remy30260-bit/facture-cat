'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type EtatUpload = 'idle' | 'uploading' | 'analysing' | 'success' | 'error'

interface ResultatAnalyse {
  fournisseur?: string
  numero_facture?: string
  date_facture?: string
  date_echeance?: string
  montant_ht?: number
  montant_tva?: number
  montant_ttc?: number
  taux_tva?: number
  devise?: string
  description?: string
  compte_charge?: string
  confiance?: number
  lignes?: Array<{
    description: string
    quantite: number
    prix_unitaire: number
    montant_ht: number
    taux_tva: number
  }>
}

export default function PageUpload() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [fichier, setFichier] = useState<File | null>(null)
  const [etat, setEtat] = useState<EtatUpload>('idle')
  const [resultat, setResultat] = useState<ResultatAnalyse | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)

  const traiterFichier = useCallback((f: File) => {
    const types = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!types.includes(f.type)) {
      setErreur('Format non supporté. Utilisez PDF, JPG ou PNG.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setErreur('Fichier trop volumineux (max 10 Mo).')
      return
    }
    setErreur(null)
    setFichier(f)
    setResultat(null)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) traiterFichier(f)
  }, [traiterFichier])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) traiterFichier(f)
  }

  const analyser = async () => {
    if (!fichier) return
    setEtat('uploading')
    setErreur(null)

    try {
      // 1. Upload vers Supabase Storage
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const nomFichier = `${user.id}/${Date.now()}_${fichier.name}`
      const { error: uploadErr } = await supabase.storage
        .from('factures')
        .upload(nomFichier, fichier)

      if (uploadErr) throw new Error(`Erreur upload: ${uploadErr.message}`)

      // 2. Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('factures')
        .getPublicUrl(nomFichier)

      setEtat('analysing')

      // 3. Appeler Gemini via notre API
      const rep = await fetch('/api/gemini/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: publicUrl, nom_fichier: fichier.name }),
      })

      if (!rep.ok) {
        const err = await rep.json()
        throw new Error(err.error || 'Erreur analyse Gemini')
      }

      const data = await rep.json()
      setResultat(data.analyse)
      setEtat('success')
    } catch (err: unknown) {
      setErreur(err instanceof Error ? err.message : 'Erreur inconnue')
      setEtat('error')
    }
  }

  const validerEtImporter = async () => {
    if (!resultat || !fichier) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('factures').insert({
        user_id: user.id,
        nom_fichier: fichier.name,
        fournisseur: resultat.fournisseur,
        numero_facture: resultat.numero_facture,
        date_facture: resultat.date_facture,
        date_echeance: resultat.date_echeance,
        montant_ht: resultat.montant_ht,
        montant_tva: resultat.montant_tva,
        montant_ttc: resultat.montant_ttc,
        taux_tva: resultat.taux_tva,
        devise: resultat.devise ?? 'EUR',
        description: resultat.description,
        compte_charge: resultat.compte_charge,
        score_confiance: resultat.confiance,
        statut: 'a_valider',
        source: 'gemini',
      })

      if (error) throw error
      router.push('/factures')
    } catch (err: unknown) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de l\'import')
    }
  }

  const confiance = resultat?.confiance ?? 0
  const couleurConfiance = confiance >= 0.85 ? 'text-green-600' : confiance >= 0.6 ? 'text-yellow-600' : 'text-red-600'
  const labelConfiance = confiance >= 0.85 ? 'Élevée' : confiance >= 0.6 ? 'Moyenne' : 'Faible'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Importer une facture</h1>
        <p className="text-sm text-gray-500 mt-1">PDF, JPG ou PNG — max 10 Mo. Gemini analyse automatiquement le contenu.</p>
      </div>

      {/* Zone de dépôt */}
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
          drag ? 'border-indigo-400 bg-indigo-50' : fichier ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40'
        }`}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={onFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {fichier ? (
          <div className="space-y-1">
            <div className="text-2xl">📄</div>
            <p className="font-medium text-gray-800">{fichier.name}</p>
            <p className="text-sm text-gray-500">{(fichier.size / 1024).toFixed(0)} Ko</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl">☁️</div>
            <p className="font-medium text-gray-700">Glissez votre facture ici</p>
            <p className="text-sm text-gray-400">ou cliquez pour choisir un fichier</p>
          </div>
        )}
      </div>

      {erreur && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ⚠️ {erreur}
        </div>
      )}

      {/* Bouton analyser */}
      {fichier && etat === 'idle' && (
        <button
          onClick={analyser}
          className="mt-4 w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
        >
          Analyser avec Gemini ✨
        </button>
      )}

      {/* États de chargement */}
      {(etat === 'uploading' || etat === 'analysing') && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-600">
            {etat === 'uploading' ? '⬆️ Envoi du fichier...' : '🤖 Analyse Gemini en cours...'}
          </p>
        </div>
      )}

      {/* Résultat */}
      {etat === 'success' && resultat && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Résultat de l'analyse</h2>
            <span className={`text-sm font-medium ${couleurConfiance}`}>
              Confiance : {labelConfiance} ({Math.round(confiance * 100)}%)
            </span>
          </div>

          <div className="p-5 grid grid-cols-2 gap-4 text-sm">
            <Champ label="Fournisseur" valeur={resultat.fournisseur} />
            <Champ label="N° Facture" valeur={resultat.numero_facture} />
            <Champ label="Date facture" valeur={resultat.date_facture} />
            <Champ label="Échéance" valeur={resultat.date_echeance} />
            <Champ label="Montant HT" valeur={resultat.montant_ht ? `${resultat.montant_ht.toFixed(2)} ${resultat.devise ?? 'EUR'}` : undefined} />
            <Champ label="TVA" valeur={resultat.montant_tva ? `${resultat.montant_tva.toFixed(2)} ${resultat.devise ?? 'EUR'} (${resultat.taux_tva}%)` : undefined} />
            <Champ label="Montant TTC" valeur={resultat.montant_ttc ? `${resultat.montant_ttc.toFixed(2)} ${resultat.devise ?? 'EUR'}` : undefined} highlight />
            <Champ label="Compte charge" valeur={resultat.compte_charge} />
            {resultat.description && (
              <div className="col-span-2">
                <Champ label="Description" valeur={resultat.description} />
              </div>
            )}
          </div>

          {resultat.lignes && resultat.lignes.length > 0 && (
            <div className="px-5 pb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Lignes détectées</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 font-medium">Description</th>
                      <th className="pb-2 font-medium text-right">Qté</th>
                      <th className="pb-2 font-medium text-right">PU HT</th>
                      <th className="pb-2 font-medium text-right">HT</th>
                      <th className="pb-2 font-medium text-right">TVA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultat.lignes.map((l, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-1.5">{l.description}</td>
                        <td className="py-1.5 text-right">{l.quantite}</td>
                        <td className="py-1.5 text-right">{l.prix_unitaire?.toFixed(2)}</td>
                        <td className="py-1.5 text-right">{l.montant_ht?.toFixed(2)}</td>
                        <td className="py-1.5 text-right">{l.taux_tva}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="px-5 pb-5 flex gap-3">
            <button
              onClick={validerEtImporter}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              ✅ Valider et importer
            </button>
            <button
              onClick={() => { setFichier(null); setEtat('idle'); setResultat(null) }}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Recommencer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Champ({ label, valeur, highlight }: { label: string; valeur?: string | number; highlight?: boolean }) {
  if (!valeur && valeur !== 0) return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-300 italic text-xs">Non détecté</p>
    </div>
  )
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`font-medium ${highlight ? 'text-indigo-700 text-base' : 'text-gray-800'}`}>{String(valeur)}</p>
    </div>
  )
}
