'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { NoteFrais, NoteFraisCreate } from '@/types/note-frais'

export function useNotesFrais() {
  const supabase = createClientComponentClient()
  const [notes, setNotes] = useState<NoteFrais[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(async (mois?: number, annee?: number) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('notes_frais')
        .select('*')
        .order('date_frais', { ascending: false })

      if (mois && annee) {
        const debut = `${annee}-${String(mois).padStart(2, '0')}-01`
        const fin = new Date(annee, mois, 0).toISOString().split('T')[0]
        query = query.gte('date_frais', debut).lte('date_frais', fin)
      }

      const { data, error: err } = await query
      if (err) throw err
      setNotes(data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const createNote = async (note: NoteFraisCreate): Promise<NoteFrais> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { data, error } = await supabase
      .from('notes_frais')
      .insert({ ...note, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    setNotes(prev => [data, ...prev])
    return data
  }

  const updateNote = async (id: string, updates: Partial<NoteFraisCreate>): Promise<NoteFrais> => {
    const { data, error } = await supabase
      .from('notes_frais')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setNotes(prev => prev.map(n => n.id === id ? data : n))
    return data
  }

  const deleteNote = async (id: string): Promise<void> => {
    const { error } = await supabase.from('notes_frais').delete().eq('id', id)
    if (error) throw error
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const totalMois = notes.reduce((acc, n) => acc + Number(n.montant_ttc), 0)

  return { notes, loading, error, fetchNotes, createNote, updateNote, deleteNote, totalMois }
}
