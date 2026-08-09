'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.getSession().finally(() => router.replace('/portal'))
  }, [router])
  return <main className="center-screen"><div className="card"><h1>Pathways</h1><p>Completing secure sign-in…</p></div></main>
}
