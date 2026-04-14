import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mois      = searchParams.get('mois');      // 'YYYY-MM'
    const categorie = searchParams.get('categorie');
    const statut    = searchParams.get('statut');
    const search    = searchParams.get('search');

    let query = supabase
      .from('notes_frais')
      .select('*')
      .eq('user_id', user.id)
      .order('date_frais', { ascending: false });

    if (mois) {
      const debut = `${mois}-01`;
      const fin = new Date(new Date(debut).setMonth(new Date(debut).getMonth() + 1) - 1)
        .toISOString()
        .split('T')[0];
      query = query.gte('date_frais', debut).lte('date_frais', fin);
    }

    if (categorie) query = query.eq('categorie', categorie);
    if (statut)    query = query.eq('statut', statut);
    if (search)    query = query.ilike('societe', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ notes: data ?? [] });
  } catch (err) {
    console.error('[notes-frais GET] Error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
