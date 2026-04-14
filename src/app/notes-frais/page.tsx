"use client";
import { useState } from 'react';
import { Camera, RefreshCw, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NotesFraisTable } from '@/components/notes-frais/NotesFraisTable';
import { RecapMensuel } from '@/components/notes-frais/RecapMensuel';
import { useNotesFrais } from '@/hooks/useNotesFrais';
import type { CategorieNotesFrais } from '@/types/note-frais';

const MOIS_COURANT = new Date().toISOString().slice(0, 7);

export default function NotesFraisPage() {
  const router = useRouter();
  const [mois, setMois] = useState(MOIS_COURANT);
  const [categorie, setCategorie] = useState<CategorieNotesFrais | ''>('');
  const [search, setSearch] = useState('');

  const { notes, loading, error, totalTTC, totalTVA, recapParCategorie, refresh } = useNotesFrais({
    mois,
    categorie: categorie || undefined,
    search: search || undefined,
  });

  const handleExportXlsx = async () => {
    const res = await fetch(`/api/notes-frais/export-xlsx?mois=${mois}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-frais-${mois}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Notes de Frais</h1>
          <p className="text-brand-gray-soft mt-1">
            {notes.length} note{notes.length !== 1 ? 's' : ''} · {totalTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl border border-brand-beige-dark hover:bg-brand-beige transition-colors text-brand-gray-soft"
            title="Rafraîchir"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleExportXlsx}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-beige-dark text-brand-gray-soft hover:bg-brand-beige transition-colors text-sm font-medium"
          >
            <Download size={16} /> Excel
          </button>
          <button
            onClick={() => router.push('/notes-frais/capture')}
            className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-brand-orange-dark transition-colors shadow-soft"
          >
            <Camera size={16} /> Capturer un ticket
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="month"
          value={mois}
          onChange={(e) => setMois(e.target.value)}
          className="border border-brand-beige-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
        />
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value as CategorieNotesFrais | '')}
          className="border border-brand-beige-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
        >
          <option value="">Toutes catégories</option>
          <option value="repas">Repas</option>
          <option value="transport">Transport</option>
          <option value="hebergement">Hébergement</option>
          <option value="fournitures">Fournitures</option>
          <option value="kilometrique">Kilométrique</option>
          <option value="telecommunication">Télécommunication</option>
          <option value="autre">Autre</option>
        </select>
        <input
          type="text"
          placeholder="Rechercher une société…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-brand-beige-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 w-56"
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <NotesFraisTable notes={notes} loading={loading} onRefresh={refresh} />
        </div>
        <div>
          <RecapMensuel
            recap={recapParCategorie}
            totalTTC={totalTTC}
            totalTVA={totalTVA}
            mois={mois}
          />
        </div>
      </div>
    </div>
  );
}
