"use client";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function ComptabilitePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Comptabilité</h1>
        <p className="text-brand-gray-soft mt-1">Écritures comptables générées automatiquement</p>
      </div>
      <EmptyState
        title="Aucune écriture comptable"
        description="Les écritures sont générées automatiquement dès que vous comptabilisez une facture."
        icon={BookOpen}
        action={{ label: "Voir les factures", href: "/factures" }}
      />
    </div>
  );
}
