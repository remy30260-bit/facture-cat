# 🐱 Facture Cat

Application web comptable intelligente pour TPE/PME françaises.

## Stack
- **Frontend** : Next.js 14 (App Router, TypeScript)
- **Backend** : Supabase (Auth, PostgreSQL, Storage)
- **IA** : Gemini 2.5 Flash (OCR factures)
- **Hébergement** : Vercel

## Installation

```bash
npm install
cp .env.local.example .env.local
# Remplir les variables dans .env.local
npm run dev
```

## Phases de développement
- ✅ **Phase 1** — Auth + Layout + Dashboard
- 🔜 **Phase 2** — Clients & Fournisseurs
- 🔜 **Phase 3** — Facturation
- 🔜 **Phase 4** — Dépenses & Notes de frais
- 🔜 **Phase 5** — Comptabilité
- 🔜 **Phase 6** — TVA
- 🔜 **Phase 7** — Trésorerie & Banque
- 🔜 **Phase 8** — Immobilisations
- 🔜 **Phase 9** — Bilan & Résultat
- 🔜 **Phase 10** — Paramètres

## Structure
```
src/
├── app/                  # Pages Next.js (App Router)
│   ├── (authenticated)/  # Routes protégées
│   └── login/            # Page de connexion publique
├── components/           # Composants React
│   ├── layout/           # Sidebar, Header, Breadcrumb
│   └── ui/               # Composants UI réutilisables
├── lib/                  # Utilitaires
│   └── supabase/         # Clients Supabase
└── middleware.ts         # Protection des routes
```
