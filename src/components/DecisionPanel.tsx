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
    <div className="grid grid-cols-3 gap-2 md:gap-6 p-2 md:p-8 bg-surface/80 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onChoice(choice.id)}
          disabled={disabled}
          className={`group flex flex-col items-center justify-center text-center p-2 md:p-6 transition-all duration-500 relative overflow-hidden backdrop-blur-md
            ${choice.risk === 'the-line' 
              ? 'border border-alert/30 bg-alert/5 hover:border-alert hover:bg-alert/10 hover:shadow-[0_0_30px_rgba(255,0,0,0.2)] hover-glitch' 
              : 'border border-border/50 bg-background/40 hover:border-primary/50 hover:bg-primary/5'
            }
            ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}
            [clip-path:polygon(8px_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%,0_8px)] md:[clip-path:polygon(15px_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%,0_15px)]
          `}
        >
          {/* Subtle animated background gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

          {choice.risk === 'the-line' && (
            <div className="absolute inset-0 border-2 border-red-500/10 animate-pulse pointer-events-none" />
          )}
          
          <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 mb-1 md:mb-3">
            {choice.risk === 'the-line' && <AlertTriangle size={10} className="text-red-500 animate-pulse md:w-3.5 md:h-3.5" />}
            <span className={`text-[8px] md:text-[10px] font-mono tracking-widest md:tracking-[0.2em] uppercase ${
              choice.risk === 'measured' ? 'text-green-400' :
              choice.risk === 'aggressive' ? 'text-orange-400' :
              choice.risk === 'risky' ? 'text-yellow-400' :
              'text-red-500 font-bold'
            }`}>
              {choice.risk.replace('-', ' ')}
            </span>
          </div>

          <span className="font-serif text-xs md:text-xl text-primary/90 mb-1 md:mb-4 flex-1 drop-shadow-md flex items-center leading-tight">
            {choice.label}
          </span>

          <p className="hidden md:block text-xs text-secondary leading-relaxed font-mono opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 md:group-hover:translate-y-0">
            {choice.consequence}
          </p>
          
          {choice.hint && (
            <span className="hidden md:inline-block text-[10px] text-primary/40 mt-3 italic opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              {choice.hint}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
