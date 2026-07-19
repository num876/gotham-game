import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GameState } from '@/types/game'

interface GameStore {
  state: GameState | null
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
  narrativeSummary: string
  setState: (state: GameState | null | ((prev: GameState | null) => GameState | null)) => void
  setMessages: (messages: { role: 'system' | 'user' | 'assistant'; content: string }[] | ((prev: { role: 'system' | 'user' | 'assistant'; content: string }[]) => { role: 'system' | 'user' | 'assistant'; content: string }[])) => void
  setNarrativeSummary: (summary: string) => void
  resetStore: () => void
  isVoicePlaying: boolean
  setIsVoicePlaying: (playing: boolean) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      state: null,
      messages: [],
      narrativeSummary: '',
      isVoicePlaying: false,
      setState: (newState) => set((prev) => ({
        state: typeof newState === 'function' ? newState(prev.state) : newState
      })),
      setMessages: (newMessages) => set((prev) => ({
        messages: typeof newMessages === 'function' ? newMessages(prev.messages) : newMessages
      })),
      setNarrativeSummary: (summary) => set({ narrativeSummary: summary }),
      resetStore: () => set({ state: null, messages: [], narrativeSummary: '', isVoicePlaying: false }),
      setIsVoicePlaying: (playing) => set({ isVoicePlaying: playing })
    }),
    {
      name: 'gotham-game-storage',
    }
  )
)

export interface SaveSlot {
  id: string
  name: string
  timestamp: number
  state: GameState
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
  narrativeSummary: string
}

interface SaveStore {
  slots: SaveSlot[]
  saveGame: (name: string, state: GameState, messages: { role: 'system' | 'user' | 'assistant'; content: string }[], narrativeSummary: string) => void
  loadGame: (id: string) => SaveSlot | undefined
  deleteSave: (id: string) => void
}

export const useSaveStore = create<SaveStore>()(
  persist(
    (set, get) => ({
      slots: [],
      saveGame: (name, state, messages, narrativeSummary) => {
        const newSlot: SaveSlot = {
          id: Date.now().toString(),
          name,
          timestamp: Date.now(),
          state,
          messages,
          narrativeSummary
        }
        set((prev) => ({ slots: [newSlot, ...prev.slots] }))
      },
      loadGame: (id) => {
        return get().slots.find(slot => slot.id === id)
      },
      deleteSave: (id) => {
        set((prev) => ({ slots: prev.slots.filter(slot => slot.id !== id) }))
      }
    }),
    {
      name: 'gotham-save-slots'
    }
  )
)
