'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User } from 'lucide-react'

interface HeaderProps {
  email?: string
}

export default function Header({ email }: HeaderProps) {
  const router = useRouter()

  async function handleDeconnexion() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="fixed top-0 left-64 right-0 h-14 flex items-center justify-between px-6 z-30"
      style={{ background: '#16213e', borderBottom: '1px solid #2d2b55' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: '#c4b5fd' }}>
          Facture Cat
        </span>
        <span style={{ color: '#2d2b55' }}>·</span>
        <span className="text-xs" style={{ color: '#6b6a8a' }}>
          Comptabilité TPE/PME
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(124,58,237,0.1)' }}>
          <User size={14} style={{ color: '#a78bfa' }} />
          <span className="text-xs font-medium" style={{ color: '#c4b5fd' }}>
            {email ?? 'Utilisateur'}
          </span>
        </div>

        <button
          onClick={handleDeconnexion}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ color: '#8b8aad', border: '1px solid #2d2b55' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#f9a8d4'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#7c3aed'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#8b8aad'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#2d2b55'
          }}
        >
          <LogOut size={14} />
          Déconnexion
        </button>
      </div>
    </header>
  )
}
