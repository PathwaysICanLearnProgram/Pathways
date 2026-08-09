'use client'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function PasswordUpdate() {
  const router = useRouter(); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [message,setMessage]=useState(''); const [ready,setReady]=useState(false)
  useEffect(()=>{getSupabaseBrowser().auth.getSession().then(({data})=>setReady(!!data.session))},[])
  async function submit(e:FormEvent){e.preventDefault();setMessage(''); if(password.length<10){setMessage('Use at least 10 characters.');return} if(password!==confirm){setMessage('Passwords do not match.');return}
    const supabase=getSupabaseBrowser(); const {error}=await supabase.auth.updateUser({password}); if(error){setMessage(error.message);return}
    const {data:{session}}=await supabase.auth.getSession(); if(session) await fetch('/api/account/password-changed',{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`}})
    router.replace('/portal')
  }
  return <main className="center-screen"><form className="card auth-card" onSubmit={submit}><p className="eyebrow">ACCOUNT SECURITY</p><h1>Create a new password</h1><p className="muted">Use a unique password you do not use for another service.</p>{!ready&&<div className="notice">Open this page from your Pathways reset email or sign in with your temporary password first.</div>}<label>New password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label><label>Confirm password<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required /></label>{message&&<div className="notice">{message}</div>}<button className="primary wide" disabled={!ready}>Save new password</button></form></main>
}
