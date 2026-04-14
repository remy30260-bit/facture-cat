'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const labels: Record<string, string> = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  fournisseurs: 'Fournisseurs',
  factures: 'Factures',
  ventes: 'Ventes',
  achats: 'Achats',
  devis: 'Devis',
  avoirs: 'Avoirs',
  'notes-de-frais': 'Notes de frais',
  comptabilite: 'Comptabilité',
  ecritures: 'Écritures',
  'plan-comptable': 'Plan comptable',
  'grand-livre': 'Grand livre',
  balance: 'Balance',
  journaux: 'Journaux',
  tva: 'TVA',
  tresorerie: 'Trésorerie',
  'rapprochement-bancaire': 'Rapprochement bancaire',
  immobilisations: 'Immobilisations',
  bilan: 'Bilan',
  resultat: 'Compte de résultat',
  parametres: 'Paramètres',
  nouveau: 'Nouveau',
  nouvelle: 'Nouvelle',
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const miettes = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    const label = labels[seg] ?? seg
    const estDernier = i === segments.length - 1
    return { href, label, estDernier }
  })

  if (miettes.length === 0) return null

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs mb-6">
      <Link href="/dashboard" style={{ color: '#6b6a8a' }} className="hover:text-purple-400 transition-colors">
        Accueil
      </Link>
      {miettes.map(({ href, label, estDernier }) => (
        <span key={href} className="flex items-center gap-1">
          <ChevronRight size={12} style={{ color: '#2d2b55' }} />
          {estDernier ? (
            <span style={{ color: '#c4b5fd' }} className="font-medium">{label}</span>
          ) : (
            <Link href={href} style={{ color: '#6b6a8a' }} className="hover:text-purple-400 transition-colors">
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
