import { Consequence } from '@/types/game'
import { AlertCircle, CheckCircle2, Ghost } from 'lucide-react'

interface ConsequenceRibbonProps {
  consequences: Consequence[]
}

export function ConsequenceRibbon({ consequences }: ConsequenceRibbonProps) {
  if (consequences.length === 0) return null

  // On mobile show 1, on larger screens show 3
  const recent = [...consequences].sort((a, b) => b.turnMade - a.turnMade).slice(0, 3)

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 overflow-x-auto custom-scrollbar">
      {recent.map((c) => (
        <div 
          key={c.id}
          className={`flex items-center gap-1.5 px-2 py-1 text-[9px] md:text-xs tracking-wider uppercase border shrink-0 ${
            c.status === 'pending' ? 'bg-yellow-900/20 text-yellow-500 border-yellow-900/30' :
            c.status === 'haunting' ? 'bg-red-900/20 text-red-500 border-red-900/30' :
            'bg-green-900/20 text-green-500 border-green-900/30'
          }`}
          title={c.impact}
        >
          {c.status === 'pending' && <AlertCircle size={10} />}
          {c.status === 'resolved' && <CheckCircle2 size={10} />}
          {c.status === 'haunting' && <Ghost size={10} />}
          <span>{c.status}</span>
        </div>
      ))}
    </div>
  )
}
