"use client";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function FacturesPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Factures</h1>
          <p className="text-brand-gray-soft mt-1">Gérez vos factures fournisseurs et clients</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-brand-orange-light transition-colors shadow-soft">
          <span>+</span> Nouvelle facture
        </button>
      </div>
      <EmptyState
        title="Aucune facture"
        description="Importez vos factures PDF ou images — Gemini les analysera automatiquement."
        icon={FileText}
        action={{ label: "Importer une facture", href: "#" }}
      />
    </div>
  );
}
