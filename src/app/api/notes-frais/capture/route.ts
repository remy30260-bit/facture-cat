import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { genererNomFichier } from '@/lib/bareme-km';

const PROMPT_GEMINI = `Analyse ce ticket/reçu et retourne UNIQUEMENT un objet JSON valide avec ces champs :
{
  "date": "YYYY-MM-DD",
  "societe": "",
  "montant_ttc": 0.00,
  "montant_ht": 0.00,
  "tva": 0.00,
  "categorie": "repas | transport | hebergement | fournitures | kilometrique | telecommunication | autre",
  "description": ""
}
Si une valeur est inconnue, utilise null. Retourne uniquement le JSON, sans markdown ni commentaire.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Upload vers Supabase Storage
    const ext = file.name.split('.').pop() ?? 'jpg';
    const storagePath = `notes-frais/${user.id}/${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from('factures')
      .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: 'Erreur upload Storage' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('factures').getPublicUrl(storagePath);
    const fichierUrl = urlData.publicUrl;

    // Appel Gemini
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'Clé API Gemini manquante' }, { status: 500 });
    }

    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: PROMPT_GEMINI },
              { inline_data: { mime_type: file.type, data: base64 } },
            ],
          }],
        }),
      }
    );

    if (!geminiRes.ok) {
      return NextResponse.json({ error: 'Erreur API Gemini' }, { status: 502 });
    }

    const geminiBody = await geminiRes.json();
    const rawText: string = geminiBody?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    let donnees: Record<string, unknown> = {};
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      donnees = JSON.parse(cleaned);
    } catch {
      donnees = {};
    }

    const dateStr = (donnees.date as string) ?? new Date().toISOString().split('T')[0];
    const societe = (donnees.societe as string) ?? 'INCONNU';
    const fichierNom = genererNomFichier(societe, dateStr);

    // Insertion en BDD
    const { data: inserted, error: insertError } = await supabase
      .from('notes_frais')
      .insert({
        user_id:        user.id,
        date_frais:     dateStr,
        societe,
        categorie:      (donnees.categorie as string) ?? 'autre',
        description:    (donnees.description as string) ?? null,
        montant_ht:     (donnees.montant_ht as number) ?? null,
        montant_tva:    (donnees.tva as number) ?? null,
        montant_ttc:    (donnees.montant_ttc as number) ?? 0,
        tva_recuperable: true,
        fichier_url:    fichierUrl,
        fichier_nom:    fichierNom,
        donnees_gemini: donnees,
        statut:         'brouillon',
      })
      .select()
      .single();

    if (insertError || !inserted) {
      return NextResponse.json({ error: 'Erreur insertion BDD' }, { status: 500 });
    }

    return NextResponse.json({ id: inserted.id, note: inserted }, { status: 201 });
  } catch (err) {
    console.error('[capture] Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
