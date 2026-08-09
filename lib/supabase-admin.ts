import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase server environment variables are not configured.')
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function requireStaff(request: Request, adminOnly = false) {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) throw new Error('UNAUTHENTICATED')
  const supabase = getSupabaseAdmin()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) throw new Error('UNAUTHENTICATED')
  const { data: profile } = await supabase.from('profiles').select('id,email,full_name,role,active').eq('id', user.id).single()
  if (!profile?.active || !['admin', 'counsellor'].includes(profile.role)) throw new Error('FORBIDDEN')
  if (adminOnly && profile.role !== 'admin') throw new Error('FORBIDDEN')
  return { supabase, user, profile }
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : 'UNKNOWN'
  if (message === 'UNAUTHENTICATED') return Response.json({ error: 'Please sign in.' }, { status: 401 })
  if (message === 'FORBIDDEN') return Response.json({ error: 'You do not have permission for this action.' }, { status: 403 })
  console.error(error)
  return Response.json({ error: 'The request could not be completed.' }, { status: 500 })
}

export async function requireUser(request: Request) {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) throw new Error('UNAUTHENTICATED')
  const supabase = getSupabaseAdmin()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) throw new Error('UNAUTHENTICATED')
  const { data: profile } = await supabase.from('profiles').select('id,email,full_name,role,active,force_password_change').eq('id', user.id).single()
  if (!profile) throw new Error('FORBIDDEN')
  return { supabase, user, profile }
}
