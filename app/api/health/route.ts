export const dynamic = 'force-dynamic'

export async function GET() {
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvgragymlezepfrkevdv.supabase.co'
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'built-in-public-fallback'
  return Response.json({
    ok: true,
    app: 'Pathways',
    publicSupabaseConfigured: Boolean(publicUrl && publicKey),
    serverAdminConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    notesEncryptionConfigured: Boolean(process.env.COUNSELLOR_NOTES_ENCRYPTION_KEY),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://icanlearnprogrampathways.netlify.app',
    time: new Date().toISOString()
  })
}
