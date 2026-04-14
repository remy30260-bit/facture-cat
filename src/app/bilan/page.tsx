"use client";
import { BarChart2 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function BilanPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Bilan / Liasse fiscale</h1>
        <p className="text-brand-gray-soft mt-1">Bilan comptable et préparation de la liasse fiscale</p>
      </div>
      <EmptyState
        title="Bilan non disponible"
        description="Le bilan sera généré automatiquement une fois vos premières écritures comptables enregistrées."
        icon={BarChart2}
        action={{ label: "Commencer la comptabilité", href: "/comptabilite" }}
      />
    </div>
  );
}
