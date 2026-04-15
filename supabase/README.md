# Migrations Supabase — facture-cat

## Ordre d'exécution

Copier-coller chaque fichier dans l'**éditeur SQL de Supabase** dans l'ordre :

| Ordre | Fichier | Description |
|-------|---------|-------------|
| 1 | `001_create_factures.sql` | Table principale des factures + RLS |
| 2 | `002_create_lignes_facture.sql` | Lignes de détail par facture + RLS |
| 3 | `003_create_ecritures_comptables.sql` | Journal comptable + RLS |
| 4 | `004_storage_factures.sql` | Bucket Storage pour les PDF/images |

## Notes importantes

- **RLS activé sur toutes les tables** : chaque utilisateur ne voit que ses propres données.
- **Bucket Storage privé** : les fichiers sont accessibles uniquement via l'API Supabase authentifiée.
- Le bucket `factures` est organisé par `user_id/` pour isoler les fichiers par utilisateur.

## Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GEMINI_API_KEY=AIzaSy...
```
