'use client'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function PasswordUpdate() {
  const router = useRouter()
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [message,setMessage]=useState('')
  const [ready,setReady]=useState(false)
  const [saving,setSaving]=useState(false)

  useEffect(()=>{
    let mounted=true

    async function verifySession(){
      try {
        const {data,error}=await getSupabaseBrowser().auth.getSession()
        if(!mounted)return
        if(error)setMessage('Unable to verify your secure session.')
        setReady(!!data.session)
      } catch {
        if(mounted)setMessage('Unable to connect to the secure account service.')
      }
    }

    void verifySession()
    return ()=>{mounted=false}
  },[])

  async function submit(e:FormEvent){
    e.preventDefault(); setMessage('')
    if(password.length<10){setMessage('Use at least 10 characters.');return}
    if(password!==confirm){setMessage('Passwords do not match.');return}

    setSaving(true)
    try {
      const supabase=getSupabaseBrowser()

      const {error}=await supabase.auth.updateUser({password})
      if(error){
        const alreadyUpdatedThisTab = typeof window !== 'undefined' && sessionStorage.getItem('pathways-password-updated') === '1'
        if(error.code !== 'same_password' || !alreadyUpdatedThisTab){
          setMessage(error.code === 'same_password' ? 'Choose a password that is different from your current password.' : error.message)
          return
        }
      } else if (typeof window !== 'undefined') {
        sessionStorage.setItem('pathways-password-updated','1')
      }

      const {error:completionError}=await supabase.rpc('complete_password_change')
      if(completionError){
        const {data:{session}}=await supabase.auth.getSession()
        if(!session){setMessage('Your password was changed, but your session expired. Please sign in again.');return}
        const response=await fetch('/api/account/password-changed',{
          method:'POST',
          headers:{Authorization:`Bearer ${session.access_token}`}
        })
        if(!response.ok){
          setMessage('Your password was changed, but Pathways could not finish activating your account. Please sign out and sign in again, or contact the administrator.')
          return
        }
      }

      const {data:{user}}=await supabase.auth.getUser()
      if(!user){setMessage('Your password was changed. Please sign in again to continue.');return}
      const {data:profile,error:profileError}=await supabase
        .from('profiles')
        .select('force_password_change')
        .eq('id',user.id)
        .single()
      if(profileError || profile?.force_password_change){
        setMessage('Your password was changed, but account activation did not complete. Please sign out and sign in again.')
        return
      }

      if(typeof window !== 'undefined') sessionStorage.removeItem('pathways-password-updated')
      router.replace('/portal')
      router.refresh()
    } catch {
      setMessage('The password could not be updated. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return <main className="center-screen"><form className="card auth-card" onSubmit={submit}><p className="eyebrow">ACCOUNT SECURITY</p><h1>Create a new password</h1><p className="muted">Use a unique password you do not use for another service.</p>{!ready&&<div className="notice">Sign in with your temporary password first, then return here to create your own password.</div>}<label>New password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label><label>Confirm password<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required /></label>{message&&<div className="notice">{message}</div>}<button className="primary wide" disabled={!ready||saving}>{saving?'Saving…':'Save new password'}</button></form></main>
}
