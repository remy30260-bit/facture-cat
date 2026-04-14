# Facture Cat 🐱

> Application de comptabilité intelligente alimentée par Gemini 2.5 Flash

## Stack technique

- **Next.js 14** (App Router + TypeScript)
- **Tailwind CSS** (thème Pennylane pastel orange/beige)
- **Supabase** (Auth + PostgreSQL + Storage)
- **Gemini 2.5 Flash** (OCR factures & notes de frais)

## Démarrage rapide

```bash
npm install
cp .env.local.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure

```
src/
├── app/                    # Pages (App Router)
│   ├── layout.tsx
│   ├── page.tsx            # Dashboard
│   ├── factures/
│   ├── comptabilite/
│   ├── notes-frais/
│   └── bilan/
├── components/
│   ├── layout/Sidebar.tsx
│   └── dashboard/
├── lib/supabase/
└── types/
```
