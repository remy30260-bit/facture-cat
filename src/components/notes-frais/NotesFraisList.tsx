'use client'

import { useState } from 'react'
import { useNotesFrais } from '@/hooks/useNotesFrais'
import type { NoteFrais, NoteFraisCategorie } from '@/types/note-frais'
import { CATEGORIES_LABELS, STATUT_COLORS } from './constants'

interface Props {
  onSelect?: (note: NoteFrais) => void
}

export function NotesFraisList({ onSelect }: Props) {
  const { notes, loading, deleteNote, totalMois } = useNotesFrais()
  const [filter, setFilter] = useState<NoteFraisCategorie | 'all'>('all')

  const filtered = filter === 'all' ? notes : notes.filter(n => n.categorie === filter)

  if (loading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-[#F0E6DC] animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Filtres catégories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all' ? 'bg-[#FF8C42] text-white' : 'bg-[#FFF1E6] text-[#6B6560] hover:bg-[#FFD6BB]'
          }`}
        >
          Toutes
        </button>
        {Object.entries(CATEGORIES_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as NoteFraisCategorie)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === key ? 'bg-[#FF8C42] text-white' : 'bg-[#FFF1E6] text-[#6B6560] hover:bg-[#FFD6BB]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="bg-[#FFF1E6] rounded-xl p-4 flex justify-between items-center">
        <span className="text-[#6B6560] text-sm">Total {filter === 'all' ? 'toutes catégories' : CATEGORIES_LABELS[filter]}</span>
        <span className="text-[#FF8C42] font-bold text-lg">{totalMois.toFixed(2)} €</span>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#6B6560]">
          <div className="text-4xl mb-3">🧾</div>
          <p className="font-medium">Aucune note de frais</p>
          <p className="text-sm mt-1">Prenez une photo pour commencer</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(note => (
            <div
              key={note.id}
              onClick={() => onSelect?.(note)}
              className="bg-white border border-[#F0E6DC] rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFF1E6] rounded-xl flex items-center justify-center text-lg">
                  {getCategorieEmoji(note.categorie)}
                </div>
                <div>
                  <p className="font-semibold text-[#2D2A26]">{note.societe}</p>
                  <p className="text-xs text-[#6B6560]">
                    {new Date(note.date_frais).toLocaleDateString('fr-FR')} · {CATEGORIES_LABELS[note.categorie]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUT_COLORS[note.statut]}`}>
                  {note.statut}
                </span>
                <span className="font-bold text-[#2D2A26]">{Number(note.montant_ttc).toFixed(2)} €</span>
                <button
                  onClick={e => { e.stopPropagation(); deleteNote(note.id) }}
                  className="text-[#EF8B8B] hover:text-red-600 p-1 transition-colors"
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getCategorieEmoji(cat: NoteFraisCategorie): string {
  const map: Record<NoteFraisCategorie, string> = {
    repas: '🍽️', transport: '🚗', hebergement: '🏨',
    fournitures: '📦', kilometrique: '🛣️',
    telecommunication: '📱', autre: '📋'
  }
  return map[cat] || '📋'
}
