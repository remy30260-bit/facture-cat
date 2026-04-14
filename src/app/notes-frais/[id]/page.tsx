"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { NotesFraisDetail } from '@/components/notes-frais/NotesFraisDetail';
import { Loader2 } from 'lucide-react';
import type { NoteFrais } from '@/types/note-frais';

export default function NotesFraisDetailPage({ params }: { params: { id: string } }) {
  const [note, setNote] = useState<NoteFrais | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('notes_frais')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setNote(data as NoteFrais);
      }
      setLoading(false);
    };

    fetchNote();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-brand-orange" />
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className="p-8 text-center">
        <p className="text-2xl mb-2">🔍</p>
        <p className="text-gray-600 font-medium">Note de frais introuvable</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <NotesFraisDetail note={note} onUpdate={setNote} />
    </div>
  );
}
