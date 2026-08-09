'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function AuthScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<'login'|'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const google = process.env.NEXT_PUBLIC_ENABLE_GOOGLE === 'true'
  const microsoft = process.env.NEXT_PUBLIC_ENABLE_MICROSOFT === 'true'

  useEffect(() => { getSupabaseBrowser().auth.getSession().then(({data}) => { if (data.session) router.replace('/portal') }) }, [router])

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('')
    const supabase = getSupabaseBrowser()
    if (mode === 'forgot') {
      const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${site}/update-password` })
      setMessage(error ? error.message : 'If the account exists, a secure password-reset email has been sent.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('Sign-in failed. Check your email and password, or contact the Pathways administrator.')
      else router.replace('/portal')
    }
    setBusy(false)
  }

  async function social(provider: 'google'|'azure') {
    const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const scopes = provider === 'azure' ? 'email' : undefined
    await getSupabaseBrowser().auth.signInWithOAuth({ provider, options: { redirectTo: `${site}/auth/callback`, scopes } })
  }

  return <main className="auth-shell">
    <section className="auth-brand">
      <div className="brand-mark">P</div><p className="eyebrow">CAREER DEVELOPMENT • GUIDANCE • NEXT STEPS</p>
      <h1>Pathways</h1><p className="lead">A personal career-development journey from Upper Primary to Form 5 — combining student exploration with counsellor guidance.</p>
      <div className="auth-points"><span>Discover strengths</span><span>Connect subjects to careers</span><span>Compare university, TVET, work and enterprise</span><span>Plan with a counsellor</span></div>
    </section>
    <section className="auth-panel"><form className="auth-card" onSubmit={submit}>
      <p className="eyebrow">SECURE PORTAL</p><h2>{mode === 'login' ? 'Sign in to Pathways' : 'Reset your password'}</h2>
      <p className="muted">Student accounts are controlled by the Pathways administrator.</p>
      <label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      {mode === 'login' && <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>}
      {message && <div className="notice">{message}</div>}
      <button className="primary wide" disabled={busy}>{busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Send reset link'}</button>
      <button type="button" className="link-button" onClick={()=>{setMode(mode==='login'?'forgot':'login');setMessage('')}}>{mode==='login'?'Forgot password?':'Back to sign in'}</button>
      {mode === 'login' && (google || microsoft) && <><div className="divider"><span>optional school sign-in</span></div><div className="social-row">{google && <button type="button" className="secondary" onClick={()=>social('google')}>Continue with Google</button>}{microsoft && <button type="button" className="secondary" onClick={()=>social('azure')}>Continue with Microsoft</button>}</div></>}
      <p className="fineprint">Career recommendations are guidance prompts, not psychometric diagnoses or guarantees of admission or employment.</p>
    </form></section>
  </main>
}
