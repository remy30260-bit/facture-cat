'use client'

import type { AnalyseGemini } from '@/types/facture'
import { formatEur, formatDate } from '@/lib/utils'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Building2,
  Calendar,
  Euro,
  FileText,
  Hash,
} from 'lucide-react'

interface Props {
  analyse: AnalyseGemini
  duree_ms?: number | null
  onValider?: (analyse: AnalyseGemini) => void
  onRelancer?: () => void
  className?: string
}

function BadgeConfiance({ score }: { score: number }) {
  if (score >= 80) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <CheckCircle className="w-3 h-3" /> Confiance élevée ({score}%)
    </span>
  )
  if (score >= 50) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      <AlertTriangle className="w-3 h-3" /> Confiance moyenne ({score}%)
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      <XCircle className="w-3 h-3" /> Confiance faible ({score}%)
    </span>
  )
}

export function AnalyseResultat({ analyse, duree_ms, onValider, onRelancer, className = '' }: Props) {
  const lignes = analyse.lignes ?? []

  return (
    <div className={`rounded-xl border border-gray-200 bg-white overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-gray-800">Analyse IA — Gemini</span>
          {duree_ms && (
            <span className="text-xs text-gray-400">{(duree_ms / 1000).toFixed(1)}s</span>
          )}
        </div>
        <BadgeConfiance score={analyse.confiance} />
      </div>

      <div className="p-4 space-y-4">
        {/* Avertissements */}
        {analyse.avertissements.length > 0 && (
          <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <ul className="text-xs text-amber-700 space-y-0.5">
              {analyse.avertissements.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Grid infos principales */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem
            icon={<Hash className="w-3.5 h-3.5" />}
            label="N° facture"
            value={analyse.numero_facture}
          />
          <InfoItem
            icon={<FileText className="w-3.5 h-3.5" />}
            label="Type"
            value={analyse.type_document}
          />
          <InfoItem
            icon={<Building2 className="w-3.5 h-3.5" />}
            label="Émetteur"
            value={analyse.nom_emetteur}
          />
          <InfoItem
            icon={<Building2 className="w-3.5 h-3.5" />}
            label="SIRET"
            value={analyse.siret_emetteur}
          />
          <InfoItem
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Date émission"
            value={analyse.date_emission ? formatDate(analyse.date_emission) : null}
          />
          <InfoItem
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Date échéance"
            value={analyse.date_echeance ? formatDate(analyse.date_echeance) : null}
          />
        </div>

        {/* Montants */}
        <div className="grid grid-cols-3 gap-2">
          <MontantBox label="HT" montant={analyse.montant_ht} devise={analyse.devise} />
          <MontantBox label="TVA" montant={analyse.montant_tva} devise={analyse.devise} taux={analyse.taux_tva} />
          <MontantBox label="TTC" montant={analyse.montant_ttc} devise={analyse.devise} highlight />
        </div>

        {/* Compte comptable suggéré */}
        {analyse.compte_comptable_suggere && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
            <span className="text-xs text-blue-600 font-medium">Compte PCG suggéré :</span>
            <code className="text-xs font-mono text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
              {analyse.compte_comptable_suggere}
            </code>
            {analyse.categorie_suggere && (
              <span className="text-xs text-blue-500">— {analyse.categorie_suggere}</span>
            )}
          </div>
        )}

        {/* Lignes */}
        {lignes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Lignes détectées ({lignes.length})</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Description</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">Qté</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">PU HT</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lignes.map((l, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-700">{l.description}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{l.quantite}</td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {analyse.devise === 'EUR'
                          ? formatEur(l.prix_unitaire_ht)
                          : `${l.prix_unitaire_ht} ${analyse.devise}`}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-800">
                        {analyse.devise === 'EUR'
                          ? formatEur(l.montant_ht)
                          : `${l.montant_ht} ${analyse.devise}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        {(onValider || onRelancer) && (
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            {onRelancer && (
              <button
                onClick={onRelancer}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
              >
                Relancer l&apos;analyse
              </button>
            )}
            {onValider && (
              <button
                onClick={() => onValider(analyse)}
                className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Valider et importer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-xs text-gray-400">
        {icon} {label}
      </span>
      <span className="text-sm text-gray-800 font-medium truncate">
        {value ?? <span className="text-gray-300 font-normal">—</span>}
      </span>
    </div>
  )
}

function MontantBox({
  label,
  montant,
  devise,
  taux,
  highlight = false,
}: {
  label: string
  montant: number | null
  devise: string
  taux?: number | null
  highlight?: boolean
}) {
  return (
    <div className={`rounded-lg p-2.5 text-center ${
      highlight
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-50 border border-gray-200'
    }`}>
      <p className={`text-xs mb-0.5 ${highlight ? 'text-indigo-200' : 'text-gray-400'}`}>
        {label}{taux != null ? ` (${taux}%)` : ''}
      </p>
      <p className={`text-sm font-bold ${highlight ? 'text-white' : 'text-gray-800'}`}>
        {montant != null
          ? devise === 'EUR'
            ? formatEur(montant)
            : `${montant} ${devise}`
          : '—'}
      </p>
    </div>
  )
}
