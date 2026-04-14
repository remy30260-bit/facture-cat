'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Client, ClientInsert } from '@/types/client'

interface ClientFormProps {
  client?: Client
  mode: 'creation' | 'edition'
}

export default function ClientForm({ client, mode }: ClientFormProps) {
  const router = useRouter()
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  const [form, setForm] = useState<ClientInsert>({
    nom: client?.nom ?? '',
    email: client?.email ?? '',
    telephone: client?.telephone ?? '',
    adresse: client?.adresse ?? '',
    code_postal: client?.code_postal ?? '',
    ville: client?.ville ?? '',
    pays: client?.pays ?? 'France',
    siret: client?.siret ?? '',
    numero_tva: client?.numero_tva ?? '',
    notes: client?.notes ?? '',
  })

  function setChamp(champ: keyof ClientInsert, valeur: string) {
    setForm(prev => ({ ...prev, [champ]: valeur }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChargement(true)
    setErreur('')

    const supabase = createClient()

    try {
      if (mode === 'creation') {
        const { error } = await supabase.from('clients').insert(form)
        if (error) throw error
      } else {
        const { error } = await supabase.from('clients').update(form).eq('id', client!.id)
        if (error) throw error
      }
      router.push('/clients')
      router.refresh()
    } catch (err: unknown) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setChargement(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div
        className="rounded-xl p-6"
        style={{ background: '#16213e', border: '1px solid #2d2b55' }}
      >
        <h2 className="text-sm font-semibold text-white mb-5">Informations générales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              id="nom"
              label="Nom / Raison sociale *"
              value={form.nom}
              onChange={e => setChamp('nom', e.target.value)}
              required
              placeholder="Entreprise SAS"
            />
          </div>
          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email ?? ''}
            onChange={e => setChamp('email', e.target.value)}
            placeholder="contact@exemple.fr"
          />
          <Input
            id="telephone"
            label="Téléphone"
            type="tel"
            value={form.telephone ?? ''}
            onChange={e => setChamp('telephone', e.target.value)}
            placeholder="+33 6 12 34 56 78"
          />
        </div>
      </div>

      <div
        className="rounded-xl p-6"
        style={{ background: '#16213e', border: '1px solid #2d2b55' }}
      >
        <h2 className="text-sm font-semibold text-white mb-5">Adresse</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              id="adresse"
              label="Adresse"
              value={form.adresse ?? ''}
              onChange={e => setChamp('adresse', e.target.value)}
              placeholder="12 rue de la Paix"
            />
          </div>
          <Input
            id="code_postal"
            label="Code postal"
            value={form.code_postal ?? ''}
            onChange={e => setChamp('code_postal', e.target.value)}
            placeholder="75001"
          />
          <Input
            id="ville"
            label="Ville"
            value={form.ville ?? ''}
            onChange={e => setChamp('ville', e.target.value)}
            placeholder="Paris"
          />
          <Input
            id="pays"
            label="Pays"
            value={form.pays}
            onChange={e => setChamp('pays', e.target.value)}
            placeholder="France"
          />
        </div>
      </div>

      <div
        className="rounded-xl p-6"
        style={{ background: '#16213e', border: '1px solid #2d2b55' }}
      >
        <h2 className="text-sm font-semibold text-white mb-5">Informations fiscales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="siret"
            label="SIRET"
            value={form.siret ?? ''}
            onChange={e => setChamp('siret', e.target.value)}
            placeholder="12345678900012"
            maxLength={14}
          />
          <Input
            id="numero_tva"
            label="N° TVA intracommunautaire"
            value={form.numero_tva ?? ''}
            onChange={e => setChamp('numero_tva', e.target.value)}
            placeholder="FR12345678901"
          />
        </div>
      </div>

      <div
        className="rounded-xl p-6"
        style={{ background: '#16213e', border: '1px solid #2d2b55' }}
      >
        <h2 className="text-sm font-semibold text-white mb-5">Notes internes</h2>
        <textarea
          value={form.notes ?? ''}
          onChange={e => setChamp('notes', e.target.value)}
          rows={3}
          placeholder="Notes, conditions particulières..."
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
          style={{ background: '#1a1a2e', border: '1px solid #2d2b55', color: 'white' }}
          onFocus={e => (e.target.style.borderColor = '#7c3aed')}
          onBlur={e => (e.target.style.borderColor = '#2d2b55')}
        />
      </div>

      {erreur && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.3)' }}>
          {erreur}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" chargement={chargement}>
          {mode === 'creation' ? 'Créer le client' : 'Enregistrer les modifications'}
        </Button>
        <Button type="button" variante="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
