import { apiError, requireUser } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser(request)
    const { error } = await supabase.from('profiles').update({ force_password_change: false }).eq('id', user.id)
    if (error) throw error
    await supabase.from('audit_events').insert({ actor_id: user.id, action: 'password_changed', entity_type: 'profile', entity_id: user.id, metadata: { source: 'app' } })
    return Response.json({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
