import crypto from 'node:crypto'
import { apiError, requireStaff } from '@/lib/supabase-admin'

const stages = ['Upper Primary','Form 1','Form 2','Form 3','Form 4','Form 5']

function makePassword() {
  return `Pw!${crypto.randomBytes(9).toString('base64url')}9aA`
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireStaff(request, true)
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const fullName = String(body.fullName || '').trim()
    const stage = String(body.stage || 'Form 1')
    const role = ['student','counsellor'].includes(body.role) ? body.role : 'student'
    if (!email.includes('@') || fullName.length < 2) return Response.json({ error: 'A valid email and name are required.' }, { status: 400 })
    if (role === 'student' && !stages.includes(stage)) return Response.json({ error: 'Invalid school stage.' }, { status: 400 })
    const temporaryPassword = makePassword()
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })
    if (error || !data.user) throw error || new Error('User creation failed')
    const id = data.user.id
    const { error: profileError } = await supabase.from('profiles').update({ full_name: fullName, role, active: true, force_password_change: true }).eq('id', id)
    if (profileError) throw profileError
    if (role === 'student') {
      const { error: detailsError } = await supabase.from('student_details').upsert({ user_id: id, stage, career_focus: 'Exploring' })
      if (detailsError) throw detailsError
    }
    await supabase.from('audit_events').insert({ actor_id: user.id, action: 'account_created', entity_type: 'profile', entity_id: id, metadata: { role, stage: role === 'student' ? stage : null } })
    return Response.json({ ok: true, id, email, temporaryPassword })
  } catch (error) {
    return apiError(error)
  }
}
