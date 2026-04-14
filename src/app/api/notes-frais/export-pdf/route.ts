import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { NoteFrais } from '@/types/note-frais';

const CATEGORIE_LABELS: Record<string, string> = {
  repas:             'Repas',
  transport:         'Transport',
  hebergement:       'Hébergement',
  fournitures:       'Fournitures',
  kilometrique:      'Kilométrique',
  telecommunication: 'Télécommunication',
  autre:             'Autre',
};

function formatEur(val: number | null): string {
  if (val === null) return '—';
  return val.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function buildHtml(note: NoteFrais): string {
  const date = new Date(note.date_frais).toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Note de frais — ${note.fichier_nom ?? note.id}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #2D2A26; margin: 0; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .logo { font-size: 22px; font-weight: bold; color: #FF8C42; }
    .logo span { font-weight: 300; color: #6B6560; }
    .badge { background: #FFF1E6; color: #FF8C42; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .subtitle { color: #6B6560; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th { background: #FFF1E6; text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #6B6560; letter-spacing: 0.05em; }
    td { padding: 12px 14px; border-bottom: 1px solid #F0E6DC; font-size: 13px; }
    .total-row td { font-weight: bold; font-size: 14px; color: #FF8C42; border-top: 2px solid #FF8C42; border-bottom: none; }
    .footer { margin-top: 40px; font-size: 11px; color: #6B6560; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">🐱 Facture<span>Cat</span></div>
      <div class="subtitle" style="margin-top:4px">Note de frais</div>
    </div>
    <div class="badge">${CATEGORIE_LABELS[note.categorie] ?? note.categorie}</div>
  </div>

  <h1>${note.fichier_nom ?? 'Note de frais'}</h1>
  <p class="subtitle">${date}</p>

  <table>
    <thead>
      <tr>
        <th>Société</th>
        <th>Description</th>
        <th>Montant HT</th>
        <th>TVA</th>
        <th>Montant TTC</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${note.societe}</td>
        <td>${note.description ?? '—'}</td>
        <td>${formatEur(note.montant_ht)}</td>
        <td>${formatEur(note.montant_tva)}${note.tva_recuperable ? ' ✓' : ' ✗'}</td>
        <td>${formatEur(note.montant_ttc)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="4">Total TTC</td>
        <td>${formatEur(note.montant_ttc)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">Généré par Facture Cat · ${new Date().toLocaleDateString('fr-FR')}</div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { data: note, error } = await supabase
      .from('notes_frais')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !note) return NextResponse.json({ error: 'Note introuvable' }, { status: 404 });

    // Retourne le HTML — la conversion en PDF se fait côté client avec window.print()
    // ou via un service tiers (Puppeteer sur Vercel Edge n'est pas disponible en free tier).
    const html = buildHtml(note as NoteFrais);
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="note-frais-${note.fichier_nom ?? id}.html"`,
      },
    });
  } catch (err) {
    console.error('[export-pdf] Error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
