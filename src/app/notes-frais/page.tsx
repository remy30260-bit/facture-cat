"use client";
import { useState } from "react";
import { Plus, RefreshCw, Receipt } from "lucide-react";
import { CaptureNoteModal } from "@/components/notes-frais/CaptureNoteModal";
import { NotesFraisTable } from "@/components/notes-frais/NotesFraisTable";
import { useNotesFrais } from "@/hooks/useNotesFrais";

export default function NotesFraisPage() {
  const { notes, loading, refetch } = useNotesFrais();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Notes de frais</h1>
          <p className="text-brand-gray-soft mt-1">
            {notes.length} note{notes.length !== 1 ? "s" : ""} de frais
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refetch}
            className="p-2.5 rounded-xl border border-brand-beige-dark hover:bg-brand-beige transition-colors text-brand-gray-soft">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-brand-orange-light transition-colors shadow-soft">
            <Plus size={16} /> Capturer un ticket
          </button>
        </div>
      </div>

      <NotesFraisTable notes={notes} loading={loading} onRefresh={refetch} />

      {showModal && (
        <CaptureNoteModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); refetch(); }}
        />
      )}
    </div>
  );
}
