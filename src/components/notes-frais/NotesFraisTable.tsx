"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, FileDown, Trash2, CheckCircle, Clock, BookOpen } from 'lucide-react';
import type { NoteFrais, CategorieNotesFrais } from '@/types/note-frais';

const CATEGORIE_LABELS: Record<CategorieNotesFrais, string> = {
  repas:             'Repas',
  transport:         'Transport',
  hebergement:       'Hébergement',
  fournitures:       'Fournitures',
  kilometrique:      'Kilométrique',
  telecommunication: 'Télécommunication',
  autre:             'Autre',
};

const CATEGORIE_COLORS: Record<CategorieNotesFrais, string> = {
  repas:             'bg-orange-100 text-orange-700',
  transport:         'bg-blue-100 text-blue-700',
  hebergement:       'bg-purple-100 text-purple-700',
  fournitures:       'bg-green-100 text-green-700',
  kilometrique:      'bg-yellow-100 text-yellow-700',
  telecommunication: 'bg-cyan-100 text-cyan-700',
  autre:             'bg-gray-100 text-gray-600',
};

function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    brouillon:    { label: 'Brouillon',    icon: <Clock size={12} />,        cls: 'bg-yellow-100 text-yellow-700' },
    valide:       { label: 'Validé',       icon: <CheckCircle size={12} />,  cls: 'bg-green-100 text-green-700' },
    comptabilise: { label: 'Comptabilisé', icon: <BookOpen size={12} />,     cls: 'bg-blue-100 text-blue-700' },
  };
  const s = map[statut] ?? map.brouillon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

interface Props {
  notes: NoteFrais[];
  loading: boolean;
  onRefresh: () => void;
  onDelete?: (id: string) => void;
}

export function NotesFraisTable({ notes, loading, onRefresh, onDelete }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette note de frais ?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/notes-frais/${id}`, { method: 'DELETE' });
      onDelete?.(id);
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportPdf = async (id: string) => {
    const res = await fetch('/api/notes-frais/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `note-frais-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-brand-beige animate-pulse" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🧾</div>
        <p className="text-gray-600 font-medium">Aucune note de frais</p>
        <p className="text-sm text-brand-gray-soft mt-1">Utilisez la caméra pour ajouter votre premier ticket.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-beige-dark">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-brand-beige text-brand-gray text-left">
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Société</th>
            <th className="px-4 py-3 font-semibold">Catégorie</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 font-semibold text-right">Montant TTC</th>
            <th className="px-4 py-3 font-semibold">Statut</th>
            <th className="px-4 py-3 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-beige-dark">
          {notes.map((note) => (
            <tr
              key={note.id}
              className="bg-white hover:bg-brand-beige/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/notes-frais/${note.id}`)}
            >
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {new Date(note.date_frais).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-4 py-3 font-medium text-gray-800">{note.societe}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORIE_COLORS[note.categorie]}`}>
                  {CATEGORIE_LABELS[note.categorie]}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{note.description ?? '—'}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-800 tabular-nums">
                {note.montant_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </td>
              <td className="px-4 py-3">
                <StatutBadge statut={note.statut} />
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => router.push(`/notes-frais/${note.id}`)}
                    className="p-1.5 rounded-lg hover:bg-brand-beige text-brand-gray-soft hover:text-brand-orange transition-colors"
                    title="Voir le détail"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => handleExportPdf(note.id)}
                    className="p-1.5 rounded-lg hover:bg-brand-beige text-brand-gray-soft hover:text-brand-orange transition-colors"
                    title="Exporter PDF"
                  >
                    <FileDown size={15} />
                  </button>
                  {note.statut !== 'comptabilise' && (
                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={deletingId === note.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-brand-gray-soft hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
