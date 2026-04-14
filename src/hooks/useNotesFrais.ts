"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NoteFrais } from "@/types";

export function useNotesFrais() {
  const [notes, setNotes] = useState<NoteFrais[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("notes_frais")
      .select("*")
      .order("date_frais", { ascending: false });
    if (err) setError(err.message);
    else setNotes((data as NoteFrais[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { notes, loading, error, refetch: fetch };
}
