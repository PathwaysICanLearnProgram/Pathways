'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import type { Profile } from '@/lib/types'
import StudentPortal from './StudentPortal'
import StaffPortal from './StaffPortal'

export default function PortalApp() {
  const router = useRouter()
  const [profile,setProfile] = useState<Profile|null>(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')

  useEffect(()=>{ void load() },[])

  async function load() {
    const supabase=getSupabaseBrowser(); const {data:{session}}=await supabase.auth.getSession()
    if(!session){router.replace('/');return}
    const res=await fetch('/api/account/me',{headers:{Authorization:`Bearer ${session.access_token}`}})
    if(!res.ok){setError('Your Pathways account could not be loaded. Please contact the administrator.');setLoading(false);return}
    const json=await res.json(); setProfile(json.profile); setLoading(false)
  }

  async function signOut(){await getSupabaseBrowser().auth.signOut();router.replace('/')}

  if(loading) return <main className="center-screen"><div className="card"><h1>Pathways</h1><p>Loading your secure portal…</p></div></main>
  if(error) return <main className="center-screen"><div className="card"><h1>Pathways</h1><div className="notice">{error}</div><button className="secondary" onClick={signOut}>Sign out</button></div></main>
  if(!profile) return null
  if(!profile.active) return <main className="center-screen"><div className="card auth-card"><p className="eyebrow">ACCOUNT APPROVAL</p><h1>Your account is not active yet</h1><p>A Pathways administrator must approve this account before student or staff information becomes available.</p><button className="secondary" onClick={signOut}>Sign out</button></div></main>
  if(profile.force_password_change) return <main className="center-screen"><div className="card auth-card"><p className="eyebrow">FIRST SIGN-IN</p><h1>Create your own password</h1><p>Your administrator issued a temporary password. Change it before continuing.</p><button className="primary" onClick={()=>router.push('/update-password')}>Change password</button><button className="secondary" onClick={signOut}>Sign out</button></div></main>
  return profile.role==='student' ? <StudentPortal profile={profile} onSignOut={signOut}/> : <StaffPortal profile={profile} onSignOut={signOut}/>
}
