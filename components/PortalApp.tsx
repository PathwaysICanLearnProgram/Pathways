'use client'
import { useEffect,useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import type { Profile } from '@/lib/types'
import StudentPortal from './StudentPortal'
import StaffPortal from './StaffPortal'

export default function PortalApp(){
 const router=useRouter(); const [profile,setProfile]=useState<Profile|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
 useEffect(()=>{void load()},[])
 async function load(){
  try{const supabase=getSupabaseBrowser(); const {data:{session}}=await supabase.auth.getSession(); if(!session){router.replace('/');return}
   const {data,error}=await supabase.from('profiles').select('id,email,full_name,role,active,force_password_change').eq('id',session.user.id).single(); if(error)throw error; setProfile(data as Profile)
  }catch{setError('Pathways could not load your account. Please sign in again.')}finally{setLoading(false)}
 }
 async function signOut(){await getSupabaseBrowser().auth.signOut();router.replace('/')}
 if(loading)return <main className="center-screen"><div className="card"><h1>Pathways</h1><p>Loading your portal…</p></div></main>
 if(error)return <main className="center-screen"><div className="card"><div className="notice">{error}</div><button className="secondary" onClick={signOut}>Sign out</button></div></main>
 if(!profile)return null
 if(!profile.active)return <main className="center-screen"><div className="card"><h1>Account awaiting activation</h1><button className="secondary" onClick={signOut}>Sign out</button></div></main>
 if(profile.force_password_change)return <main className="center-screen"><div className="card"><h1>Create your own password</h1><button className="primary" onClick={()=>router.push('/update-password')}>Change password</button></div></main>
 return profile.role==='student'?<StudentPortal profile={profile} onSignOut={signOut}/>:<StaffPortal profile={profile} onSignOut={signOut}/>
}
