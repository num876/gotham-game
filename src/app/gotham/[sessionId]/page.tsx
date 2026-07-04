"use client"

import { useState, useEffect } from 'react'
import { initializeGameState } from '@/lib/game-state'
import { IdentityToggle } from '@/components/IdentityToggle'
import { ConsequenceRibbon } from '@/components/ConsequenceRibbon'
import { AllyPanel } from '@/components/AllyPanel'
import { CaseBoard } from '@/components/CaseBoard'
import { NarrativeDisplay } from '@/components/NarrativeDisplay'
import { DecisionPanel } from '@/components/DecisionPanel'
import { EpisodeTitle } from '@/components/EpisodeTitle'
import { BackgroundEffects } from '@/components/BackgroundEffects'
import { useGameStore } from '@/lib/store'
import { Menu, X } from 'lucide-react'

export default function GameSession({ params }: { params: { sessionId: string } }) {
  const { state, setState, messages, setMessages, narrativeSummary } = useGameStore()
  const [hasHydrated, setHasHydrated] = useState(false)
  
  const [narrative, setNarrative] = useState("")
  const [sceneTitle, setSceneTitle] = useState("")
  const [speakerLines, setSpeakerLines] = useState<{ character: string, line: string, emotion?: string }[]>([])
  const [visualEffect, setVisualEffect] = useState<'rain' | 'fog' | 'neon' | 'office' | 'cave' | 'none' | 'snow' | 'thunderstorm' | 'smoke' | 'siren' | 'fire' | 'spotlight'>('rain')
  const [ambientAudioUrl, setAmbientAudioUrl] = useState<string | null>(null)
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    useGameStore.persist.rehydrate()
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) return

    // If no state, or if we switched to a new session ID, reset and initialize
    if (!state || state.sessionId !== params.sessionId) {
      const initialState = initializeGameState(params.sessionId)
      setState(initialState)
      setMessages([])
      
      setNarrative("The rain hasn't stopped for three days. You're in the study. Alfred left a file on the desk tonight. It's thirty years old. The phone is ringing. It's Harvey.")
      setSpeakerLines([
        { character: 'HARVEY DENT (PHONE)', line: "Bruce? Tell me you're still awake. We have a problem." }
      ])
    } else if (messages.length > 0) {
      // Re-hydrate the screen from the last message if available
      const lastMsg = messages[messages.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        setNarrative(lastMsg.content)
      }
    }
  }, [hasHydrated, params.sessionId])

  const handleIdentityToggle = () => {
    if (!state) return
    setState(prev => prev ? { 
      ...prev, 
      activeIdentity: prev.activeIdentity === 'bruce' ? 'batman' : 'bruce' 
    } : null)
  }

  const handleChoice = async (choiceId: string) => {
    if (!state || isLoading) return
    setIsLoading(true)
    setMobileSidebarOpen(false) // auto close sidebar on mobile when making a choice
    
    const choice = state.choices.find(c => c.id === choiceId)
    if (!choice) return

    const chosenIdentity = choice.identity as 'bruce' | 'batman'
    const stateToSend = { ...state, activeIdentity: chosenIdentity }
    
    // Immediately switch the UI theme
    setState(prev => prev ? { ...prev, activeIdentity: chosenIdentity } : null)

    try {
      const response = await fetch('/api/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: stateToSend,
          playerChoice: choice.label,
          messageHistory: messages,
          narrativeSummary
        })
      })

      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let streamedText = ''

      setNarrative('Awaiting encrypted transmission...')
      setSpeakerLines([])

      while (true) {
        const { value, done } = await reader.read()
        if (value) {
          streamedText += decoder.decode(value, { stream: !done })
          
          // Live extraction of narrative to show it streaming
          const narrativeMatch = streamedText.match(/"narrative"\s*:\s*"((?:[^"\\]|\\.)*)/)
          if (narrativeMatch && narrativeMatch[1]) {
            const partialNarrative = narrativeMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\')
            setNarrative(partialNarrative + (done ? '' : '...'))
          }
        }
        if (done) {
          if (!value) streamedText += decoder.decode()
          break
        }
      }

      try {
        let cleanText = streamedText.trim()
        if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7)
        else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3)
        if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3)
        cleanText = cleanText.trim()

        const data = JSON.parse(cleanText)
        
        if (data.error) {
          setNarrative(`[SYSTEM ERROR] Connection severed. Diagnostic: ${data.error}`)
          return
        }

        if (data.narrative) setNarrative(data.narrative)
        if (data.sceneTitle) setSceneTitle(data.sceneTitle)
        if (data.visualEffect) setVisualEffect(data.visualEffect)
        if (data.speakerLines) setSpeakerLines(data.speakerLines)
        
        if (data.sceneImagePrompt) {
          fetch('/api/scene-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: data.sceneImagePrompt,
              sessionId: params.sessionId,
              turn: state.turn + 1
            })
          }).then(res => res.json()).then(sceneData => {
            if (sceneData.url) setSceneImageUrl(sceneData.url)
          }).catch(err => console.error("Failed to generate scene image:", err))
        }

        if (data.ambientAudioPrompt) {
          fetch('/api/ambient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ambientPrompt: data.ambientAudioPrompt,
              sessionId: params.sessionId,
              turn: state.turn + 1
            })
          }).then(res => res.json()).then(ambientData => {
            if (ambientData.url) setAmbientAudioUrl(ambientData.url)
          }).catch(err => console.error("Failed to generate ambient audio:", err))
        }

        setState(prevState => {
          if (!prevState) return prevState;
          const nextState = { ...prevState, turn: prevState.turn + 1 };
          
          if (data.choices && data.choices.length > 0) nextState.choices = data.choices;
          if (data.newConsequence) nextState.consequences = [...nextState.consequences, data.newConsequence];
          if (data.statDeltas) {
            nextState.harveyStability = Math.max(0, Math.min(100, nextState.harveyStability + (data.statDeltas.harveyStability || 0)));
            nextState.gordonRelationship = Math.max(0, Math.min(100, nextState.gordonRelationship + (data.statDeltas.gordonRelationship || 0)));
            nextState.selinaTrust = Math.max(0, Math.min(100, nextState.selinaTrust + (data.statDeltas.selinaTrust || 0)));
            nextState.gildaTrust = Math.max(0, Math.min(100, nextState.gildaTrust + (data.statDeltas.gildaTrust || 0)));
            nextState.cityHope = Math.max(0, Math.min(100, nextState.cityHope + (data.statDeltas.cityHope || 0)));
            nextState.brucePsycheCost = Math.max(0, nextState.brucePsycheCost + (data.statDeltas.brucePsycheCost || 0));
          }
          if (data.harveyArcUpdate?.newStage) nextState.harveyArc = data.harveyArcUpdate.newStage;
          if (data.harleyStatusUpdate?.newStatus) nextState.harleyStatus = data.harleyStatusUpdate.newStatus;
          if (data.gordonArcUpdate?.newArc) nextState.gordonArc = data.gordonArcUpdate.newArc;
          if (data.falconeStatusUpdate?.newStatus) nextState.falconeStatus = data.falconeStatusUpdate.newStatus;
          if (data.penguinStatusUpdate?.newStatus) nextState.penguinStatus = data.penguinStatusUpdate.newStatus;
          if (data.sceneTitle) nextState.currentSceneTitle = data.sceneTitle;
          if (typeof data.identitySwitchAvailable === 'boolean') nextState.identitySwitchAvailable = data.identitySwitchAvailable;
          
          if (data.caseUpdate && data.caseUpdate.newEvidence) {
            if (nextState.activeCase && nextState.activeCase.suspects) {
              const targetSuspectId = data.caseUpdate.suspectId || nextState.activeCase.suspects[0].id;
              const suspectIndex = nextState.activeCase.suspects.findIndex(s => s.id === targetSuspectId);
              if (suspectIndex >= 0) {
                 const newSuspects = [...nextState.activeCase.suspects];
                 newSuspects[suspectIndex] = { ...newSuspects[suspectIndex] };
                 newSuspects[suspectIndex].evidence = [...(newSuspects[suspectIndex].evidence || []), data.caseUpdate.newEvidence];
                 if (data.caseUpdate.newSuspectNote) {
                   newSuspects[suspectIndex].notes = [...(newSuspects[suspectIndex].notes || []), data.caseUpdate.newSuspectNote];
                 }
                 nextState.activeCase = { ...nextState.activeCase, suspects: newSuspects };
              }
            }
          }
          return nextState;
        });
        
        const historyNarrative = data.narrative || ""
        const historyDialogue = (data.speakerLines || []).map((l: { character: string, emotion?: string, line: string }) => `${l.character} (${l.emotion || 'neutral'}): ${l.line}`).join('\n')
        
        setMessages(prev => {
          const newMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            ...prev,
            { role: 'user', content: choice.label },
            { role: 'assistant', content: `${historyNarrative}\n\n${historyDialogue}` }
          ]
          
          // Trigger summarization if context is getting too long
          if (newMessages.length > 10) {
             fetch('/api/summarize', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ messages: newMessages, currentSummary: useGameStore.getState().narrativeSummary })
             })
             .then(res => res.json())
             .then(sumData => {
                if (sumData.summary) {
                  useGameStore.getState().setNarrativeSummary(sumData.summary)
                  useGameStore.getState().setMessages(newMessages.slice(-2)) // keep only the last interaction
                }
             }).catch(console.error)
          }

          return newMessages
        })
      } catch (e) {
        console.error('Failed to parse final JSON', e)
        console.error('Streamed text:', streamedText)
        setNarrative(`[SYSTEM ERROR] Data corruption detected in neural link.\n\nRaw intercept:\n${streamedText}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasHydrated || !state) return <div className="min-h-screen bg-[#06080c] flex items-center justify-center text-primary font-mono tracking-widest animate-pulse">INITIALISING LINK...</div>

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-colors duration-1000 ${state.activeIdentity === 'batman' ? 'theme-batman' : 'theme-bruce'} relative`}>
      {/* Identity specific background effects */}
      {state.activeIdentity === 'batman' && (
        <>
          <div className="absolute inset-0 crt-overlay z-50 mix-blend-overlay pointer-events-none opacity-40" />
          <div className="absolute inset-0 bg-red-900/5 animate-flicker mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_15px_rgba(255,0,0,0.8)] z-50" />
        </>
      )}
      {state.activeIdentity === 'bruce' && (
        <>
          <div className="absolute inset-0 bg-blue-900/5 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-blue-900/10 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)] z-50" />
        </>
      )}

      {/* Dynamic Environment Effects */}
      <BackgroundEffects visualEffect={visualEffect} ambientAudioUrl={ambientAudioUrl} sceneImageUrl={sceneImageUrl} />

      {/* Top Bar - Consequence Ribbon & Identity Toggle */}
      <div className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-md relative z-40 shadow-md">
        <div className="flex items-center justify-between px-2 md:px-4">
          <button 
            className="md:hidden p-2 text-primary hover:bg-white/5 rounded mr-2"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1 overflow-x-auto hidden sm:block">
            <ConsequenceRibbon consequences={state.consequences} />
          </div>
          <div className="shrink-0 border-x border-border/50 bg-background/50 ml-auto">
            <IdentityToggle 
              identity={state.activeIdentity} 
              onToggle={handleIdentityToggle}
              disabled={!state.identitySwitchAvailable || isLoading}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left / Center - Narrative */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" />
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar">
            <EpisodeTitle episodeId={state.episode} chapterTitle={state.chapterTitle} />
            <NarrativeDisplay 
              prose={narrative} 
              speakerLines={speakerLines} 
              isLoading={isLoading}
              sceneTitle={sceneTitle}
              sessionId={params.sessionId}
              turn={state.turn}
            />
          </div>
          
          <div className="z-20 mt-auto">
            <DecisionPanel 
              choices={state.choices} 
              onChoice={handleChoice}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Right Sidebar - Allies & Case */}
        <div className={`${mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 absolute right-0 top-0 bottom-0 md:relative w-[320px] shrink-0 flex flex-col border-l border-border bg-surface/95 md:bg-surface/50 z-50 shadow-[-5px_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden transition-transform duration-300`}>
          <div className="h-1/2 overflow-hidden border-b border-border/50">
            <AllyPanel 
              allies={state.allies}
              harveyStability={state.harveyStability}
            />
          </div>
          <div className="h-1/2 overflow-hidden">
            {state.activeIdentity === 'batman' ? (
              <CaseBoard activeCase={state.activeCase} />
            ) : (
              <div className="flex flex-col h-full bg-surface/30 p-4">
                 <h3 className="text-xs font-mono text-secondary tracking-widest uppercase mb-4 border-b border-border/50 pb-2">City Sentiment</h3>
                 
                 <div className="space-y-4">
                   <div>
                     <div className="flex justify-between text-xs font-serif mb-1 text-primary/80">
                       <span>Wayne Foundation Rep</span>
                       <span className="font-mono text-[10px]">{state.bruceReputation}</span>
                     </div>
                     <div className="h-1 bg-background rounded overflow-hidden">
                       <div className="h-full bg-bruce/60 transition-all duration-1000" style={{ width: `${state.bruceReputation}%` }} />
                     </div>
                   </div>

                   <div>
                     <div className="flex justify-between text-xs font-serif mb-1 text-primary/80">
                       <span>City Hope</span>
                       <span className="font-mono text-[10px]">{state.cityHope}</span>
                     </div>
                     <div className="h-1 bg-background rounded overflow-hidden">
                       <div className="h-full bg-primary/40 transition-all duration-1000" style={{ width: `${state.cityHope}%` }} />
                     </div>
                   </div>

                   <div className="pt-4 border-t border-border/50">
                     <div className="flex justify-between text-xs font-serif mb-1 text-primary/80">
                       <span>Psyche Cost</span>
                       <span className="font-mono text-[10px] text-red-500">{state.brucePsycheCost}</span>
                     </div>
                     <div className="h-1 bg-background rounded overflow-hidden">
                       <div className="h-full bg-red-900/60 transition-all duration-1000" style={{ width: `${state.brucePsycheCost}%` }} />
                     </div>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

