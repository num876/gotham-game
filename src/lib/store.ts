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
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      state: null,
      messages: [],
      narrativeSummary: '',
      setState: (newState) => set((prev) => ({
        state: typeof newState === 'function' ? newState(prev.state) : newState
      })),
      setMessages: (newMessages) => set((prev) => ({
        messages: typeof newMessages === 'function' ? newMessages(prev.messages) : newMessages
      })),
      setNarrativeSummary: (summary) => set({ narrativeSummary: summary }),
      resetStore: () => set({ state: null, messages: [], narrativeSummary: '' })
    }),
    {
      name: 'gotham-game-storage',
    }
  )
)
