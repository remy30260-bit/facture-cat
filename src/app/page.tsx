"use client";
import { FileText, Receipt, TrendingUp, Euro } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function DashboardPage() {
  const stats = [
    { label: "Factures ce mois", value: "0", icon: FileText, color: "orange" as const },
    { label: "Total HT", value: "0,00 €", icon: Euro, color: "green" as const },
    { label: "Notes de frais", value: "0", icon: Receipt, color: "blue" as const },
    { label: "TVA collectée", value: "0,00 €", icon: TrendingUp, color: "purple" as const },
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
          title="Aucune facture récente"
          description="Importez votre première facture pour commencer la comptabilité automatique."
          icon={FileText}
          action={{ label: "Importer une facture", href: "/factures" }}
        />
        <EmptyState
          title="Aucune note de frais"
          description="Prenez en photo vos tickets de caisse pour les enregistrer automatiquement."
          icon={Receipt}
          action={{ label: "Ajouter une note de frais", href: "/notes-frais" }}
        />
      </div>
    </div>
  );
}
