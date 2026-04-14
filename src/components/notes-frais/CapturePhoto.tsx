"use client";
import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, RotateCcw, Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Step = 'idle' | 'preview' | 'uploading' | 'done';

export function CapturePhoto() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)) {
      setError('Format non supporté. Utilisez JPG, PNG ou PDF.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 Mo).');
      return;
    }
    setError(null);
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
    setStep('preview');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleSend = async () => {
    if (!file) return;
    setStep('uploading');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/notes-frais/capture', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Erreur lors de l\'envoi');
      }
      const { id } = await res.json();
      setStep('done');
      router.push(`/notes-frais/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setStep('preview');
    }
  };

  const reset = () => {
    setStep('idle');
    setPreview(null);
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-md mx-auto">
      {step === 'idle' && (
        <div
          className="border-2 border-dashed border-brand-beige-dark rounded-2xl p-10 flex flex-col items-center gap-4 bg-brand-beige/30 hover:bg-brand-beige/60 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center">
            <Camera size={28} className="text-brand-orange" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">Prendre une photo ou importer</p>
            <p className="text-sm text-brand-gray-soft mt-1">JPG, PNG, PDF · max 10 Mo</p>
          </div>
          <button className="flex items-center gap-2 bg-brand-orange text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-brand-orange-dark transition-colors shadow-soft">
            <Upload size={16} /> Choisir un fichier
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            capture="environment"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          {preview ? (
            <img
              src={preview}
              alt="Aperçu du ticket"
              className="w-full rounded-2xl border border-brand-beige-dark object-contain max-h-80"
            />
          ) : (
            <div className="w-full h-40 rounded-2xl border border-brand-beige-dark bg-brand-beige flex items-center justify-center">
              <p className="text-sm text-brand-gray-soft">📄 {file?.name}</p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-beige-dark text-brand-gray-soft hover:bg-brand-beige transition-colors text-sm font-medium"
            >
              <RotateCcw size={15} /> Recommencer
            </button>
            <button
              onClick={handleSend}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-brand-orange-dark transition-colors shadow-soft"
            >
              <Send size={15} /> Analyser avec Gemini
            </button>
          </div>
        </div>
      )}

      {step === 'uploading' && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 size={40} className="text-brand-orange animate-spin" />
          <p className="text-gray-600 font-medium">Analyse en cours…</p>
          <p className="text-sm text-brand-gray-soft">Gemini extrait les données de votre ticket</p>
        </div>
      )}
    </div>
  );
}
