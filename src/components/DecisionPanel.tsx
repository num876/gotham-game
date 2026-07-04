import { Choice } from '@/types/game'
import { AlertTriangle } from 'lucide-react'

interface DecisionPanelProps {
  choices: Choice[]
  onChoice: (choiceId: string) => void
  disabled?: boolean
}

export function DecisionPanel({ choices, onChoice, disabled }: DecisionPanelProps) {
  if (!choices || choices.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-8 bg-surface/80 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onChoice(choice.id)}
          disabled={disabled}
          className={`group flex flex-col items-center text-center p-4 md:p-6 transition-all duration-500 relative overflow-hidden backdrop-blur-md
            ${choice.risk === 'the-line' 
              ? 'border border-alert/30 bg-alert/5 hover:border-alert hover:bg-alert/10 hover:shadow-[0_0_30px_rgba(255,0,0,0.2)] hover-glitch' 
              : 'border border-border/50 bg-background/40 hover:border-primary/50 hover:bg-primary/5'
            }
            ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}
            [clip-path:polygon(15px_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%,0_15px)]
          `}
        >
          {/* Subtle animated background gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

          {choice.risk === 'the-line' && (
            <div className="absolute inset-0 border-2 border-red-500/10 animate-pulse pointer-events-none" />
          )}
          
          <div className="flex items-center space-x-2 mb-3">
            {choice.risk === 'the-line' && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
            <span className={`text-[10px] font-mono tracking-[0.2em] uppercase ${
              choice.risk === 'measured' ? 'text-green-400' :
              choice.risk === 'aggressive' ? 'text-orange-400' :
              choice.risk === 'risky' ? 'text-yellow-400' :
              'text-red-500 font-bold'
            }`}>
              {choice.risk.replace('-', ' ')}
            </span>
          </div>

          <span className="font-serif text-lg md:text-xl text-primary/90 mb-4 flex-1 drop-shadow-md">
            {choice.label}
          </span>

          <p className="text-xs text-secondary leading-relaxed font-mono opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
            {choice.consequence}
          </p>
          
          {choice.hint && (
            <span className="text-[10px] text-primary/40 mt-3 italic opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              {choice.hint}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
