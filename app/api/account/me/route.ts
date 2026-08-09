import { apiError, requireUser } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { profile } = await requireUser(request)
    return Response.json({ profile })
  } catch (error) {
    return apiError(error)
  }
}
