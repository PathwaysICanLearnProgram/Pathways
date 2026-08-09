'use client'
export default function SafeMarkdown({text}:{text:string}){return <div className="module-copy">{text.split(/\n+/).map((x,i)=><p key={i}>{x}</p>)}</div>}
