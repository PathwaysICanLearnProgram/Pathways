'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const PATHWAYS_SUPABASE_URL = 'https://zvgragymlezepfrkevdv.supabase.co'
const PATHWAYS_PUBLISHABLE_KEY = 'sb_publishable_YV2U2W_YwpbH3IDPIkT2_w_6c7WYBCY'

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowser() {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PATHWAYS_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || PATHWAYS_PUBLISHABLE_KEY

  browserClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  })
  return browserClient
}
