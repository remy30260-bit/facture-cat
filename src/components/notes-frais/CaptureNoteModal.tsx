"use client";
import { useState, useRef, useCallback } from "react";
import { X, Camera, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Step = "capture" | "analyzing" | "review" | "success" | "error";

const CATEGORIES = [
  { value: "repas",            label: "🍽️ Repas" },
  { value: "transport",        label: "🚗 Transport" },
  { value: "hebergement",      label: "🏨 Hébergement" },
  { value: "fournitures",      label: "📦 Fournitures" },
  { value: "telecommunication",label: "📱 Télécom" },
  { value: "autre",            label: "📎 Autre" },
];

export function CaptureNoteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<Step>("capture");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    societe: "", categorie: "autre", description: "",
    montant_ttc: "", montant_ht: "", tva: "",
  });

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const analyzeWithGemini = async () => {
    if (!file) return;
    setStep("analyzing");
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const fd = new FormData();
      fd.append("file", file);
      fd.append("save", "false");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/capture-note-frais`,
        { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur OCR");

      const ocr = data.ocrResult || {};
      setForm({
        date: ocr.date || new Date().toISOString().split("T")[0],
        societe: ocr.societe || "",
        categorie: ocr.categorie || "autre",
        description: ocr.description || "",
        montant_ttc: ocr.montant_ttc?.toString() || "",
        montant_ht: ocr.montant_ht?.toString() || "",
        tva: ocr.tva?.toString() || "",
      });
      setStep("review");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setStep("error");
    }
  };

  const saveNote = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const fd = new FormData();
      fd.append("file", file);
      fd.append("save", "true");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/capture-note-frais`,
        { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur sauvegarde");
      setStep("success");
      setTimeout(onSuccess, 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setStep("error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-brand-beige-dark rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-beige-dark">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-orange-pale flex items-center justify-center">
              <Receipt size={16} className="text-brand-orange" />
            </div>
            <h2 className="font-semibold text-gray-800">Note de frais</h2>
          </div>
          <button onClick={onClose} className="text-brand-gray-soft hover:text-gray-800"><X size={20} /></button>
        </div>

        <div className="p-6">
          {/* CAPTURE */}
          {step === "capture" && (
            <div className="space-y-4">
              {preview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Aperçu ticket" className="w-full rounded-2xl object-cover max-h-64" />
                  <button onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md text-gray-600 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-brand-beige-dark hover:border-brand-orange hover:bg-brand-beige transition-all">
                    <Camera size={28} className="text-brand-orange" />
                    <span className="text-sm font-medium text-gray-700">Prendre une photo</span>
                    <span className="text-xs text-brand-gray-soft">Caméra</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-brand-beige-dark hover:border-brand-orange hover:bg-brand-beige transition-all">
                    <Upload size={28} className="text-brand-orange" />
                    <span className="text-sm font-medium text-gray-700">Importer un fichier</span>
                    <span className="text-xs text-brand-gray-soft">PDF, JPG, PNG</span>
                  </button>
                </div>
              )}
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

              {error && <p className="text-sm text-red-500 flex items-center gap-2"><AlertCircle size={14} />{error}</p>}

              <button onClick={analyzeWithGemini} disabled={!file}
                className="w-full bg-brand-orange text-white py-3 rounded-xl font-medium text-sm hover:bg-brand-orange-light disabled:opacity-40 transition-colors">
                Analyser avec Gemini ✨
              </button>
            </div>
          )}

          {/* ANALYZING */}
          {step === "analyzing" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-brand-orange-pale flex items-center justify-center mx-auto mb-4">
                <Loader2 size={28} className="text-brand-orange animate-spin" />
              </div>
              <p className="font-semibold text-gray-800 mb-2">Analyse du ticket…</p>
              <p className="text-sm text-brand-gray-soft">Gemini extrait les données automatiquement</p>
            </div>
          )}

          {/* REVIEW */}
          {step === "review" && (
            <div>
              <div className="flex items-center gap-2 mb-5 p-3 bg-green-50 rounded-xl">
                <CheckCircle size={16} className="text-green-500" />
                <p className="text-sm text-green-700 font-medium">Données extraites — vérifiez et corrigez si besoin</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-brand-gray-soft mb-1 block">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-brand-gray-soft mb-1 block">Catégorie</label>
                    <select value={form.categorie} onChange={e => setForm(f => ({...f, categorie: e.target.value}))} className={inputClass}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-brand-gray-soft mb-1 block">Établissement</label>
                  <input type="text" value={form.societe} onChange={e => setForm(f => ({...f, societe: e.target.value}))} placeholder="Nom de l'établissement" className={inputClass} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-brand-gray-soft mb-1 block">Montant HT</label>
                    <input type="number" step="0.01" value={form.montant_ht} onChange={e => setForm(f => ({...f, montant_ht: e.target.value}))} placeholder="0.00" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-brand-gray-soft mb-1 block">TVA</label>
                    <input type="number" step="0.01" value={form.tva} onChange={e => setForm(f => ({...f, tva: e.target.value}))} placeholder="0.00" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-brand-gray-soft mb-1 block">Montant TTC</label>
                    <input type="number" step="0.01" value={form.montant_ttc} onChange={e => setForm(f => ({...f, montant_ttc: e.target.value}))} placeholder="0.00" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-brand-gray-soft mb-1 block">Description</label>
                  <input type="text" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Objet de la dépense" className={inputClass} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep("capture")} className="flex-1 py-2.5 rounded-xl border border-brand-beige-dark text-sm font-medium text-brand-gray-soft hover:bg-brand-beige">Retour</button>
                <button onClick={saveNote} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-brand-orange text-white text-sm font-medium hover:bg-brand-orange-light disabled:opacity-40 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={14} className="animate-spin" />Sauvegarde…</> : "✓ Enregistrer"}
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">Note de frais enregistrée !</p>
              <p className="text-sm text-brand-gray-soft">La dépense a été ajoutée à vos notes de frais.</p>
            </div>
          )}

          {/* ERROR */}
          {step === "error" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <p className="font-semibold text-gray-800 mb-2">Erreur</p>
              <p className="text-sm text-red-500 mb-5">{error}</p>
              <button onClick={() => setStep("capture")} className="px-5 py-2 rounded-xl bg-brand-orange text-white text-sm font-medium">Réessayer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
