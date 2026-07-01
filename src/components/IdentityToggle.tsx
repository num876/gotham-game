import { ActiveIdentity } from '@/types/game'
import { User, Shield } from 'lucide-react'

interface IdentityToggleProps {
  identity: ActiveIdentity
  onToggle: () => void
  disabled?: boolean
}

export function IdentityToggle({ identity, onToggle, disabled }: IdentityToggleProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative flex w-64 p-1 bg-surface rounded-full border border-border">
        <button
          onClick={onToggle}
          disabled={disabled || identity === 'bruce'}
          className={\`flex-1 flex items-center justify-center space-x-2 py-2 rounded-full transition-all duration-300 \${
            identity === 'bruce' 
              ? 'bg-bruce/10 text-bruce shadow-sm' 
              : 'text-secondary hover:text-primary'
          }\`}
        >
          <User size={16} />
          <span className="text-sm font-medium tracking-wider">BRUCE WAYNE</span>
        </button>
        <button
          onClick={onToggle}
          disabled={disabled || identity === 'batman'}
          className={\`flex-1 flex items-center justify-center space-x-2 py-2 rounded-full transition-all duration-300 \${
            identity === 'batman' 
              ? 'bg-batman/20 text-blue-300 shadow-sm' 
              : 'text-secondary hover:text-primary'
          }\`}
        >
          <Shield size={16} />
          <span className="text-sm font-medium tracking-wider">BATMAN</span>
        </button>
      </div>
    </div>
  )
}
