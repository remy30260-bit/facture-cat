"use client";
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, FileDown, BookOpen, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { NoteFrais, CategorieNotesFrais } from '@/types/note-frais';

const CATEGORIES: { value: CategorieNotesFrais; label: string }[] = [
  { value: 'repas',             label: 'Repas' },
  { value: 'transport',         label: 'Transport' },
  { value: 'hebergement',       label: 'Hébergement' },
  { value: 'fournitures',       label: 'Fournitures' },
  { value: 'kilometrique',      label: 'Kilométrique' },
  { value: 'telecommunication', label: 'Télécommunication' },
  { value: 'autre',             label: 'Autre' },
];

interface Props {
  note: NoteFrais;
  onUpdate: (updated: NoteFrais) => void;
}

export function NotesFraisDetail({ note, onUpdate }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ ...note });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof NoteFrais, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notes_frais')
      .update({
        date_frais:      form.date_frais,
        societe:         form.societe,
        categorie:       form.categorie,
        description:     form.description,
        montant_ht:      form.montant_ht,
        montant_tva:     form.montant_tva,
        montant_ttc:     form.montant_ttc,
        tva_recuperable: form.tva_recuperable,
        km:              form.km,
        puissance_fiscale: form.puissance_fiscale,
        statut:          'valide',
      })
      .eq('id', note.id)
      .select()
      .single();

    setSaving(false);
    if (!error && data) {
      onUpdate(data as NoteFrais);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleExportPdf = async () => {
    const res = await fetch('/api/notes-frais/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: note.id }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.fichier_nom ?? 'note-frais'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isKm = form.categorie === 'kilometrique';
  const readonly = note.statut === 'comptabilise';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-brand-beige-dark hover:bg-brand-beige transition-colors text-brand-gray-soft"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">{note.fichier_nom ?? 'Note de frais'}</h2>
        {note.statut === 'comptabilise' && (
          <span className="ml-auto flex items-center gap-1.5 text-blue-600 text-sm font-medium">
            <BookOpen size={14} /> Comptabilisé
          </span>
        )}
      </div>

      {/* Layout côte à côte : fichier | formulaire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aperçu fichier */}
        {note.fichier_url && (
          <div className="rounded-2xl border border-brand-beige-dark overflow-hidden bg-brand-beige/30">
            {note.fichier_url.match(/\.(jpg|jpeg|png)$/i) ? (
              <img src={note.fichier_url} alt="Ticket" className="w-full object-contain max-h-[500px]" />
            ) : (
              <iframe src={note.fichier_url} className="w-full h-[500px]" title="Ticket PDF" />
            )}
          </div>
        )}

        {/* Formulaire */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-brand-gray-soft uppercase tracking-wide">Date</span>
              <input
                type="date"
                value={form.date_frais}
                disabled={readonly}
                onChange={(e) => set('date_frais', e.target.value)}
                className="border border-brand-beige-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 disabled:bg-gray-50"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-brand-gray-soft uppercase tracking-wide">Société</span>
              <input
                type="text"
                value={form.societe}
                disabled={readonly}
                onChange={(e) => set('societe', e.target.value)}
                className="border border-brand-beige-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 disabled:bg-gray-50"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-brand-gray-soft uppercase tracking-wide">Catégorie</span>
            <select
              value={form.categorie}
              disabled={readonly}
              onChange={(e) => set('categorie', e.target.value as CategorieNotesFrais)}
              className="border border-brand-beige-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 disabled:bg-gray-50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-brand-gray-soft uppercase tracking-wide">Description</span>
            <input
              type="text"
              value={form.description ?? ''}
              disabled={readonly}
              onChange={(e) => set('description', e.target.value)}
              className="border border-brand-beige-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 disabled:bg-gray-50"
            />
          </label>

          {isKm ? (
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-brand-gray-soft uppercase tracking-wide">Kilomètres</span>
                <input
                  type="number"
                  step="0.1"
                  value={form.km ?? ''}
                  disabled={readonly}
                  onChange={(e) => set('km', parseFloat(e.target.value))}
                  className="border border-brand-beige-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 disabled:bg-gray-50"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-brand-gray-soft uppercase tracking-wide">Puissance (CV)</span>
                <input
                  type="number"
                  min="3"
                  max="7"
                  value={form.puissance_fiscale ?? ''}
                  disabled={readonly}
                  onChange={(e) => set('puissance_fiscale', parseInt(e.target.value))}
                  className="border border-brand-beige-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 disabled:bg-gray-50"
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {(['montant_ht', 'montant_tva', 'montant_ttc'] as const).map((field) => (
                <label key={field} className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-brand-gray-soft uppercase tracking-wide">
                    {field === 'montant_ht' ? 'HT (€)' : field === 'montant_tva' ? 'TVA (€)' : 'TTC (€)'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={form[field] ?? ''}
                    disabled={readonly}
                    onChange={(e) => set(field, parseFloat(e.target.value))}
                    className="border border-brand-beige-dark rounded-xl px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-orange/40 disabled:bg-gray-50"
                  />
                </label>
              ))}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.tva_recuperable}
              disabled={readonly}
              onChange={(e) => set('tva_recuperable', e.target.checked)}
              className="rounded accent-brand-orange"
            />
            TVA récupérable
          </label>

          {!readonly && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-brand-orange-dark transition-colors shadow-soft disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
                {saved ? 'Enregistré !' : 'Valider'}
              </button>
              <button
                onClick={handleExportPdf}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-beige-dark text-brand-gray-soft hover:bg-brand-beige transition-colors text-sm font-medium"
              >
                <FileDown size={15} /> PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
