import { CaseFile } from '@/types/game'
import { DynamicPortrait } from './DynamicPortrait'

interface CaseBoardProps {
  activeCase: CaseFile | null
}

export function CaseBoard({ activeCase }: CaseBoardProps) {
  if (!activeCase) return null

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md border-t border-border/50 p-6 font-mono relative overflow-hidden shadow-inner">
      <div className="absolute inset-0 crt-overlay opacity-40 pointer-events-none" />
      
      <div className="flex justify-between items-baseline mb-6 border-b border-border/30 pb-3 relative z-10">
        <h3 className="text-[10px] text-alert tracking-[0.2em] flex items-center font-bold">
          <span className="w-1.5 h-1.5 bg-alert mr-3 animate-pulse rounded-sm shadow-[0_0_8px_rgba(255,0,0,0.8)]" /> TARGET FILE
        </h3>
        <span className="text-[10px] text-primary/80 tracking-widest">{activeCase.title.toUpperCase()}</span>
      </div>

      <div className="space-y-6 relative z-10 overflow-y-auto custom-scrollbar pr-2">
        <div>
          <h4 className="text-[9px] text-secondary tracking-widest mb-3 flex items-center">
            <span className="w-full h-px bg-border/30 mr-2 flex-1" />
            SUSPECTS
            <span className="w-full h-px bg-border/30 ml-2 flex-1" />
          </h4>
          <ul className="text-xs space-y-2">
            {activeCase.suspects.map(s => {
              const lowerName = s.name.toLowerCase()
              const avatar = lowerName.includes('falcone') ? 'falcone' : 
                            lowerName.includes('harvey') ? 'harvey' :
                            lowerName.includes('quinn') ? 'harley_quinn' :
                            lowerName.includes('quinzel') ? 'quinzel' :
                            lowerName.includes('catwoman') ? 'catwoman' :
                            lowerName.includes('selina') ? 'selina' :
                            lowerName.includes('gordon') ? 'gordon' : s.id
              
              return (
                <li key={s.id} className="flex flex-col mb-3 pb-2 border-b border-border/10 group hover:bg-surface/30 p-2 -mx-2 rounded transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 shrink-0 [clip-path:polygon(4px_0,100%_0,100%_calc(100%-4px),calc(100%-4px)_100%,0_100%,0_4px)]">
                        <DynamicPortrait 
                          characterId={avatar}
                          characterName={s.name}
                          className="w-full h-full object-cover border border-border/30 opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <span className={`tracking-wide ${s.suspectStatus === 'cleared' ? 'line-through opacity-40 text-secondary' : 'text-primary/90'}`}>
                        {s.name} {s.knownAlias && <span className="opacity-50 block text-[9px] mt-0.5">&quot;{s.knownAlias}&quot;</span>}
                      </span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-sm tracking-widest ${
                      s.suspectStatus === 'suspect' ? 'text-red-400 bg-red-900/30 border border-red-900/50 shadow-[0_0_8px_rgba(255,0,0,0.1)]' : 
                      s.suspectStatus === 'cleared' ? 'text-green-500/50 border border-green-900/20' :
                      'text-secondary border border-border/30'
                    }`}>
                      {s.suspectStatus.toUpperCase()}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        
        <div>
          <h4 className="text-[9px] text-secondary tracking-widest mb-3 flex items-center">
            <span className="w-full h-px bg-border/30 mr-2 flex-1" />
            EVIDENCE LOG
            <span className="w-full h-px bg-border/30 ml-2 flex-1" />
          </h4>
          <ul className="text-[11px] text-primary/70 space-y-2 border-l border-alert/30 ml-2 pl-3">
            {activeCase.keyEvidence.map((e, i) => (
              <li key={i} className="leading-relaxed relative before:content-[''] before:absolute before:-left-[15px] before:top-2 before:w-1.5 before:h-1.5 before:bg-alert/50 before:rounded-full">
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
