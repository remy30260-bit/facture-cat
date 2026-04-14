'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NotesFraisList } from '@/components/notes-frais/NotesFraisList'
import type { NoteFrais } from '@/types/note-frais'

export default function NotesFraisPage() {
  const router = useRouter()
  const [moisActif] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const handleSelect = (note: NoteFrais) => {
    router.push(`/notes-frais/${note.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A26]">Notes de Frais</h1>
          <p className="text-sm text-[#6B6560] mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => router.push('/notes-frais/capture')}
          className="flex items-center gap-2 bg-[#FF8C42] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#E67A35] transition-colors shadow-md"
        >
          <span className="text-lg">📷</span>
          <span>Ajouter</span>
        </button>
      </div>

      {/* Sélecteur de mois */}
      <div className="bg-[#FFF8F0] border border-[#F0E6DC] rounded-xl px-4 py-3 mb-5">
        <input
          type="month"
          defaultValue={moisActif}
          className="bg-transparent text-[#2D2A26] font-medium focus:outline-none cursor-pointer"
        />
      </div>

      <NotesFraisList onSelect={handleSelect} />
    </div>
  )
}
