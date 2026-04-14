import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const mois = searchParams.get('mois');

    let query = supabase
      .from('notes_frais')
      .select('date_frais, societe, categorie, description, montant_ht, montant_tva, montant_ttc, tva_recuperable, km, statut')
      .eq('user_id', user.id)
      .order('date_frais', { ascending: true });

    if (mois) {
      const debut = `${mois}-01`;
      const fin = new Date(new Date(debut).setMonth(new Date(debut).getMonth() + 1) - 1)
        .toISOString().split('T')[0];
      query = query.gte('date_frais', debut).lte('date_frais', fin);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []).map((n) => ({
      Date:           n.date_frais,
      Société:        n.societe,
      Catégorie:      n.categorie,
      Description:    n.description ?? '',
      'Montant HT':   n.montant_ht ?? '',
      'TVA':          n.montant_tva ?? '',
      'Montant TTC':  n.montant_ttc,
      'TVA récup.':   n.tva_recuperable ? 'Oui' : 'Non',
      'Km':           n.km ?? '',
      Statut:         n.statut,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Notes de frais');

    const totalRow = { Date: 'TOTAL', 'Montant TTC': (data ?? []).reduce((s, n) => s + (n.montant_ttc ?? 0), 0) };
    XLSX.utils.sheet_add_json(wb.Sheets['Notes de frais'], [totalRow], { skipHeader: true, origin: -1 });

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="notes-frais-${mois ?? 'export'}.xlsx"`,
      },
    });
  } catch (err) {
    console.error('[export-xlsx] Error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
