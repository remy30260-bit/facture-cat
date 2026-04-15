import { createClient } from '@/lib/supabase/server'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react'

// Formattage montant en euros
function formatEur(montant: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant)
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const maintenant = new Date()
  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1).toISOString()
  const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0).toISOString()

  // CA du mois (factures de vente)
  const { data: facturesVente } = await supabase
    .from('factures')
    .select('montant_ttc, statut, date_facture')
    .in('statut', ['valide', 'comptabilise'])
    .gte('created_at', debutMois)
    .lte('created_at', finMois)

  // Dépenses du mois (factures fournisseurs)
  const { data: facturesAchat } = await supabase
    .from('factures')
    .select('montant_ttc, statut')
    .eq('statut', 'rembourse')
    .gte('created_at', debutMois)
    .lte('created_at', finMois)

  // Factures en attente (brouillon ou validées non remboursées)
  const { data: enAttente } = await supabase
    .from('factures')
    .select('id, montant_ttc, date_facture, statut')
    .in('statut', ['brouillon', 'valide'])

  // Dernières factures
  const { data: dernieresFactures } = await supabase
    .from('factures')
    .select('id, numero_facture, montant_ttc, statut, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const caMois = facturesVente?.reduce((s, f) => s + (f.montant_ttc ?? 0), 0) ?? 0
  const depensesMois = facturesAchat?.reduce((s, f) => s + (f.montant_ttc ?? 0), 0) ?? 0
  const resultatNet = caMois - depensesMois
  const totalEnAttente = enAttente?.reduce((s, f) => s + (f.montant_ttc ?? 0), 0) ?? 0
  const retard = enAttente?.filter(f => f.date_facture && new Date(f.date_facture) < maintenant) ?? []

  const kpis = [
    {
      titre: 'CA du mois',
      valeur: formatEur(caMois),
      icone: TrendingUp,
      couleur: '#7c3aed',
      bg: 'rgba(124,58,237,0.1)',
    },
    {
      titre: 'Dépenses du mois',
      valeur: formatEur(depensesMois),
      icone: TrendingDown,
      couleur: '#f472b6',
      bg: 'rgba(244,114,182,0.1)',
    },
    {
      titre: 'Résultat net',
      valeur: formatEur(resultatNet),
      icone: resultatNet >= 0 ? TrendingUp : TrendingDown,
      couleur: resultatNet >= 0 ? '#34d399' : '#f87171',
      bg: resultatNet >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
    },
    {
      titre: 'En attente',
      valeur: formatEur(totalEnAttente),
      icone: Clock,
      couleur: '#fbbf24',
      bg: 'rgba(251,191,36,0.1)',
      soustitre: `${enAttente?.length ?? 0} facture(s)`,
    },
  ]

  const statutLabels: Record<string, { label: string; color: string }> = {
    brouillon:    { label: 'Brouillon',      color: '#6b6a8a' },
    valide:       { label: 'Validée',        color: '#60a5fa' },
    comptabilise: { label: 'Comptabilisée', color: '#34d399' },
    rembourse:    { label: 'Remboursée',     color: '#a78bfa' },
  }

  return (
    <div>
      <Breadcrumb />

      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#6b6a8a' }}>
          Vue d&apos;ensemble — {maintenant.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Alertes */}
      {retard.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}
        >
          <AlertTriangle size={16} style={{ color: '#f87171' }} />
          <span style={{ color: '#fca5a5' }}>
            <strong>{retard.length} facture(s)</strong> en attente de traitement
          </span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(kpi => {
          const Icone = kpi.icone
          return (
            <div
              key={kpi.titre}
              className="rounded-xl p-5"
              style={{ background: '#16213e', border: '1px solid #2d2b55' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: '#6b6a8a' }}>
                  {kpi.titre}
                </span>
                <div className="p-2 rounded-lg" style={{ background: kpi.bg }}>
                  <Icone size={14} style={{ color: kpi.couleur }} />
                </div>
              </div>
              <p className="text-xl font-bold text-white">{kpi.valeur}</p>
              {kpi.soustitre && (
                <p className="text-xs mt-1" style={{ color: '#6b6a8a' }}>{kpi.soustitre}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Dernières factures */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#16213e', border: '1px solid #2d2b55' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #2d2b55' }}>
          <h2 className="text-sm font-semibold text-white">Dernières factures</h2>
        </div>
        <div className="divide-y" style={{ borderColor: '#2d2b55' }}>
          {!dernieresFactures || dernieresFactures.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: '#6b6a8a' }}>
              Aucune facture pour l&apos;instant
            </div>
          ) : (
            dernieresFactures.map(f => {
              const statut = statutLabels[f.statut] ?? { label: f.statut, color: '#6b6a8a' }
              return (
                <div key={f.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{f.numero_facture ?? '—'}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6b6a8a' }}>
                      {new Date(f.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ color: statut.color, background: statut.color + '20' }}
                    >
                      {statut.label}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {formatEur(f.montant_ttc ?? 0)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
