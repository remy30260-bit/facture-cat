-- Migration 004 : Bucket Supabase Storage pour les fichiers factures
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer le bucket 'factures' (privé)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'factures',
  'factures',
  false,  -- privé : accès via signed URLs uniquement
  10485760,  -- 10 Mo max par fichier
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Politiques RLS Storage
create policy "Upload dans son propre dossier"
  on storage.objects for insert
  with check (
    bucket_id = 'factures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Lecture de ses propres fichiers"
  on storage.objects for select
  using (
    bucket_id = 'factures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Suppression de ses propres fichiers"
  on storage.objects for delete
  using (
    bucket_id = 'factures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
