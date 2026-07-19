import React from 'react'
import { motion } from 'framer-motion'
import { GameState } from '../types/game'

interface TerritoryMapProps {
  state: GameState
  onAllocateSquad: (districtId: string, districtName: string) => void
  disabled?: boolean
}

export function TerritoryMap({ state, onAllocateSquad, disabled }: TerritoryMapProps) {
  const territories = state.territories || {}
  const availableSquads = state.gcpdSquadsAvailable || 0

  const getControlColor = (control: string) => {
    switch (control) {
      case 'gcpd': return 'border-blue-500 text-blue-400 bg-blue-900/20'
      case 'joker': return 'border-green-500 text-green-400 bg-green-900/20'
      case 'two-face': return 'border-orange-500 text-orange-400 bg-orange-900/20'
      case 'contested':
      default:
        return 'border-gray-500 text-gray-400 bg-gray-900/20'
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full bg-black/80 border border-gray-700 p-6 flex flex-col font-mono text-sm"
    >
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
        <h2 className="text-xl text-red-500 font-bold tracking-widest">GOTHAM CITY: NO MAN'S LAND</h2>
        <div className="text-blue-400">
          GCPD SQUADS AVAILABLE: <span className="font-bold text-lg">{availableSquads}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow">
        {Object.entries(territories).map(([id, data]) => {
          const name = id.charAt(0).toUpperCase() + id.slice(1)
          const colorClass = getControlColor(data.control)
          
          return (
            <motion.div 
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 border ${colorClass} flex flex-col justify-between transition-colors`}
            >
              <div>
                <h3 className="text-lg font-bold mb-1 tracking-wide uppercase">{name} DISTRICT</h3>
                <div className="text-xs opacity-75 uppercase tracking-widest mb-3">
                  CONTROL: {data.control}
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="text-xs">
                  DEFENSE SQUADS: {data.squadsAssigned}
                </div>
                <button
                  onClick={() => onAllocateSquad(id, name)}
                  disabled={disabled || availableSquads <= 0}
                  className="px-4 py-1 bg-gray-800 border border-gray-600 hover:border-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase text-xs tracking-wider"
                >
                  Deploy Squad
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-xs text-gray-500 text-center italic"
      >
        Awaiting tactical deployment. Command the GCPD to hold the line against the chaos.
      </motion.div>
    </motion.div>
  )
}
