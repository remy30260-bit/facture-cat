"use client";
import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function NotesFraisPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Notes de frais</h1>
          <p className="text-brand-gray-soft mt-1">Capturez vos tickets de caisse en photo</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-brand-orange-light transition-colors shadow-soft">
          <span>📷</span> Capturer un ticket
        </button>
      </div>
      <EmptyState
        title="Aucune note de frais"
        description="Prenez en photo vos tickets et reçus — l'OCR Gemini extraira toutes les informations."
        icon={Receipt}
        action={{ label: "Ajouter un ticket", href: "#" }}
      />
    </div>
  );
}
