"use client";
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { NoteFrais, CategorieNotesFrais, RecapMensuelItem } from '@/types/note-frais';

interface Filters {
  mois?: string;        // 'YYYY-MM'
  categorie?: CategorieNotesFrais;
  statut?: string;
  search?: string;
}

export function useNotesFrais(filters: Filters = {}) {
  const [notes, setNotes] = useState<NoteFrais[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      let query = supabase
        .from('notes_frais')
        .select('*')
        .order('date_frais', { ascending: false });

      if (filters.mois) {
        const debut = `${filters.mois}-01`;
        const fin = new Date(new Date(debut).setMonth(new Date(debut).getMonth() + 1) - 1)
          .toISOString()
          .split('T')[0];
        query = query.gte('date_frais', debut).lte('date_frais', fin);
      }

      if (filters.categorie) {
        query = query.eq('categorie', filters.categorie);
      }

      if (filters.statut) {
        query = query.eq('statut', filters.statut);
      }

      if (filters.search) {
        query = query.ilike('societe', `%${filters.search}%`);
      }

      const { data, error: supabaseError } = await query;
      if (supabaseError) throw supabaseError;
      setNotes((data as NoteFrais[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [filters.mois, filters.categorie, filters.statut, filters.search]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const totalTTC = notes.reduce((sum, n) => sum + (n.montant_ttc ?? 0), 0);
  const totalTVA = notes.reduce((sum, n) => sum + (n.montant_tva ?? 0), 0);

  const recapParCategorie: RecapMensuelItem[] = Object.entries(
    notes.reduce<Record<string, { total_ttc: number; count: number }>>((acc, note) => {
      const cat = note.categorie;
      if (!acc[cat]) acc[cat] = { total_ttc: 0, count: 0 };
      acc[cat].total_ttc += note.montant_ttc ?? 0;
      acc[cat].count += 1;
      return acc;
    }, {})
  ).map(([categorie, vals]) => ({
    categorie: categorie as CategorieNotesFrais,
    ...vals,
  }));

  return {
    notes,
    loading,
    error,
    totalTTC,
    totalTVA,
    recapParCategorie,
    refresh: fetchNotes,
  };
}
