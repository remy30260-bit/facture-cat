import { clsx } from "clsx";
import type { Facture } from "@/types";

const CONFIG = {
  brouillon:    { label: "Brouillon",      classes: "bg-gray-100 text-gray-600" },
  valide:       { label: "Validée",        classes: "bg-blue-50 text-blue-600" },
  comptabilise: { label: "Comptabilisée", classes: "bg-green-50 text-green-600" },
  rembourse:    { label: "Remboursée",     classes: "bg-purple-50 text-purple-600" },
} as const;

export function FactureStatusBadge({ statut }: { statut: Facture["statut"] }) {
  const cfg = CONFIG[statut] ?? CONFIG.brouillon;
  return (
    <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", cfg.classes)}>
      {cfg.label}
    </span>
  );
}
