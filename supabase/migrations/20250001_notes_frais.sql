-- Phase 3 : Module Notes de Frais
-- Migration : notes_frais + bareme_kilometrique

-- Table principale
CREATE TABLE IF NOT EXISTS notes_frais (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date_frais        DATE NOT NULL,
  societe           TEXT NOT NULL,
  categorie         TEXT NOT NULL CHECK (categorie IN (
                      'repas', 'transport', 'hebergement',
                      'fournitures', 'kilometrique',
                      'telecommunication', 'autre'
                    )),
  description       TEXT,
  montant_ht        DECIMAL(10,2),
  montant_tva       DECIMAL(10,2),
  montant_ttc       DECIMAL(10,2) NOT NULL DEFAULT 0,
  tva_recuperable   BOOLEAN NOT NULL DEFAULT true,
  km                DECIMAL(8,2),
  puissance_fiscale INTEGER,
  fichier_url       TEXT,
  fichier_nom       TEXT,
  donnees_gemini    JSONB,
  statut            TEXT NOT NULL DEFAULT 'brouillon'
                    CHECK (statut IN ('brouillon', 'valide', 'comptabilise')),
  comptabilise      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les filtres courants
CREATE INDEX IF NOT EXISTS idx_notes_frais_user_id       ON notes_frais (user_id);
CREATE INDEX IF NOT EXISTS idx_notes_frais_date          ON notes_frais (date_frais);
CREATE INDEX IF NOT EXISTS idx_notes_frais_categorie     ON notes_frais (categorie);
CREATE INDEX IF NOT EXISTS idx_notes_frais_statut        ON notes_frais (statut);

-- Row Level Security
ALTER TABLE notes_frais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_frais_select" ON notes_frais
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notes_frais_insert" ON notes_frais
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_frais_update" ON notes_frais
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (statut != 'comptabilise');

CREATE POLICY "notes_frais_delete" ON notes_frais
  FOR DELETE USING (auth.uid() = user_id AND statut != 'comptabilise');


-- Barème kilométrique 2025
CREATE TABLE IF NOT EXISTS bareme_kilometrique (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annee             INTEGER NOT NULL,
  puissance_fiscale INTEGER NOT NULL,
  tranche_km        TEXT NOT NULL,
  coefficient       DECIMAL(6,4) NOT NULL,
  montant_fixe      DECIMAL(8,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bareme_kilometrique ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bareme_km_read_all" ON bareme_kilometrique
  FOR SELECT USING (true);

-- Données barème 2025 (arrêté du 25 février 2025)
INSERT INTO bareme_kilometrique (annee, puissance_fiscale, tranche_km, coefficient, montant_fixe) VALUES
  -- 3 CV
  (2025, 3, '0-5000',        0.529,  NULL),
  (2025, 3, '5001-20000',    0.316,  1065),
  (2025, 3, 'plus_de_20000', 0.370,  NULL),
  -- 4 CV
  (2025, 4, '0-5000',        0.606,  NULL),
  (2025, 4, '5001-20000',    0.340,  1330),
  (2025, 4, 'plus_de_20000', 0.407,  NULL),
  -- 5 CV
  (2025, 5, '0-5000',        0.636,  NULL),
  (2025, 5, '5001-20000',    0.357,  1395),
  (2025, 5, 'plus_de_20000', 0.427,  NULL),
  -- 6 CV
  (2025, 6, '0-5000',        0.665,  NULL),
  (2025, 6, '5001-20000',    0.374,  1457),
  (2025, 6, 'plus_de_20000', 0.447,  NULL),
  -- 7 CV et plus
  (2025, 7, '0-5000',        0.697,  NULL),
  (2025, 7, '5001-20000',    0.394,  1515),
  (2025, 7, 'plus_de_20000', 0.470,  NULL)
ON CONFLICT DO NOTHING;
