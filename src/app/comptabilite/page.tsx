"use client";
import { useState, useEffect, useCallback } from "react";
import { BookOpen, RefreshCw, CheckCircle, Clock, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clsx } from "clsx";
import { formatEur, formatDate } from "@/lib/utils";

type Ecriture = {
  id: string;
  date_ecriture: string;
  numero_piece: string | null;
  compte_debit: string;
  compte_credit: string;
  libelle: string;
  montant: number;
  facture_id: string | null;
  statut: "brouillon" | "valide";
  created_at: string;
};

export default function ComptabilitePage() {
  const [ecritures, setEcritures] = useState<Ecriture[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEcritures = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("ecritures_comptables")
      .select("*")
      .order("date_ecriture", { ascending: false });
    if (data) setEcritures(data as Ecriture[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEcritures(); }, [fetchEcritures]);

  const filtered = ecritures.filter(e =>
    !search ||
    e.libelle.toLowerCase().includes(search.toLowerCase()) ||
    e.compte_debit.includes(search) ||
    e.compte_credit.includes(search)
  );

  const totalDebit  = filtered.reduce((s, e) => s + e.montant, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Comptabilité</h1>
          <p className="text-brand-gray-soft mt-1">{ecritures.length} écriture{ecritures.length !== 1 ? "s" : ""} comptable{ecritures.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={fetchEcritures} className="p-2.5 rounded-xl border border-brand-beige-dark hover:bg-brand-beige transition-colors text-brand-gray-soft">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total mouvements", value: formatEur(totalDebit), color: "text-brand-orange" },
          { label: "Écritures validées", value: String(filtered.filter(e => e.statut === "valide").length), color: "text-green-600" },
          { label: "Brouillons", value: String(filtered.filter(e => e.statut === "brouillon").length), color: "text-gray-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-brand-beige-dark shadow-card">
            <p className="text-xs text-brand-gray-soft mb-2">{s.label}</p>
            <p className={clsx("text-xl font-bold tabular-nums", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-brand-beige-dark overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-beige-dark flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-soft" />
            <input type="text" placeholder="Rechercher par libellé, compte…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-brand-beige-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/30 bg-brand-off-white" />
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-brand-beige animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-orange-pale flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-brand-orange" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Aucune écriture comptable</h3>
            <p className="text-sm text-brand-gray-soft max-w-xs">Les écritures sont générées automatiquement quand vous comptabilisez une facture.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-beige-dark">
                  {["Date", "N° Pièce", "Compte débit", "Compte crédit", "Libellé", "Montant", "Statut"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-brand-gray-soft px-5 py-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-brand-off-white transition-colors">
                    <td className="px-5 py-3 text-sm text-brand-gray-soft">{formatDate(e.date_ecriture)}</td>
                    <td className="px-5 py-3 text-sm font-mono text-gray-600">{e.numero_piece || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-sm bg-brand-orange-pale text-brand-orange px-2 py-0.5 rounded-lg">{e.compte_debit}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-sm bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg">{e.compte_credit}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700 max-w-[200px] truncate">{e.libelle}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-800 tabular-nums">{formatEur(e.montant)}</td>
                    <td className="px-5 py-3">
                      <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        e.statut === "valide" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600")}>
                        {e.statut === "valide" ? <CheckCircle size={11} /> : <Clock size={11} />}
                        {e.statut === "valide" ? "Validée" : "Brouillon"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
