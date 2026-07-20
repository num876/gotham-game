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
    <>
      {/* Mobile: vertical stack of full-width tap targets */}
      <div className="flex flex-col gap-0 md:hidden bg-surface/90 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {choices.map((choice, idx) => (
          <button
            key={choice.id}
            onClick={() => onChoice(choice.id)}
            disabled={disabled}
            className={`group relative flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 active:scale-[0.98]
              ${idx > 0 ? 'border-t border-border/30' : ''}
              ${choice.risk === 'the-line'
                ? 'bg-alert/5 active:bg-alert/15'
                : 'bg-background/40 active:bg-primary/5'
              }
              ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}
            `}
          >
            {/* Left accent strip */}
            <div className={`w-0.5 self-stretch shrink-0 rounded-full ${
              choice.risk === 'measured' ? 'bg-green-400' :
              choice.risk === 'aggressive' ? 'bg-orange-400' :
              choice.risk === 'risky' ? 'bg-yellow-400' :
              'bg-alert animate-pulse'
            }`} />

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                {choice.risk === 'the-line' && <AlertTriangle size={9} className="text-red-500 animate-pulse shrink-0" />}
                <span className={`text-[9px] font-mono tracking-[0.2em] uppercase ${
                  choice.risk === 'measured' ? 'text-green-400' :
                  choice.risk === 'aggressive' ? 'text-orange-400' :
                  choice.risk === 'risky' ? 'text-yellow-400' :
                  'text-red-500 font-bold'
                }`}>
                  {choice.risk.replace('-', ' ')}
                </span>
              </div>
              <span className="font-serif text-sm text-primary/90 leading-snug">
                {choice.label}
              </span>
            </div>

            {/* Tap chevron */}
            <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 group-active:translate-x-1 ${choice.risk === 'the-line' ? 'text-alert/60' : 'text-secondary/40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Desktop: original 3-column grid */}
      <div className="hidden md:grid grid-cols-3 gap-6 p-8 bg-surface/80 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onChoice(choice.id)}
            disabled={disabled}
            className={`group flex flex-col items-center justify-center text-center p-6 transition-all duration-500 relative overflow-hidden backdrop-blur-md
              ${choice.risk === 'the-line' 
                ? 'border border-alert/30 bg-alert/5 hover:border-alert hover:bg-alert/10 hover:shadow-[0_0_30px_rgba(255,0,0,0.2)] hover-glitch' 
                : 'border border-border/50 bg-background/40 hover:border-primary/50 hover:bg-primary/5'
              }
              ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}
              [clip-path:polygon(15px_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%,0_15px)]
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            {choice.risk === 'the-line' && (
              <div className="absolute inset-0 border-2 border-red-500/10 animate-pulse pointer-events-none" />
            )}
            <div className="flex flex-row items-center space-x-2 mb-3">
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
            <span className="font-serif text-xl text-primary/90 mb-4 flex-1 drop-shadow-md flex items-center leading-tight">
              {choice.label}
            </span>
            <p className="text-xs text-secondary leading-relaxed font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
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
    </>
  )
}
