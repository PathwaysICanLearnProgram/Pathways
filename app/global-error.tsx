'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return <html lang="en"><body><main style={{fontFamily:'Arial, sans-serif',minHeight:'100vh',display:'grid',placeItems:'center',padding:'24px',background:'#f5f7f8'}}><div style={{maxWidth:'560px',background:'white',padding:'32px',borderRadius:'18px',boxShadow:'0 12px 35px rgba(0,0,0,.08)'}}><h1 style={{marginTop:0}}>Pathways</h1><p>The portal could not finish loading. Please try again.</p><button onClick={reset} style={{padding:'12px 18px',borderRadius:'10px',border:0,cursor:'pointer'}}>Try again</button></div></main></body></html>
}
