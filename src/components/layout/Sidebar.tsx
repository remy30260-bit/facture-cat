'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Truck, FileText, ShoppingCart,
  ClipboardList, FileMinus, Receipt, BookOpen, Calculator,
  TrendingUp, Wallet, ArrowLeftRight, Package, Settings,
  ChevronDown, ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { nom: 'Dashboard', href: '/dashboard', icone: LayoutDashboard },
  { nom: 'Clients', href: '/clients', icone: Users },
  { nom: 'Fournisseurs', href: '/fournisseurs', icone: Truck },
  { nom: 'Factures ventes', href: '/factures/ventes', icone: FileText },
  { nom: 'Factures achats', href: '/factures/achats', icone: ShoppingCart },
  { nom: 'Devis', href: '/devis', icone: ClipboardList },
  { nom: 'Avoirs', href: '/avoirs', icone: FileMinus },
  { nom: 'Notes de frais', href: '/notes-frais', icone: Receipt },
  {
    nom: 'Comptabilité',
    icone: BookOpen,
    sousMenus: [
      { nom: 'Écritures', href: '/comptabilite/ecritures' },
      { nom: 'Plan comptable', href: '/comptabilite/plan-comptable' },
      { nom: 'Grand livre', href: '/comptabilite/grand-livre' },
      { nom: 'Balance', href: '/comptabilite/balance' },
      { nom: 'Journaux', href: '/comptabilite/journaux' },
    ],
  },
  { nom: 'TVA', href: '/tva', icone: Calculator },
  {
    nom: 'Bilan / Résultat',
    icone: TrendingUp,
    sousMenus: [
      { nom: 'Compte de résultat', href: '/bilan/resultat' },
      { nom: 'Bilan comptable', href: '/bilan/bilan' },
    ],
  },
  { nom: 'Trésorerie', href: '/tresorerie', icone: Wallet },
  { nom: 'Rapprochement bancaire', href: '/rapprochement-bancaire', icone: ArrowLeftRight },
  { nom: 'Immobilisations', href: '/immobilisations', icone: Package },
  { nom: 'Paramètres', href: '/parametres', icone: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [ouverts, setOuverts] = useState<string[]>([])

  function toggleMenu(nom: string) {
    setOuverts(prev =>
      prev.includes(nom) ? prev.filter(n => n !== nom) : [...prev, nom]
    )
  }

  function estActif(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40"
      style={{ background: '#16213e', borderRight: '1px solid #2d2b55' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid #2d2b55' }}>
        <svg width="32" height="32" viewBox="0 0 64 64" fill="none" aria-label="Facture Cat">
          <rect x="12" y="28" width="40" height="26" rx="8" fill="#7c3aed"/>
          <polygon points="16,28 22,14 28,28" fill="#7c3aed"/>
          <polygon points="36,28 42,14 48,28" fill="#7c3aed"/>
          <rect x="18" y="38" width="28" height="18" rx="3" fill="white" opacity="0.15"/>
          <line x1="22" y1="44" x2="42" y2="44" stroke="white" strokeWidth="1.5" opacity="0.6"/>
          <line x1="22" y1="48" x2="38" y2="48" stroke="white" strokeWidth="1.5" opacity="0.6"/>
          <circle cx="25" cy="36" r="2.5" fill="white"/>
          <circle cx="39" cy="36" r="2.5" fill="white"/>
          <circle cx="25.8" cy="36.8" r="1.2" fill="#1a1a2e"/>
          <circle cx="39.8" cy="36.8" r="1.2" fill="#1a1a2e"/>
          <circle cx="32" cy="40" r="1.5" fill="#f9a8d4"/>
        </svg>
        <span className="font-bold text-white text-base tracking-tight">Facture Cat</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navigation.map(item => {
          const Icone = item.icone
          const estOuvert = ouverts.includes(item.nom)

          if (item.sousMenus) {
            const sousMenuActif = item.sousMenus.some(s => estActif(s.href))
            return (
              <div key={item.nom}>
                <button
                  onClick={() => toggleMenu(item.nom)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5"
                  style={{
                    color: sousMenuActif ? '#c4b5fd' : '#8b8aad',
                    background: sousMenuActif ? 'rgba(124,58,237,0.15)' : 'transparent',
                  }}
                >
                  <Icone size={16} />
                  <span className="flex-1 text-left">{item.nom}</span>
                  {estOuvert ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {(estOuvert || sousMenuActif) && (
                  <div className="ml-7 mb-1">
                    {item.sousMenus.map(sous => (
                      <Link
                        key={sous.href}
                        href={sous.href}
                        className="block px-3 py-2 rounded-lg text-xs transition-all mb-0.5"
                        style={{
                          color: estActif(sous.href) ? '#c4b5fd' : '#6b6a8a',
                          background: estActif(sous.href) ? 'rgba(124,58,237,0.2)' : 'transparent',
                          fontWeight: estActif(sous.href) ? 600 : 400,
                        }}
                      >
                        {sous.nom}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5"
              style={{
                color: estActif(item.href!) ? '#c4b5fd' : '#8b8aad',
                background: estActif(item.href!) ? 'rgba(124,58,237,0.2)' : 'transparent',
              }}
            >
              <Icone size={16} />
              <span>{item.nom}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
