"use client";
import { useState, useEffect } from "react";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { UploadFactureModal } from "@/components/factures/UploadFactureModal";
import { FacturesTable } from "@/components/factures/FacturesTable";
import { createClient } from "@/lib/supabase/client";
import type { Facture } from "@/types";

export default function FacturesPage() {
  const [showModal, setShowModal] = useState(false);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFactures = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("factures")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setFactures(data as Facture[]);
    setLoading(false);
  };

  useEffect(() => { fetchFactures(); }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Factures</h1>
          <p className="text-sm mt-1" style={{ color: '#6b6a8a' }}>
            {factures.length} facture{factures.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFactures}
            className="p-2.5 rounded-xl transition-colors"
            style={{ border: '1px solid #2d2b55', color: '#8b8aad', background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.1)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            title="Rafraîchir"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white transition-colors"
            style={{ background: '#7c3aed' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#6d28d9'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#7c3aed'}
          >
            <Plus size={16} /> Importer une facture
          </button>
        </div>
      </div>

      <FacturesTable factures={factures} loading={loading} onRefresh={fetchFactures} />

      {showModal && (
        <UploadFactureModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchFactures(); }}
        />
      )}
    </div>
  );
}
