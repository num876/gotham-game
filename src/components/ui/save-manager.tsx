'use client'

import React, { useState } from 'react'
import { useSaveStore, useGameStore } from '@/lib/store'
import { Save, FolderOpen, Trash2, X, Plus } from 'lucide-react'

interface SaveManagerProps {
  onClose: () => void
}

export function SaveManager({ onClose }: SaveManagerProps) {
  const { slots, saveGame, loadGame, deleteSave } = useSaveStore()
  const { state, messages, narrativeSummary, setState, setMessages, setNarrativeSummary } = useGameStore()
  const [saveName, setSaveName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    if (!state) return
    const name = saveName.trim() || `Save ${slots.length + 1} - ${state.activeIdentity === 'batman' ? 'Batman' : 'Bruce'} - Chap ${state.chapter}`
    saveGame(name, state, messages, narrativeSummary)
    setSaveName('')
    setIsSaving(false)
  }

  const handleLoad = (id: string) => {
    const slot = loadGame(id)
    if (slot) {
      setState(slot.state)
      setMessages(slot.messages)
      setNarrativeSummary(slot.narrativeSummary)
      onClose()
    }
  }

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-surface/90 border border-border max-w-2xl w-full max-h-[80vh] flex flex-col relative rounded-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-black/20">
          <h2 className="font-serif text-xl text-primary flex items-center gap-2">
            <Save className="w-5 h-5 text-secondary" />
            System Records
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Save Area */}
        {state && (
          <div className="p-4 border-b border-border/30 bg-black/10">
            {isSaving ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter save designation..."
                  className="flex-1 bg-black/50 border border-border/50 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-secondary"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-secondary/20 hover:bg-secondary/40 text-secondary border border-secondary/50 rounded transition-colors font-mono text-sm"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => setIsSaving(false)}
                  className="px-4 py-2 hover:bg-white/5 rounded transition-colors font-mono text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSaving(true)}
                className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-border/50 hover:border-secondary/50 hover:bg-secondary/5 hover:text-secondary text-muted-foreground transition-all rounded"
              >
                <Plus className="w-4 h-4" />
                <span className="font-mono text-sm">Create New Record</span>
              </button>
            )}
          </div>
        )}

        {/* Save Slots List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {slots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-mono text-sm">
              No records found in the Batcomputer.
            </div>
          ) : (
            slots.map(slot => (
              <div 
                key={slot.id}
                className="flex items-center justify-between p-3 border border-border/50 bg-black/20 hover:bg-black/40 hover:border-border transition-all rounded group"
              >
                <div className="flex flex-col">
                  <span className="font-serif text-primary/90 group-hover:text-primary transition-colors">
                    {slot.name}
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground mt-1">
                    <span>{formatDate(slot.timestamp)}</span>
                    <span className="w-1 h-1 rounded-full bg-border/50" />
                    <span className={slot.state.activeIdentity === 'batman' ? 'text-secondary/80' : 'text-bruce/80'}>
                      {slot.state.activeIdentity.toUpperCase()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border/50" />
                    <span>Turn {slot.state.turn}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleLoad(slot.id)}
                    className="p-2 hover:bg-secondary/20 hover:text-secondary rounded transition-colors"
                    title="Load Game"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Delete this record permanently?')) {
                        deleteSave(slot.id)
                      }
                    }}
                    className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"
                    title="Delete Save"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  )
}
