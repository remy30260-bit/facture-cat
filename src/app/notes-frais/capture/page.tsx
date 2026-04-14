'use client'

import { useRouter } from 'next/navigation'
import { CaptureForm } from '@/components/notes-frais/CaptureForm'

export default function CapturePage() {
  const router = useRouter()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FFF1E6] text-[#FF8C42] hover:bg-[#FFD6BB] transition-colors"
          aria-label="Retour"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#2D2A26]">Nouvelle note de frais</h1>
          <p className="text-xs text-[#6B6560]">Photo ou fichier + OCR automatique</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#F0E6DC] p-5 shadow-sm">
        <CaptureForm />
      </div>
    </div>
  )
}
