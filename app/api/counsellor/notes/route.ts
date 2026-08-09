import { apiError, requireStaff } from '@/lib/supabase-admin'
import { decryptText, encryptText } from '@/lib/crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { supabase } = await requireStaff(request)
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    if (!studentId) return Response.json({ error: 'studentId is required.' }, { status: 400 })
    const { data, error } = await supabase.from('counsellor_notes').select('id,student_id,author_id,ciphertext,iv,auth_tag,created_at').eq('student_id', studentId).order('created_at', { ascending: false })
    if (error) throw error
    const notes = (data || []).map((row: { id: string; student_id: string; author_id: string; ciphertext: string; iv: string; auth_tag: string; created_at: string }) => ({ id: row.id, student_id: row.student_id, author_id: row.author_id, created_at: row.created_at, text: decryptText(row.ciphertext, row.iv, row.auth_tag) }))
    return Response.json({ notes })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireStaff(request)
    const body = await request.json()
    const studentId = String(body.studentId || '')
    const text = String(body.text || '').trim()
    if (!studentId || text.length < 2 || text.length > 10000) return Response.json({ error: 'A student and note text are required.' }, { status: 400 })
    const encrypted = encryptText(text)
    const { data, error } = await supabase.from('counsellor_notes').insert({ student_id: studentId, author_id: user.id, ciphertext: encrypted.ciphertext, iv: encrypted.iv, auth_tag: encrypted.authTag }).select('id,created_at').single()
    if (error) throw error
    await supabase.from('audit_events').insert({ actor_id: user.id, action: 'counsellor_note_created', entity_type: 'counsellor_note', entity_id: data.id, metadata: { student_id: studentId } })
    return Response.json({ ok: true, note: { id: data.id, created_at: data.created_at, text } })
  } catch (error) {
    return apiError(error)
  }
}
