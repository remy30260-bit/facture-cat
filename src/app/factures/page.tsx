'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

type Statut = 'tous' | 'a_valider' | 'valide' | 'rejete' | 'en_attente'

interface Facture {
  id: string
  created_at: string
  nom_fichier: string
  fournisseur?: string
  numero_facture?: string
  date_facture?: string
  date_echeance?: string
  montant_ht?: number
  montant_tva?: number
  montant_ttc?: number
  devise?: string
  statut: string
  source?: string
  score_confiance?: number
  compte_charge?: string
}

const STATUTS: { valeur: Statut; label: string; couleur: string }[] = [
  { valeur: 'tous', label: 'Toutes', couleur: 'bg-gray-100 text-gray-700' },
  { valeur: 'a_valider', label: 'À valider', couleur: 'bg-yellow-100 text-yellow-700' },
  { valeur: 'valide', label: 'Validée', couleur: 'bg-green-100 text-green-700' },
  { valeur: 'en_attente', label: 'En attente', couleur: 'bg-blue-100 text-blue-700' },
  { valeur: 'rejete', label: 'Rejetée', couleur: 'bg-red-100 text-red-700' },
]

export default function PageFactures() {
  const supabase = createClientComponentClient()
  const [factures, setFactures] = useState<Facture[]>([])
  const [chargement, setChargement] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState<Statut>('tous')
  const [recherche, setRecherche] = useState('')
  const [tri, setTri] = useState<'date_facture' | 'montant_ttc' | 'created_at'>('created_at')

  const charger = useCallback(async () => {
    setChargement(true)
    let query = supabase
      .from('factures')
      .select('*')
      .order(tri, { ascending: false })

    if (filtreStatut !== 'tous') {
      query = query.eq('statut', filtreStatut)
    }
    if (recherche.trim()) {
      query = query.or(`fournisseur.ilike.%${recherche}%,numero_facture.ilike.%${recherche}%`)
    }

    const { data, error } = await query
    if (!error && data) setFactures(data)
    setChargement(false)
  }, [supabase, filtreStatut, recherche, tri])

  useEffect(() => { charger() }, [charger])

  const changerStatut = async (id: string, nouveauStatut: string) => {
    await supabase.from('factures').update({ statut: nouveauStatut }).eq('id', id)
    charger()
  }

  const total = factures.reduce((s, f) => s + (f.montant_ttc ?? 0), 0)
  const aValider = factures.filter(f => f.statut === 'a_valider').length

  const statutInfo = (s: string) =>
    STATUTS.find(x => x.valeur === s) ?? { label: s, couleur: 'bg-gray-100 text-gray-600' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Factures</h1>
          <p className="text-sm text-gray-500 mt-0.5">{factures.length} facture{factures.length > 1 ? 's' : ''} • Total TTC : <span className="font-medium text-gray-800">{total.toFixed(2)} €</span></p>
        </div>
        <Link
          href="/factures/upload"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <span>+</span> Importer
        </Link>
      </div>

      {/* Alerte à valider */}
      {aValider > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠️ <strong>{aValider} facture{aValider > 1 ? 's' : ''}</strong> en attente de validation
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Rechercher (fournisseur, n° facture...)"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={tri}
          onChange={e => setTri(e.target.value as typeof tri)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="created_at">Trier : Import</option>
          <option value="date_facture">Trier : Date facture</option>
          <option value="montant_ttc">Trier : Montant</option>
        </select>
      </div>

      {/* Onglets statut */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STATUTS.map(s => (
          <button
            key={s.valeur}
            onClick={() => setFiltreStatut(s.valeur)}
            className={`px-3 py-1.5 text-sm rounded-full font-medium whitespace-nowrap transition-colors ${
              filtreStatut === s.valeur ? s.couleur + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tableau */}
      {chargement ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : factures.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🗂️</div>
          <p className="font-medium text-gray-600">Aucune facture trouvée</p>
          <p className="text-sm mt-1">Importez votre première facture pour commencer</p>
          <Link href="/factures/upload" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            Importer une facture
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Fournisseur</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">N° Facture</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Échéance</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">HT</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">TTC</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Compte</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {factures.map(f => {
                  const si = statutInfo(f.statut)
                  return (
                    <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{f.fournisseur ?? <span className="text-gray-300 italic">—</span>}</td>
                      <td className="px-4 py-3 text-gray-600">{f.numero_facture ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{f.date_facture ? new Date(f.date_facture).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {f.date_echeance ? (
                          <span className={new Date(f.date_echeance) < new Date() && f.statut !== 'valide' ? 'text-red-600 font-medium' : ''}>
                            {new Date(f.date_echeance).toLocaleDateString('fr-FR')}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{f.montant_ht ? f.montant_ht.toFixed(2) : '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{f.montant_ttc ? `${f.montant_ttc.toFixed(2)} ${f.devise ?? '€'}` : '—'}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{f.compte_charge ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${si.couleur}`}>
                          {si.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={f.statut}
                          onChange={e => changerStatut(f.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        >
                          <option value="a_valider">À valider</option>
                          <option value="valide">Valider</option>
                          <option value="en_attente">En attente</option>
                          <option value="rejete">Rejeter</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
