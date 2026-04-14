"use client";
import { Receipt, ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import type { NoteFrais } from "@/types";
import { clsx } from "clsx";
import { formatEur, formatDate } from "@/lib/utils";

const CATEGORIE_LABELS: Record<string, string> = {
  repas: "🍽️ Repas", transport: "🚗 Transport", hebergement: "🏨 Hébergement",
  fournitures: "📦 Fournitures", telecommunication: "📱 Télécom", autre: "📎 Autre",
};

const STATUT_CONFIG = {
  brouillon:    { label: "Brouillon",     color: "bg-gray-100 text-gray-600" },
  valide:       { label: "Validée",       color: "bg-blue-50 text-blue-600" },
  comptabilise: { label: "Comptabilisée", color: "bg-green-50 text-green-600" },
} as const;

interface Props { notes: NoteFrais[]; loading: boolean; onRefresh: () => void; }

export function NotesFraisTable({ notes, loading, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const filtered = notes.filter(n => {
    const matchSearch = !search || n.societe.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || n.categorie === filterCat;
    return matchSearch && matchCat;
  });

  if (loading) return (
    <div className="bg-white rounded-2xl border border-brand-beige-dark p-8 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-brand-beige animate-pulse" />
          <div className="flex-1 h-4 rounded bg-brand-beige animate-pulse" />
          <div className="w-20 h-4 rounded bg-brand-beige animate-pulse" />
        </div>
      ))}
    </div>
  );

  if (notes.length === 0) return (
    <div className="bg-white rounded-2xl border border-brand-beige-dark p-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-orange-pale flex items-center justify-center mb-4">
        <Receipt size={24} className="text-brand-orange" strokeWidth={1.5} />
      </div>
      <h3 className="font-semibold text-gray-800 mb-2">Aucune note de frais</h3>
      <p className="text-sm text-brand-gray-soft max-w-xs">Prenez en photo vos tickets — l'OCR Gemini extraira toutes les informations.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-brand-beige-dark overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-beige-dark flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-soft" />
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-brand-beige-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 bg-brand-off-white" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="text-sm border border-brand-beige-dark rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 bg-brand-off-white text-brand-gray-soft">
          <option value="all">Toutes catégories</option>
          {Object.entries(CATEGORIE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="text-xs text-brand-gray-soft">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-beige-dark">
              {["Établissement", "Date", "Catégorie", "Montant HT", "TVA", "TTC", "Statut", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-brand-gray-soft px-5 py-3 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-beige">
            {filtered.map(n => (
              <tr key={n.id} className="hover:bg-brand-off-white transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-orange-pale flex items-center justify-center flex-shrink-0 text-sm">
                      {CATEGORIE_LABELS[n.categorie]?.split(" ")[0] ?? "📎"}
                    </div>
                    <span className="text-sm font-medium text-gray-800 truncate max-w-[140px]">{n.societe}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-brand-gray-soft">{formatDate(n.date_frais)}</td>
                <td className="px-5 py-3.5 text-sm text-brand-gray-soft">{CATEGORIE_LABELS[n.categorie] ?? n.categorie}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-gray-700 tabular-nums">{formatEur(n.montant_ht)}</td>
                <td className="px-5 py-3.5 text-sm text-brand-gray-soft tabular-nums">{formatEur(n.montant_tva)}</td>
                <td className="px-5 py-3.5 text-sm font-semibold text-gray-800 tabular-nums">{formatEur(n.montant_ttc)}</td>
                <td className="px-5 py-3.5">
                  <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium",
                    STATUT_CONFIG[n.statut as keyof typeof STATUT_CONFIG]?.color ?? "bg-gray-100 text-gray-600")}>
                    {STATUT_CONFIG[n.statut as keyof typeof STATUT_CONFIG]?.label ?? n.statut}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {n.fichier_url && (
                    <a href={n.fichier_url} target="_blank" rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-brand-beige text-brand-gray-soft hover:text-brand-orange transition-all inline-flex">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-brand-beige-dark bg-brand-off-white flex items-center justify-end gap-6">
          <span className="text-xs text-brand-gray-soft">Total HT :</span>
          <span className="text-sm font-semibold text-gray-800 tabular-nums">{formatEur(filtered.reduce((s, n) => s + n.montant_ht, 0))}</span>
          <span className="text-xs text-brand-gray-soft">Total TTC :</span>
          <span className="text-sm font-bold text-brand-orange tabular-nums">{formatEur(filtered.reduce((s, n) => s + n.montant_ttc, 0))}</span>
        </div>
      )}
    </div>
  );
}
