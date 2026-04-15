-- Migration 001 : Table principale des factures
-- À exécuter dans l'éditeur SQL de Supabase

create extension if not exists "uuid-ossp";

-- Table factures
create table if not exists public.factures (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Fichier
  nom_fichier     text not null,
  url_stockage    text,

  -- Données extraites par Gemini
  fournisseur     text,
  numero_facture  text,
  date_facture    date,
  date_echeance   date,

  -- Montants
  montant_ht      numeric(12, 2),
  montant_tva     numeric(12, 2),
  montant_ttc     numeric(12, 2),
  taux_tva        numeric(5, 2),
  devise          text not null default 'EUR',

  -- Comptabilité
  description     text,
  compte_charge   text,   -- ex: 606100
  compte_fournisseur text, -- ex: 401000

  -- Méta
  statut          text not null default 'a_valider'
                  check (statut in ('a_valider', 'valide', 'rejete', 'en_attente')),
  source          text default 'gemini',
  score_confiance numeric(4, 3) check (score_confiance between 0 and 1),
  notes           text
);

-- Index utiles
create index if not exists factures_user_id_idx on public.factures(user_id);
create index if not exists factures_statut_idx on public.factures(statut);
create index if not exists factures_date_facture_idx on public.factures(date_facture);
create index if not exists factures_fournisseur_idx on public.factures using gin(to_tsvector('french', coalesce(fournisseur, '')));

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger factures_updated_at
  before update on public.factures
  for each row execute function public.set_updated_at();

-- RLS (Row Level Security)
alter table public.factures enable row level security;

create policy "Les utilisateurs voient leurs propres factures"
  on public.factures for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs créent leurs propres factures"
  on public.factures for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres factures"
  on public.factures for update
  using (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres factures"
  on public.factures for delete
  using (auth.uid() = user_id);
