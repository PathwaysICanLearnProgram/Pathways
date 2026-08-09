import crypto from 'node:crypto'
import { apiError, requireStaff } from '@/lib/supabase-admin'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireStaff(request, true)
    const { id } = await context.params
    const temporaryPassword = `Pw!${crypto.randomBytes(9).toString('base64url')}9aA`
    const { error } = await supabase.auth.admin.updateUserById(id, { password: temporaryPassword })
    if (error) throw error
    await supabase.from('profiles').update({ force_password_change: true }).eq('id', id)
    await supabase.from('audit_events').insert({ actor_id: user.id, action: 'password_reset_by_admin', entity_type: 'profile', entity_id: id, metadata: { source: 'admin_console' } })
    return Response.json({ ok: true, temporaryPassword })
  } catch (error) {
    return apiError(error)
  }
}
