import { ActiveIdentity } from '@/types/game'
import { User, Shield } from 'lucide-react'

interface IdentityToggleProps {
  identity: ActiveIdentity
  onToggle: () => void
  disabled?: boolean
}

export function IdentityToggle({ identity, onToggle, disabled }: IdentityToggleProps) {
  return (
    <div className="flex items-center justify-center p-2">
      <div className="relative flex w-72 bg-black border border-border shadow-inner p-1">
        <button
          onClick={onToggle}
          disabled={disabled || identity === 'bruce'}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 transition-all duration-300 font-mono tracking-widest text-xs ${
            identity === 'bruce' 
              ? 'bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/50 shadow-[0_0_10px_rgba(201,168,76,0.3)]' 
              : 'text-secondary hover:text-primary border border-transparent'
          }`}
        >
          <User size={14} />
          <span>BRUCE WAYNE</span>
        </button>
        <button
          onClick={onToggle}
          disabled={disabled || identity === 'batman'}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 transition-all duration-300 font-mono tracking-widest text-xs ${
            identity === 'batman' 
              ? 'bg-red-900/40 text-red-500 border border-red-600 shadow-[0_0_10px_rgba(255,0,0,0.5)]' 
              : 'text-secondary hover:text-primary border border-transparent'
          }`}
        >
          <Shield size={14} />
          <span>BATMAN</span>
        </button>
      </div>
    </div>
  )
}
