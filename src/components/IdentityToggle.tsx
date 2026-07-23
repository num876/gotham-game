import { ActiveIdentity } from '@/types/game'
import { User, Shield } from 'lucide-react'

interface IdentityToggleProps {
  identity: ActiveIdentity
  onToggle: () => void
  disabled?: boolean
}

export function IdentityToggle({ identity, onToggle, disabled }: IdentityToggleProps) {
  return (
    <div className="flex items-center justify-center p-1 md:p-2 gap-2 md:gap-4">
      {/* Bruce Portrait */}
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 transition-all duration-300 ${identity === 'bruce' ? 'border-[#c9a84c] shadow-[0_0_10px_rgba(201,168,76,0.5)] scale-110' : 'border-transparent opacity-50 scale-90'}`}>
        <img src="/characters/bruce_wayne.png" alt="Bruce" className="w-full h-full object-cover" />
      </div>

      <div className="relative flex bg-black border border-border shadow-inner p-0.5 md:p-1">
        <button
          onClick={onToggle}
          disabled={disabled || identity === 'bruce'}
          className={`flex items-center justify-center gap-1 px-2 md:px-3 py-1.5 md:py-2 transition-all duration-300 font-mono tracking-widest text-[9px] md:text-xs ${
            identity === 'bruce' 
              ? 'bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/50 shadow-[0_0_10px_rgba(201,168,76,0.3)]' 
              : 'text-secondary hover:text-primary border border-transparent'
          }`}
        >
          <User size={12} />
          <span className="hidden sm:inline">BRUCE</span>
          <span className="sm:hidden">B</span>
        </button>
        <button
          onClick={onToggle}
          disabled={disabled || identity === 'batman'}
          className={`flex items-center justify-center gap-1 px-2 md:px-3 py-1.5 md:py-2 transition-all duration-300 font-mono tracking-widest text-[9px] md:text-xs ${
            identity === 'batman' 
              ? 'bg-red-900/40 text-red-500 border border-red-600 shadow-[0_0_10px_rgba(255,0,0,0.5)]' 
              : 'text-secondary hover:text-primary border border-transparent'
          }`}
        >
          <Shield size={12} />
          <span>BAT</span>
        </button>
      </div>
      
      {/* Batman Portrait */}
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 transition-all duration-300 ${identity === 'batman' ? 'border-red-600 shadow-[0_0_10px_rgba(255,0,0,0.5)] scale-110' : 'border-transparent opacity-50 scale-90'}`}>
        <img src="/characters/batman.png" alt="Batman" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}
