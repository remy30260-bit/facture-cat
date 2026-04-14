"use client";
import { useState, useEffect } from "react";
import { FileText, Receipt, TrendingUp, Euro } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { createClient } from "@/lib/supabase/client";
import type { Facture, NoteFrais } from "@/types";

export default function DashboardPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [notes, setNotes] = useState<NoteFrais[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    supabase.from("factures").select("*").gte("date_facture", startOfMonth).then(({ data }) => {
      if (data) setFactures(data as Facture[]);
    });
    supabase.from("notes_frais").select("*").gte("date_frais", startOfMonth).then(({ data }) => {
      if (data) setNotes(data as NoteFrais[]);
    });
  }, []);

  const totalHT  = factures.reduce((s, f) => s + f.montant_ht,  0);
  const totalTVA = factures.reduce((s, f) => s + f.montant_tva, 0);
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

  const stats = [
    { label: "Factures ce mois", value: String(factures.length),   icon: FileText,    color: "orange"  as const },
    { label: "Total HT",         value: fmt(totalHT),              icon: Euro,        color: "green"   as const },
    { label: "Notes de frais",   value: String(notes.length),      icon: Receipt,     color: "blue"    as const },
    { label: "TVA collectée",    value: fmt(totalTVA),             icon: TrendingUp,  color: "purple"  as const },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Bonjour 👋</h1>
        <p className="text-brand-gray-soft mt-1">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmptyState
          title={factures.length === 0 ? "Aucune facture ce mois" : `${factures.length} facture${factures.length > 1 ? "s" : ""} ce mois`}
          description="Importez vos factures pour une comptabilité automatique avec Gemini."
          icon={FileText}
          action={{ label: "Gérer les factures", href: "/factures" }}
        />
        <EmptyState
          title={notes.length === 0 ? "Aucune note de frais" : `${notes.length} note${notes.length > 1 ? "s" : ""} de frais`}
          description="Prenez en photo vos tickets de caisse pour les enregistrer automatiquement."
          icon={Receipt}
          action={{ label: "Ajouter une note de frais", href: "/notes-frais" }}
        />
      </div>
    </div>
  );
}
