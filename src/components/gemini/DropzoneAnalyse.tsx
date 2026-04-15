'use client'

import { useCallback, useState, useRef } from 'react'
import { Upload, FileText, ImageIcon, Loader2, X } from 'lucide-react'
import { useGeminiAnalyse } from '@/hooks/useGeminiAnalyse'
import { AnalyseResultat } from './AnalyseResultat'
import type { AnalyseGemini } from '@/types/facture'

interface Props {
  onAnalyseComplete?: (analyse: AnalyseGemini, file: File) => void
  className?: string
}

const TYPES_ACCEPTES = '.jpg,.jpeg,.png,.webp,.pdf,.heic'
const MAX_SIZE_MB = 10

export function DropzoneAnalyse({ onAnalyseComplete, className = '' }: Props) {
  const [fichier, setFichier] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { etat, analyse, erreur, duree_ms, analyserFichier, reset } = useGeminiAnalyse()

  const traiterFichier = useCallback(async (file: File) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Fichier trop volumineux (max ${MAX_SIZE_MB} MB)`)
      return
    }
    setFichier(file)
    reset()

    // Preview image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }

    // Lancer analyse
    const result = await analyserFichier(file)
    if (result && onAnalyseComplete) {
      onAnalyseComplete(result, file)
    }
  }, [analyserFichier, onAnalyseComplete, reset])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) traiterFichier(file)
  }, [traiterFichier])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) traiterFichier(file)
  }, [traiterFichier])

  const handleSupprimer = () => {
    setFichier(null)
    setPreview(null)
    reset()
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de dépôt */}
      {!fichier ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            drag
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={TYPES_ACCEPTES}
            onChange={handleChange}
            className="sr-only"
          />
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
            <Upload className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-800">
              Déposer une facture ici
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, WebP, PDF, HEIC — max {MAX_SIZE_MB} MB
            </p>
          </div>
        </div>
      ) : (
        /* Fichier sélectionné */
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex-shrink-0">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="aperçu" className="w-12 h-12 object-cover rounded-lg" />
            ) : (
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-100">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{fichier.name}</p>
            <p className="text-xs text-gray-400">
              {(fichier.size / 1024).toFixed(0)} Ko
            </p>
          </div>
          {etat === 'loading' ? (
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />
          ) : (
            <button
              onClick={handleSupprimer}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
              aria-label="Supprimer le fichier"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      )}

      {/* État chargement */}
      {etat === 'loading' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-indigo-800">Analyse en cours…</p>
            <p className="text-xs text-indigo-400">Gemini 1.5 Flash lit votre document</p>
          </div>
        </div>
      )}

      {/* Erreur */}
      {etat === 'error' && erreur && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Analyse échouée</p>
            <p className="text-xs text-red-600 mt-0.5">{erreur}</p>
          </div>
        </div>
      )}

      {/* Résultat */}
      {etat === 'success' && analyse && (
        <AnalyseResultat
          analyse={analyse}
          duree_ms={duree_ms}
          onValider={onAnalyseComplete ? (a) => onAnalyseComplete(a, fichier!) : undefined}
          onRelancer={fichier ? () => traiterFichier(fichier) : undefined}
        />
      )}
    </div>
  )
}
