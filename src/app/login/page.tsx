'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChargement(true)
    setErreur('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErreur('Email ou mot de passe incorrect.')
      setChargement(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1a2e' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-label="Facture Cat logo">
              {/* Corps du chat */}
              <rect x="12" y="28" width="40" height="26" rx="8" fill="#7c3aed"/>
              {/* Oreilles */}
              <polygon points="16,28 22,14 28,28" fill="#7c3aed"/>
              <polygon points="36,28 42,14 48,28" fill="#7c3aed"/>
              {/* Facture sous le chat */}
              <rect x="18" y="38" width="28" height="18" rx="3" fill="white" opacity="0.15"/>
              <line x1="22" y1="44" x2="42" y2="44" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              <line x1="22" y1="48" x2="38" y2="48" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              <line x1="22" y1="52" x2="35" y2="52" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              {/* Yeux */}
              <circle cx="25" cy="36" r="2.5" fill="white"/>
              <circle cx="39" cy="36" r="2.5" fill="white"/>
              <circle cx="25.8" cy="36.8" r="1.2" fill="#1a1a2e"/>
              <circle cx="39.8" cy="36.8" r="1.2" fill="#1a1a2e"/>
              {/* Nez */}
              <circle cx="32" cy="40" r="1.5" fill="#f9a8d4"/>
              {/* Moustaches */}
              <line x1="32" y1="40" x2="20" y2="38" stroke="white" strokeWidth="1" opacity="0.5"/>
              <line x1="32" y1="40" x2="20" y2="42" stroke="white" strokeWidth="1" opacity="0.5"/>
              <line x1="32" y1="40" x2="44" y2="38" stroke="white" strokeWidth="1" opacity="0.5"/>
              <line x1="32" y1="40" x2="44" y2="42" stroke="white" strokeWidth="1" opacity="0.5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Facture Cat</h1>
          <p className="text-sm mt-1" style={{ color: '#a78bfa' }}>Comptabilité intelligente pour TPE/PME</p>
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl p-8" style={{ background: '#16213e', border: '1px solid #2d2b55' }}>
          <h2 className="text-lg font-semibold text-white mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#c4b5fd' }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style={{
                  background: '#1a1a2e',
                  border: '1px solid #2d2b55',
                  color: 'white',
                }}
                onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                onBlur={e => (e.target.style.borderColor = '#2d2b55')}
                placeholder="vous@exemple.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#c4b5fd' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style={{
                  background: '#1a1a2e',
                  border: '1px solid #2d2b55',
                  color: 'white',
                }}
                onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                onBlur={e => (e.target.style.borderColor = '#2d2b55')}
                placeholder="••••••••"
              />
            </div>

            {erreur && (
              <div className="text-sm px-4 py-3 rounded-lg" style={{ background: '#3b0764', color: '#f9a8d4' }}>
                {erreur}
              </div>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
              style={{
                background: chargement ? '#5b21b6' : '#7c3aed',
                opacity: chargement ? 0.7 : 1,
              }}
            >
              {chargement ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#4c4b7a' }}>
          Accès réservé — comptes créés par l'administrateur
        </p>
      </div>
    </div>
  )
}
