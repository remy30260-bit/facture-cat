"use client";
import { useState, useCallback, useRef } from "react";
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Step = "upload" | "analyzing" | "review" | "success" | "error";

interface OcrResult {
  date?: string;
  societe?: string;
  montant_ttc?: number;
  montant_ht?: number;
  tva?: number;
  numero_facture?: string;
  description?: string;
}

export function UploadFactureModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Form state (éditable après OCR)
  const [form, setForm] = useState({
    date: "", societe: "", montant_ttc: "", montant_ht: "", tva: "", numero_facture: "", description: ""
  });

  const handleFile = (f: File) => {
    if (!f.type.match(/(pdf|image)/)) {
      setError("Format non supporté. Utilisez PDF, JPG ou PNG.");
      return;
    }
    setFile(f);
    setError("");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
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
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-facture`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur OCR");

      const ocr: OcrResult = data.ocrResult || {};
      setOcrResult(ocr);
      setForm({
        date: ocr.date || new Date().toISOString().split("T")[0],
        societe: ocr.societe || "",
        montant_ttc: ocr.montant_ttc?.toString() || "",
        montant_ht: ocr.montant_ht?.toString() || "",
        tva: ocr.tva?.toString() || "",
        numero_facture: ocr.numero_facture || "",
        description: ocr.description || "",
      });
      setStep("review");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setStep("error");
    }
  };

  const saveFacture = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const fd = new FormData();
      fd.append("file", file);
      fd.append("save", "true");
      // Surcharger les données OCR avec les données du formulaire
      fd.append("overrides", JSON.stringify(form));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-facture`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        }
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

  const fieldClass = "w-full border border-brand-beige-dark rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-beige-dark">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-orange-pale flex items-center justify-center">
              <FileText size={16} className="text-brand-orange" />
            </div>
            <h2 className="font-semibold text-gray-800">Importer une facture</h2>
          </div>
          <button onClick={onClose} className="text-brand-gray-soft hover:text-gray-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* STEP: upload */}
          {step === "upload" && (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  dragging ? "border-brand-orange bg-brand-orange-pale" : "border-brand-beige-dark hover:border-brand-orange hover:bg-brand-beige"
                }`}
              >
                <Upload size={32} className="text-brand-orange mx-auto mb-3" />
                <p className="font-medium text-gray-700 mb-1">Glissez votre facture ici</p>
                <p className="text-sm text-brand-gray-soft">ou cliquez pour parcourir</p>
                <p className="text-xs text-brand-gray-soft mt-2">PDF, JPG, PNG — max 10 Mo</p>
                <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>

              {file && (
                <div className="mt-4 flex items-center justify-between p-3 bg-brand-beige rounded-xl">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-brand-orange" />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[250px]">{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-brand-gray-soft hover:text-gray-800"><X size={14} /></button>
                </div>
              )}

              {error && <p className="mt-3 text-sm text-red-500 flex items-center gap-2"><AlertCircle size={14} />{error}</p>}

              <button
                onClick={analyzeWithGemini}
                disabled={!file}
                className="mt-5 w-full bg-brand-orange text-white py-3 rounded-xl font-medium text-sm hover:bg-brand-orange-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Analyser avec Gemini ✨
              </button>
            </div>
          )}

          {/* STEP: analyzing */}
          {step === "analyzing" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-brand-orange-pale flex items-center justify-center mx-auto mb-4">
                <Loader2 size={28} className="text-brand-orange animate-spin" />
              </div>
              <p className="font-semibold text-gray-800 mb-2">Analyse en cours…</p>
              <p className="text-sm text-brand-gray-soft">Gemini 2.5 Flash extrait les données de votre facture</p>
            </div>
          )}

          {/* STEP: review */}
          {step === "review" && (
            <div>
              <div className="flex items-center gap-2 mb-5 p-3 bg-green-50 rounded-xl">
                <CheckCircle size={16} className="text-green-500" />
                <p className="text-sm text-green-700 font-medium">Données extraites par Gemini — vérifiez et corrigez si besoin</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-brand-gray-soft mb-1 block">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} className={fieldClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-brand-gray-soft mb-1 block">N° Facture</label>
                    <input type="text" value={form.numero_facture} onChange={e => setForm(f => ({...f, numero_facture: e.target.value}))} placeholder="FA-2024-001" className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-brand-gray-soft mb-1 block">Fournisseur</label>
                  <input type="text" value={form.societe} onChange={e => setForm(f => ({...f, societe: e.target.value}))} placeholder="Nom du fournisseur" className={fieldClass} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-brand-gray-soft mb-1 block">Montant HT</label>
                    <input type="number" step="0.01" value={form.montant_ht} onChange={e => setForm(f => ({...f, montant_ht: e.target.value}))} placeholder="0.00" className={fieldClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-brand-gray-soft mb-1 block">TVA</label>
                    <input type="number" step="0.01" value={form.tva} onChange={e => setForm(f => ({...f, tva: e.target.value}))} placeholder="0.00" className={fieldClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-brand-gray-soft mb-1 block">Montant TTC</label>
                    <input type="number" step="0.01" value={form.montant_ttc} onChange={e => setForm(f => ({...f, montant_ttc: e.target.value}))} placeholder="0.00" className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-brand-gray-soft mb-1 block">Description</label>
                  <input type="text" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Objet de la facture" className={fieldClass} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep("upload")} className="flex-1 py-2.5 rounded-xl border border-brand-beige-dark text-sm font-medium text-brand-gray-soft hover:bg-brand-beige transition-colors">Retour</button>
                <button onClick={saveFacture} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-brand-orange text-white text-sm font-medium hover:bg-brand-orange-light disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Sauvegarde…</> : "✓ Enregistrer la facture"}
                </button>
              </div>
            </div>
          )}

          {/* STEP: success */}
          {step === "success" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">Facture enregistrée !</p>
              <p className="text-sm text-brand-gray-soft">La facture a été ajoutée à votre comptabilité.</p>
            </div>
          )}

          {/* STEP: error */}
          {step === "error" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <p className="font-semibold text-gray-800 mb-2">Une erreur est survenue</p>
              <p className="text-sm text-red-500 mb-5">{error}</p>
              <button onClick={() => setStep("upload")} className="px-5 py-2 rounded-xl bg-brand-orange text-white text-sm font-medium hover:bg-brand-orange-light">Réessayer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
