'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { NoteFraisCategorie } from '@/types/note-frais'
import { useNotesFrais } from '@/hooks/useNotesFrais'
import { calculerIndemnitesKm, getBaremeKilometrique } from '@/lib/bareme-km'
import { CATEGORIES_LABELS } from './constants'

export function CaptureForm() {
  const router = useRouter()
  const { createNote } = useNotesFrais()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    date_frais: new Date().toISOString().split('T')[0],
    societe: '',
    categorie: 'autre' as NoteFraisCategorie,
    description: '',
    montant_ttc: '',
    montant_ht: '',
    montant_tva: '',
    tva_recuperable: true,
    km: '',
    puissance_fiscale: '5',
    fichier_url: '',
    fichier_nom: '',
    donnees_gemini: null as Record<string, unknown> | null,
  })

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/notes-frais/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (data.fichier_url) {
        setForm(prev => ({
          ...prev,
          fichier_url: data.fichier_url,
          fichier_nom: data.fichier_nom || prev.fichier_nom,
          societe: data.donnees_gemini?.societe || prev.societe,
          montant_ttc: String(data.donnees_gemini?.montant_ttc || prev.montant_ttc),
          montant_ht: String(data.donnees_gemini?.montant_ht || prev.montant_ht),
          montant_tva: String(data.donnees_gemini?.tva || prev.montant_tva),
          categorie: (data.donnees_gemini?.categorie as NoteFraisCategorie) || prev.categorie,
          description: data.donnees_gemini?.description || prev.description,
          date_frais: data.donnees_gemini?.date || prev.date_frais,
          donnees_gemini: data.donnees_gemini,
        }))
      }
    } catch (e) {
      console.error('Upload error:', e)
    } finally {
      setUploading(false)
    }
  }

  const handleKmChange = async (km: string) => {
    setForm(prev => ({ ...prev, km }))
    if (form.categorie === 'kilometrique' && km && form.puissance_fiscale) {
      const bareme = await getBaremeKilometrique()
      const indemnite = calculerIndemnitesKm(
        parseFloat(km),
        parseInt(form.puissance_fiscale),
        bareme
      )
      setForm(prev => ({ ...prev, km, montant_ttc: indemnite.toFixed(2), montant_ht: indemnite.toFixed(2), montant_tva: '0' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createNote({
        date_frais: form.date_frais,
        societe: form.societe,
        categorie: form.categorie,
        description: form.description,
        montant_ttc: parseFloat(form.montant_ttc) || 0,
        montant_ht: parseFloat(form.montant_ht) || undefined,
        montant_tva: parseFloat(form.montant_tva) || 0,
        tva_recuperable: form.tva_recuperable,
        km: form.km ? parseFloat(form.km) : undefined,
        puissance_fiscale: form.km ? parseInt(form.puissance_fiscale) : undefined,
        fichier_url: form.fichier_url,
        fichier_nom: form.fichier_nom,
        donnees_gemini: form.donnees_gemini || undefined,
      })
      router.push('/notes-frais')
    } catch (e) {
      console.error('Save error:', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Zone de capture */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-[#FF8C42] text-white rounded-2xl hover:bg-[#E67A35] transition-colors h-24"
        >
          <span className="text-2xl">📷</span>
          <span className="text-sm font-medium">Prendre une photo</span>
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-[#FFF1E6] text-[#FF8C42] border-2 border-dashed border-[#FFB085] rounded-2xl hover:bg-[#FFD6BB] transition-colors h-24"
        >
          <span className="text-2xl">📂</span>
          <span className="text-sm font-medium">Choisir un fichier</span>
        </button>
      </div>

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf"
        className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {/* Aperçu + état upload */}
      {uploading && (
        <div className="bg-[#FFF1E6] rounded-xl p-4 text-center text-[#FF8C42] animate-pulse">
          ⏳ Analyse OCR en cours via Gemini...
        </div>
      )}
      {preview && !uploading && (
        <div className="relative">
          <img src={preview} alt="Aperçu" className="w-full max-h-48 object-contain rounded-xl border border-[#F0E6DC]" />
          <div className="absolute top-2 right-2 bg-[#7BC47F] text-white text-xs px-2 py-1 rounded-full">✓ Uploadé</div>
        </div>
      )}

      {/* Champs du formulaire */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-[#2D2A26] mb-1">Société *</label>
          <input required value={form.societe} onChange={e => setForm(p => ({ ...p, societe: e.target.value }))}
            className="w-full border border-[#F0E6DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent outline-none"
            placeholder="Ex: AMAZON"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2D2A26] mb-1">Date *</label>
          <input required type="date" value={form.date_frais}
            onChange={e => setForm(p => ({ ...p, date_frais: e.target.value }))}
            className="w-full border border-[#F0E6DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#FF8C42] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2D2A26] mb-1">Catégorie *</label>
          <select value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value as NoteFraisCategorie }))}
            className="w-full border border-[#F0E6DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#FF8C42] outline-none bg-white"
          >
            {Object.entries(CATEGORIES_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {form.categorie === 'kilometrique' && (
          <>
            <div>
              <label className="block text-sm font-medium text-[#2D2A26] mb-1">Km parcourus</label>
              <input type="number" value={form.km} onChange={e => handleKmChange(e.target.value)}
                className="w-full border border-[#F0E6DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#FF8C42] outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D2A26] mb-1">Puissance fiscale (CV)</label>
              <select value={form.puissance_fiscale} onChange={e => setForm(p => ({ ...p, puissance_fiscale: e.target.value }))}
                className="w-full border border-[#F0E6DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#FF8C42] outline-none bg-white"
              >
                {[3,4,5,6,7].map(cv => <option key={cv} value={cv}>{cv} CV</option>)}
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-[#2D2A26] mb-1">Montant TTC *</label>
          <input required type="number" step="0.01" value={form.montant_ttc}
            onChange={e => setForm(p => ({ ...p, montant_ttc: e.target.value }))}
            className="w-full border border-[#F0E6DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#FF8C42] outline-none"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2D2A26] mb-1">Montant HT</label>
          <input type="number" step="0.01" value={form.montant_ht}
            onChange={e => setForm(p => ({ ...p, montant_ht: e.target.value }))}
            className="w-full border border-[#F0E6DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#FF8C42] outline-none"
            placeholder="0.00"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-[#2D2A26] mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={2}
            className="w-full border border-[#F0E6DC] rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#FF8C42] outline-none resize-none"
            placeholder="Ex: Déjeuner client, fournitures bureau..."
          />
        </div>

        <div className="col-span-2 flex items-center gap-3">
          <input type="checkbox" id="tva_rec" checked={form.tva_recuperable}
            onChange={e => setForm(p => ({ ...p, tva_recuperable: e.target.checked }))}
            className="w-4 h-4 accent-[#FF8C42]"
          />
          <label htmlFor="tva_rec" className="text-sm text-[#6B6560]">TVA récupérable</label>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="w-full bg-[#FF8C42] text-white py-3 rounded-2xl font-semibold hover:bg-[#E67A35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Enregistrement...' : '✅ Enregistrer la note de frais'}
      </button>
    </form>
  )
}
