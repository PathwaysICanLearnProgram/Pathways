'use client'

type Block = { kind: 'h3' | 'h4' | 'li' | 'p'; text: string }

function parse(text: string): Block[] {
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    if (line.startsWith('### ')) return { kind: 'h4' as const, text: line.slice(4) }
    if (line.startsWith('## ')) return { kind: 'h3' as const, text: line.slice(3) }
    if (line.startsWith('# ')) return { kind: 'h3' as const, text: line.slice(2) }
    if (/^([-*]|\d+\.)\s+/.test(line)) return { kind: 'li' as const, text: line.replace(/^([-*]|\d+\.)\s+/, '') }
    return { kind: 'p' as const, text: line }
  })
}

export default function SafeMarkdown({ text }: { text: string }) {
  const blocks = parse(text || '')
  return <div className="module-copy">
    {blocks.map((block, index) => {
      if (block.kind === 'h3') return <h3 key={index}>{block.text}</h3>
      if (block.kind === 'h4') return <h4 key={index}>{block.text}</h4>
      if (block.kind === 'li') return <li key={index}>{block.text}</li>
      return <p key={index}>{block.text}</p>
    })}
  </div>
}
