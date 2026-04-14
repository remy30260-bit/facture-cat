"use client";
import { useState } from "react";
import { FileText, ExternalLink, CheckCircle, Clock, BookOpen, MoreHorizontal, Search } from "lucide-react";
import type { Facture } from "@/types";
import { clsx } from "clsx";

const STATUT_CONFIG = {
  brouillon:     { label: "Brouillon",      color: "bg-gray-100 text-gray-600",         icon: Clock },
  valide:        { label: "Validée",        color: "bg-blue-50 text-blue-600",          icon: CheckCircle },
  comptabilise:  { label: "Comptabilisée", color: "bg-green-50 text-green-600",        icon: BookOpen },
  rembourse:     { label: "Remboursée",     color: "bg-purple-50 text-purple-600",      icon: CheckCircle },
} as const;

function StatutBadge({ statut }: { statut: Facture["statut"] }) {
  const cfg = STATUT_CONFIG[statut] ?? STATUT_CONFIG.brouillon;
  const Icon = cfg.icon;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", cfg.color)}>
      <Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function formatEur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

interface Props { factures: Facture[]; loading: boolean; onRefresh: () => void; }

export function FacturesTable({ factures, loading, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("all");

  const filtered = factures.filter(f => {
    const matchSearch = !search || f.societe.toLowerCase().includes(search.toLowerCase()) || (f.numero_facture || "").toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "all" || f.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  if (loading) return (
    <div className="bg-white rounded-2xl border border-brand-beige-dark p-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-beige animate-pulse" />
          <div className="flex-1 h-4 rounded bg-brand-beige animate-pulse" />
          <div className="w-24 h-4 rounded bg-brand-beige animate-pulse" />
          <div className="w-20 h-6 rounded-full bg-brand-beige animate-pulse" />
        </div>
      ))}
    </div>
  );

  if (factures.length === 0) return (
    <div className="bg-white rounded-2xl border border-brand-beige-dark p-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-orange-pale flex items-center justify-center mb-4">
        <FileText size={24} className="text-brand-orange" strokeWidth={1.5} />
      </div>
      <h3 className="font-semibold text-gray-800 mb-2">Aucune facture</h3>
      <p className="text-sm text-brand-gray-soft max-w-xs">Importez votre première facture — Gemini extraira automatiquement toutes les données.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-brand-beige-dark overflow-hidden">
      {/* Filtres */}
      <div className="px-5 py-4 border-b border-brand-beige-dark flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-soft" />
          <input
            type="text"
            placeholder="Rechercher par fournisseur, numéro…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-brand-beige-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-brand-off-white"
          />
        </div>
        <select
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
          className="text-sm border border-brand-beige-dark rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 bg-brand-off-white text-brand-gray-soft"
        >
          <option value="all">Tous les statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="valide">Validée</option>
          <option value="comptabilise">Comptabilisée</option>
          <option value="rembourse">Remboursée</option>
        </select>
        <span className="text-xs text-brand-gray-soft">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-beige-dark">
              {["Fournisseur", "Date", "N° Facture", "Montant HT", "TVA", "TTC", "Statut", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-brand-gray-soft px-5 py-3 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-beige">
            {filtered.map((f) => (
              <tr key={f.id} className="hover:bg-brand-off-white transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-orange-pale flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-brand-orange" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 truncate max-w-[160px]">{f.societe}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-brand-gray-soft">{formatDate(f.date_facture)}</td>
                <td className="px-5 py-3.5 text-sm text-brand-gray-soft font-mono">{f.numero_facture || "—"}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-gray-700 tabular-nums">{formatEur(f.montant_ht)}</td>
                <td className="px-5 py-3.5 text-sm text-brand-gray-soft tabular-nums">{formatEur(f.montant_tva)}</td>
                <td className="px-5 py-3.5 text-sm font-semibold text-gray-800 tabular-nums">{formatEur(f.montant_ttc)}</td>
                <td className="px-5 py-3.5"><StatutBadge statut={f.statut} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {f.fichier_url && (
                      <a href={f.fichier_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-brand-beige text-brand-gray-soft hover:text-brand-orange transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button className="p-1.5 rounded-lg hover:bg-brand-beige text-brand-gray-soft hover:text-gray-800 transition-colors">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer totaux */}
      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-brand-beige-dark bg-brand-off-white flex items-center justify-end gap-6">
          <span className="text-xs text-brand-gray-soft">Total HT :</span>
          <span className="text-sm font-semibold text-gray-800 tabular-nums">
            {formatEur(filtered.reduce((s, f) => s + f.montant_ht, 0))}
          </span>
          <span className="text-xs text-brand-gray-soft">Total TTC :</span>
          <span className="text-sm font-bold text-brand-orange tabular-nums">
            {formatEur(filtered.reduce((s, f) => s + f.montant_ttc, 0))}
          </span>
        </div>
      )}
    </div>
  );
}
