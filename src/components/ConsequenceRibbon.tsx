import { Consequence } from '@/types/game'
import { AlertCircle, CheckCircle2, Ghost } from 'lucide-react'

interface ConsequenceRibbonProps {
  consequences: Consequence[]
}

export function ConsequenceRibbon({ consequences }: ConsequenceRibbonProps) {
  if (consequences.length === 0) return null

  // Show only the 3 most recent consequences
  const recent = [...consequences].sort((a, b) => b.turnMade - a.turnMade).slice(0, 3)

  return (
    <div className="flex justify-center space-x-4 p-2 bg-surface/50 border-y border-border">
      {recent.map((c) => (
        <div 
          key={c.id}
          className={`flex items-center space-x-2 px-3 py-1 rounded text-xs tracking-wider uppercase border ${
            c.status === 'pending' ? 'bg-yellow-900/20 text-yellow-500 border-yellow-900/30' :
            c.status === 'haunting' ? 'bg-red-900/20 text-red-500 border-red-900/30' :
            'bg-green-900/20 text-green-500 border-green-900/30'
          }`}
          title={c.impact}
        >
          {c.status === 'pending' && <AlertCircle size={12} />}
          {c.status === 'resolved' && <CheckCircle2 size={12} />}
          {c.status === 'haunting' && <Ghost size={12} />}
          <span>{c.status}</span>
        </div>
      ))}
    </div>
  )
}
