'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { NoteFrais } from '@/types/note-frais'
import { CATEGORIES_LABELS, STATUT_COLORS } from '@/components/notes-frais/constants'

export default function NoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [note, setNote] = useState<NoteFrais | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('notes_frais').select('*').eq('id', params.id).single()
      .then(({ data }) => { setNote(data); setLoading(false) })
  }, [params.id, supabase])

  const handleValider = async () => {
    if (!note) return
    const { data } = await supabase
      .from('notes_frais').update({ statut: 'valide' }).eq('id', note.id).select().single()
    if (data) setNote(data)
  }

  const handleDelete = async () => {
    if (!note || !confirm('Supprimer cette note de frais ?')) return
    await supabase.from('notes_frais').delete().eq('id', note.id)
    router.push('/notes-frais')
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-[#6B6560]">Chargement...</div>
  if (!note) return <div className="flex items-center justify-center h-64 text-[#6B6560]">Note introuvable</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FFF1E6] text-[#FF8C42] hover:bg-[#FFD6BB] transition-colors"
          aria-label="Retour">←</button>
        <h1 className="text-xl font-bold text-[#2D2A26]">Détail note de frais</h1>
      </div>

      {/* Aperçu fichier */}
      {note.fichier_url && (
        <div className="rounded-2xl overflow-hidden border border-[#F0E6DC]">
          <img src={note.fichier_url} alt={note.fichier_nom || 'Ticket'}
            className="w-full max-h-64 object-contain bg-[#FFF8F0]" />
        </div>
      )}

      {/* Infos principales */}
      <div className="bg-white border border-[#F0E6DC] rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xl font-bold text-[#2D2A26]">{note.societe}</p>
            <p className="text-sm text-[#6B6560]">{new Date(note.date_frais).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUT_COLORS[note.statut]}`}>
            {note.statut}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Catégorie" value={CATEGORIES_LABELS[note.categorie]} />
          <InfoRow label="Montant TTC" value={`${Number(note.montant_ttc).toFixed(2)} €`} highlight />
          {note.montant_ht && <InfoRow label="Montant HT" value={`${Number(note.montant_ht).toFixed(2)} €`} />}
          {note.montant_tva > 0 && <InfoRow label="TVA" value={`${Number(note.montant_tva).toFixed(2)} €`} />}
          {note.km && <InfoRow label="Kilomètres" value={`${note.km} km`} />}
          {note.puissance_fiscale && <InfoRow label="Puissance" value={`${note.puissance_fiscale} CV`} />}
          <InfoRow label="TVA récupérable" value={note.tva_recuperable ? 'Oui' : 'Non'} />
          {note.fichier_nom && <InfoRow label="Fichier" value={note.fichier_nom} />}
        </div>

        {note.description && (
          <div className="bg-[#FFF8F0] rounded-xl p-3">
            <p className="text-xs text-[#6B6560] mb-1">Description</p>
            <p className="text-sm text-[#2D2A26]">{note.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {note.statut === 'brouillon' && (
          <button onClick={handleValider}
            className="flex-1 bg-[#7BC47F] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            ✅ Valider
          </button>
        )}
        {note.fichier_url && (
          <a href={note.fichier_url} target="_blank" rel="noopener noreferrer"
            className="flex-1 bg-[#FFF1E6] text-[#FF8C42] py-3 rounded-xl font-semibold text-center hover:bg-[#FFD6BB] transition-colors">
            📄 Voir le fichier
          </a>
        )}
        <button onClick={handleDelete}
          className="px-5 bg-[#EF8B8B]/20 text-red-600 py-3 rounded-xl font-semibold hover:bg-[#EF8B8B]/40 transition-colors">
          🗑️
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-[#FFF8F0] rounded-xl p-3">
      <p className="text-xs text-[#6B6560] mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-[#FF8C42] text-base' : 'text-[#2D2A26]'}`}>{value}</p>
    </div>
  )
}
