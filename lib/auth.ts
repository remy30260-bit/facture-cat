'use server'

import { createServerComponentClient } from './supabase'
import { redirect } from 'next/navigation'

// ─── Récupérer l'utilisateur connecté (côté serveur) ──────────────────────
export async function getUser() {
  const supabase = await createServerComponentClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// ─── Récupérer l'utilisateur connecté ou rediriger vers /login ────────────
export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}

// ─── Login email/mot de passe ─────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user, session: data.session, error }
}

// ─── Déconnexion ──────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createServerComponentClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── Récupérer le profil entreprise de l'utilisateur ──────────────────────
export async function getCompanyProfile(userId: string) {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase
    .from('company_profile')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

// ─── Créer un compte (admin uniquement — inscription verrouillée) ─────────
export async function createUser(email: string, password: string, fullName: string) {
  const { createAdminClient } = require('./supabase')
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: fullName },
    email_confirm: true,
  })
  return { data, error }
}
