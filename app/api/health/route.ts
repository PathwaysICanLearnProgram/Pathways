import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('portal_settings').select('portal_name').limit(1)
    if (error) throw error
    return Response.json({ ok: true, app: 'Pathways', database: 'connected', time: new Date().toISOString() })
  } catch (error) {
    console.error(error)
    return Response.json({ ok: false, app: 'Pathways', database: 'not-ready' }, { status: 503 })
  }
}
