import { useGameStore } from '@/lib/store'
import { Package } from 'lucide-react'
import { GameState } from '../types/game'
import { useState } from 'react'

export function InventoryPanel() {
  const { state, setState } = useGameStore()
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  if (!state || state.activeIdentity !== 'batman' || !state.inventory || state.inventory.length === 0) return null

  const handleUseItem = (item: string) => {
    // We update a local state just to show it's active.
    // In page.tsx, we could append this to the choice string so the LLM sees it.
    if (selectedItem === item) {
      setSelectedItem(null)
      setState(prev => prev ? { ...prev, activeGadget: undefined } : null)
    } else {
      setSelectedItem(item)
      // We will inject this activeGadget into the next LLM prompt
      setState(prev => prev ? { ...prev, activeGadget: item } as GameState : null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md border-t border-border/50 p-6 font-mono relative overflow-hidden shadow-inner">
      <div className="absolute inset-0 crt-overlay opacity-40 pointer-events-none" />
      
      <div className="flex justify-between items-baseline mb-6 border-b border-border/30 pb-3 relative z-10">
        <h3 className="text-[10px] text-yellow-500 tracking-[0.2em] flex items-center font-bold">
          <Package className="w-3 h-3 mr-2" /> WAYNETECH INVENTORY
        </h3>
      </div>

      <div className="space-y-3 relative z-10 overflow-y-auto custom-scrollbar pr-2">
        {state.inventory.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleUseItem(item)}
            className={`w-full text-left p-3 rounded border transition-all duration-300 ${
              selectedItem === item 
                ? 'bg-yellow-950/40 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                : 'bg-black/40 border-border/30 hover:border-yellow-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] tracking-widest uppercase font-bold ${selectedItem === item ? 'text-yellow-400' : 'text-primary/70'}`}>
                {item}
              </span>
              {selectedItem === item && <span className="text-[8px] bg-yellow-500 text-black px-1 rounded animate-pulse">ARMED</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
