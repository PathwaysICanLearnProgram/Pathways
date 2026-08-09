'use client'
import React from 'react'

export default function SafeMarkdown({text}:{text:string}) {
  const lines=text.split(/\r?\n/)
  const out:React.ReactNode[]=[]; let list:string[]=[]; let ordered=false
  const flush=()=>{if(!list.length)return; const items=list.map((x,i)=><li key={i}>{x}</li>); out.push(ordered?<ol key={`l${out.length}`}>{items}</ol>:<ul key={`l${out.length}`}>{items}</ul>); list=[]}
  lines.forEach((raw,i)=>{const line=raw.trim(); if(!line){flush();return}
    if(line.startsWith('### ')){flush();out.push(<h4 key={i}>{line.slice(4)}</h4>)}
    else if(line.startsWith('## ')){flush();out.push(<h3 key={i}>{line.slice(3)}</h3>)}
    else if(/^\d+\. /.test(line)){if(list.length&&!ordered)flush();ordered=true;list.push(line.replace(/^\d+\. /,''))}
    else if(line.startsWith('- ')){if(list.length&&ordered)flush();ordered=false;list.push(line.slice(2))}
    else {flush();out.push(<p key={i}>{line}</p>)}
  });flush(); return <div className="module-copy">{out}</div>
}
