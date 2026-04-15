-- Migration 003 : Écritures comptables (journal)

create table if not exists public.ecritures_comptables (
  id              uuid primary key default uuid_generate_v4(),
  facture_id      uuid references public.factures(id) on delete set null,
  user_id         uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),

  -- Journal
  date_ecriture   date not null default current_date,
  numero_piece    text,
  libelle         text,

  -- Compte PCG
  compte          text not null,  -- ex: '606100'
  compte_libelle  text,           -- ex: 'Achats de fournitures de bureau'

  -- Montant (débit > 0, crédit < 0 — ou utiliser deux colonnes)
  debit           numeric(14, 2) default 0,
  credit          numeric(14, 2) default 0,

  -- Tiers
  compte_tiers    text,           -- ex: '401FOURNISSEUR'
  tiers_nom       text,

  -- TVA
  code_tva        text,
  taux_tva        numeric(5, 2),
  montant_tva     numeric(12, 2),

  -- Statut
  valide          boolean not null default false,
  source          text default 'gemini'
);

create index if not exists ecritures_facture_id_idx on public.ecritures_comptables(facture_id);
create index if not exists ecritures_user_id_idx on public.ecritures_comptables(user_id);
create index if not exists ecritures_date_idx on public.ecritures_comptables(date_ecriture);
create index if not exists ecritures_compte_idx on public.ecritures_comptables(compte);

-- RLS
alter table public.ecritures_comptables enable row level security;

create policy "Écritures visibles par propriétaire"
  on public.ecritures_comptables for select
  using (auth.uid() = user_id);

create policy "Écritures créées par propriétaire"
  on public.ecritures_comptables for insert
  with check (auth.uid() = user_id);

create policy "Écritures modifiées par propriétaire"
  on public.ecritures_comptables for update
  using (auth.uid() = user_id);

create policy "Écritures supprimées par propriétaire"
  on public.ecritures_comptables for delete
  using (auth.uid() = user_id);
