import { Ally } from '@/types/game'
import { DynamicPortrait } from './DynamicPortrait'

interface AllyPanelProps {
  allies: Ally[]
  harveyStability: number
}

export function AllyPanel({ allies, harveyStability }: AllyPanelProps) {
  const isTwoFace = harveyStability === 0

  return (
    <div className="flex flex-col h-full bg-surface/20 backdrop-blur-xl border-l border-border/50 p-4 md:p-6 relative overflow-hidden">
      {/* Subtle CRT overlay on the sidebar */}
      <div className="absolute inset-0 crt-overlay opacity-20 pointer-events-none" />

      <h3 className="text-[10px] font-mono text-primary/70 tracking-[0.2em] uppercase mb-3 border-b border-border/30 pb-2 flex items-center relative z-10">
        <span className="w-1.5 h-1.5 bg-primary/70 rounded-full mr-3 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]" /> BIO-METRICS
      </h3>
      
      <div className="space-y-4 md:space-y-6 flex-1 overflow-y-auto pr-1 relative z-10 custom-scrollbar">
        {allies.map((ally) => {
          // Special handling for Harvey
          if (ally.id === 'harvey') {
            return (
              <div key={ally.id} className="space-y-2 group">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-10 h-10 shrink-0 [clip-path:polygon(5px_0,100%_0,100%_calc(100%-5px),calc(100%-5px)_100%,0_100%,0_5px)]">
                    <DynamicPortrait
                      characterId={isTwoFace ? 'two_face' : 'harvey'}
                      characterName={isTwoFace ? 'Two-Face' : 'Harvey Dent'}
                      className="w-full h-full object-cover border border-border/50 grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`font-serif font-bold text-sm tracking-wide ${isTwoFace ? 'text-red-500' : 'text-primary/90'}`}>
                        {isTwoFace ? 'TWO-FACE' : 'Harvey Dent'}
                      </span>
                      <span className="text-[9px] font-mono text-secondary tracking-widest">STABILITY</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-1 bg-black/60 rounded-sm overflow-hidden border border-white/5">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            harveyStability > 60 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                            harveyStability > 30 ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 
                            harveyStability > 0 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-secondary'
                          }`}
                          style={{ width: `${Math.max(harveyStability, 5)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono w-6 text-right opacity-60 text-primary">{harveyStability}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          // Special handling for Selina, Harley, Falcone badges
          let badge = ''
          if (ally.id === 'selina') {
             badge = ally.status.toUpperCase()
          }

          return (
            <div key={ally.id} className="space-y-2 group">
              <div className="flex items-center space-x-4 mb-2">
                <div className="w-10 h-10 shrink-0 [clip-path:polygon(5px_0,100%_0,100%_calc(100%-5px),calc(100%-5px)_100%,0_100%,0_5px)]">
                  <DynamicPortrait 
                    characterId={ally.name.toLowerCase().includes('quinn') ? 'harley_quinn' : ally.id === 'harley' ? 'quinzel' : ally.name.toLowerCase().includes('catwoman') ? 'catwoman' : ally.id}
                    characterName={ally.name}
                    className="w-full h-full object-cover border border-border/50 opacity-80 group-hover:opacity-100 transition-all duration-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-serif text-sm text-primary/90 tracking-wide">{ally.name}</span>
                    {badge ? (
                      <span className="text-[9px] font-mono text-alert border border-alert/30 bg-alert/10 px-1.5 py-0.5 rounded-sm tracking-widest">{badge}</span>
                    ) : (
                      <span className="text-[9px] font-mono text-secondary tracking-widest">TRUST</span>
                    )}
                  </div>
                  {!badge && (
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-1 bg-black/60 rounded-sm overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000"
                          style={{ width: `${ally.trustLevel}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono w-6 text-right opacity-60 text-primary">{ally.trustLevel}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
