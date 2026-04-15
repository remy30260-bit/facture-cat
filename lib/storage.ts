import { createClient } from './supabase'

// ─── Buckets disponibles ───────────────────────────────────────────────────
export type Bucket = 'factures' | 'notes-frais' | 'exports' | 'company-assets'

const ALLOWED_TYPES: Record<Bucket, string[]> = {
  'factures':       ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  'notes-frais':    ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  'exports':        ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'],
  'company-assets': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
}

const MAX_SIZE_BYTES: Record<Bucket, number> = {
  'factures':       10 * 1024 * 1024,
  'notes-frais':    10 * 1024 * 1024,
  'exports':        50 * 1024 * 1024,
  'company-assets':  5 * 1024 * 1024,
}

function validateFile(file: File, bucket: Bucket): string | null {
  if (!ALLOWED_TYPES[bucket].includes(file.type)) {
    return `Type de fichier non autorisé. Acceptés : ${ALLOWED_TYPES[bucket].join(', ')}`
  }
  if (file.size > MAX_SIZE_BYTES[bucket]) {
    const max = MAX_SIZE_BYTES[bucket] / (1024 * 1024)
    return `Fichier trop lourd. Maximum : ${max} Mo`
  }
  return null
}

export async function uploadFacture(userId: string, file: File) {
  const error = validateFile(file, 'factures')
  if (error) return { data: null, error: new Error(error) }
  const supabase = createClient()
  const path = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const { data, error: uploadError } = await supabase.storage
    .from('factures')
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
  return { data, error: uploadError }
}

export async function uploadNoteFrais(userId: string, file: File, societe: string) {
  const err = validateFile(file, 'notes-frais')
  if (err) return { data: null, error: new Error(err) }
  const supabase = createClient()
  const now  = new Date()
  const mm   = String(now.getMonth() + 1).padStart(2, '0')
  const dd   = String(now.getDate()).padStart(2, '0')
  const nom  = societe.toUpperCase().replace(/[^A-Z0-9]/g, '_')
  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${userId}/${nom}_${mm}_${dd}_${Date.now()}.${ext}`
  const { data, error: uploadError } = await supabase.storage
    .from('notes-frais')
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
  return { data, error: uploadError }
}

export async function uploadFacturesBulk(userId: string, files: File[]) {
  const results = await Promise.allSettled(
    files.map(f => uploadFacture(userId, f))
  )
  return results.map((r, i) => ({
    file:    files[i].name,
    success: r.status === 'fulfilled' && !r.value.error,
    path:    r.status === 'fulfilled' ? r.value.data?.path : undefined,
    error:   r.status === 'fulfilled' ? r.value.error?.message : (r as PromiseRejectedResult).reason,
  }))
}

export async function uploadExport(userId: string, file: File, nom: string) {
  const err = validateFile(file, 'exports')
  if (err) return { data: null, error: new Error(err) }
  const supabase = createClient()
  const path = `${userId}/exports/${nom}`
  const { data, error: uploadError } = await supabase.storage
    .from('exports')
    .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type })
  return { data, error: uploadError }
}

export async function uploadCompanyAsset(userId: string, file: File, nom: string = 'logo') {
  const err = validateFile(file, 'company-assets')
  if (err) return { data: null, error: new Error(err) }
  const supabase = createClient()
  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const path = `${userId}/${nom}.${ext}`
  const { data, error: uploadError } = await supabase.storage
    .from('company-assets')
    .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type })
  return { data, error: uploadError }
}

export async function getSignedUrl(bucket: Bucket, path: string, expiresIn = 3600) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  return { url: data?.signedUrl ?? null, error }
}

export function getPublicUrl(bucket: Bucket, path: string) {
  const supabase = createClient()
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function deleteFile(bucket: Bucket, path: string) {
  const supabase = createClient()
  return supabase.storage.from(bucket).remove([path])
}

export async function listUserFiles(bucket: Bucket, userId: string) {
  const supabase = createClient()
  return supabase.storage.from(bucket).list(userId, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  })
}
