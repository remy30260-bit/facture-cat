"use client";
import type { NoteFrais, CategorieNotesFrais, RecapMensuelItem } from '@/types/note-frais';

const CATEGORIE_LABELS: Record<CategorieNotesFrais, string> = {
  repas:             'Repas',
  transport:         'Transport',
  hebergement:       'Hébergement',
  fournitures:       'Fournitures',
  kilometrique:      'Kilométrique',
  telecommunication: 'Télécommunication',
  autre:             'Autre',
};

interface Props {
  recap: RecapMensuelItem[];
  totalTTC: number;
  totalTVA: number;
  mois: string; // 'YYYY-MM'
}

function formatEur(val: number) {
  return val.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function RecapMensuel({ recap, totalTTC, totalTVA, mois }: Props) {
  const moisLabel = new Date(`${mois}-01`).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-brand-beige-dark overflow-hidden">
      <div className="px-6 py-4 border-b border-brand-beige-dark bg-brand-beige/40">
        <h3 className="font-semibold text-gray-800">Récap — {moisLabel}</h3>
      </div>
      <div className="divide-y divide-brand-beige-dark">
        {recap.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-brand-gray-soft">Aucune note ce mois-ci</p>
        ) : (
          recap.map((item) => (
            <div key={item.categorie} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{CATEGORIE_LABELS[item.categorie]}</p>
                <p className="text-xs text-brand-gray-soft">{item.count} note{item.count > 1 ? 's' : ''}</p>
              </div>
              <p className="tabular-nums font-semibold text-gray-800">{formatEur(item.total_ttc)}</p>
            </div>
          ))
        )}
      </div>
      <div className="px-6 py-4 border-t border-brand-beige-dark bg-brand-beige/40 space-y-1.5">
        <div className="flex justify-between text-sm text-brand-gray-soft">
          <span>TVA récupérable</span>
          <span className="tabular-nums">{formatEur(totalTVA)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-800">
          <span>Total TTC</span>
          <span className="tabular-nums text-brand-orange">{formatEur(totalTTC)}</span>
        </div>
      </div>
    </div>
  );
}
