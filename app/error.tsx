'use client'

import { useEffect } from 'react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => { console.error('Pathways page error', error) }, [error])
  return <main className="center-screen"><div className="card auth-card"><p className="eyebrow">PATHWAYS</p><h1>We could not load this page</h1><p className="muted">Your information has not been changed. Try loading the page again.</p><button className="primary" onClick={reset}>Try again</button><a className="secondary" href="/">Return to sign in</a></div></main>
}
