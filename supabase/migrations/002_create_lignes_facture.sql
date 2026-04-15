-- Migration 002 : Lignes de facture (détail)

create table if not exists public.lignes_facture (
  id              uuid primary key default uuid_generate_v4(),
  facture_id      uuid not null references public.factures(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),

  -- Ligne
  ordre           integer not null default 0,
  description     text,
  reference       text,
  quantite        numeric(10, 3) default 1,
  unite           text,
  prix_unitaire   numeric(12, 4),
  remise_pct      numeric(5, 2) default 0,
  montant_ht      numeric(12, 2),
  taux_tva        numeric(5, 2) default 20,
  montant_tva     numeric(12, 2),
  montant_ttc     numeric(12, 2),
  compte_charge   text
);

create index if not exists lignes_facture_facture_id_idx on public.lignes_facture(facture_id);

-- RLS
alter table public.lignes_facture enable row level security;

create policy "Lignes visibles par propriétaire"
  on public.lignes_facture for select
  using (auth.uid() = user_id);

create policy "Lignes créées par propriétaire"
  on public.lignes_facture for insert
  with check (auth.uid() = user_id);

create policy "Lignes modifiées par propriétaire"
  on public.lignes_facture for update
  using (auth.uid() = user_id);

create policy "Lignes supprimées par propriétaire"
  on public.lignes_facture for delete
  using (auth.uid() = user_id);
