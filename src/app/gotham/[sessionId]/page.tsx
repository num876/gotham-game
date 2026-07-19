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
import { AudioManager } from '@/components/AudioManager'
import { InventoryPanel } from '@/components/InventoryPanel'
import { EpilogueViewer } from '@/components/EpilogueViewer'
import { TerritoryMap } from '@/components/TerritoryMap'
import { useGameStore } from '@/lib/store'
import { Menu, X, Save } from 'lucide-react'
import { SaveManager } from '@/components/ui/save-manager'

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
  const [showSaveManager, setShowSaveManager] = useState(false)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, params.sessionId])

  const handleIdentityToggle = () => {
    if (!state) return
    setState(prev => prev ? { 
      ...prev, 
      activeIdentity: prev.activeIdentity === 'bruce' ? 'batman' : 'bruce' 
    } : null)
  }

  const handleChoice = async (choiceId: string, customMessage?: string) => {
    if (!state || isLoading) return
    setIsLoading(true)
    setMobileSidebarOpen(false) // auto close sidebar on mobile when making a choice
    
    // Support custom choice routing (like Territory map deployment)
    const choice = choiceId === 'tactical_deployment' 
      ? { id: choiceId, label: customMessage || 'Tactical Deployment', identity: state.activeIdentity }
      : state.choices.find(c => c.id === choiceId)
      
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
          narrativeSummary,
          choiceId: choice.id
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
          }).then(async res => {
            if (res.ok) {
              const blob = await res.blob()
              setAmbientAudioUrl(URL.createObjectURL(blob))
            } else {
              console.error("Failed to fetch ambient audio")
            }
          }).catch(err => console.error("Failed to generate ambient audio:", err))
        }

        const historyNarrative = data.narrative || ""
        const historyDialogue = (data.speakerLines || []).map((l: { character: string, emotion?: string, line: string }) => `${l.character} (${l.emotion || 'neutral'}): ${l.line}`).join('\n')

        setState(prevState => {
          if (!prevState) return prevState;
          const nextState = { ...prevState, turn: prevState.turn + 1 };
          
          if (data.choices && data.choices.length > 0) {
            nextState.choices = data.choices;
            
            // Trigger background pre-generation of these new choices
            fetch('/api/pregenerate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                state: nextState,
                choices: data.choices,
                messageHistory: [...messages, { role: 'user', content: choice.label }, { role: 'assistant', content: `${historyNarrative}\n\n${historyDialogue}` }],
                narrativeSummary
              })
            }).catch(console.error);
          }
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
          if (data.twoFacePhaseUpdate?.newPhase) nextState.twoFacePhase = data.twoFacePhaseUpdate.newPhase;
          if (data.gildaArcPhaseUpdate?.newPhase) nextState.gildaArcPhase = data.gildaArcPhaseUpdate.newPhase;
          if (data.gildaKnowsUpdate?.knows !== undefined) nextState.gildaKnows = data.gildaKnowsUpdate.knows;
          if (data.harleyStatusUpdate?.newStatus) nextState.harleyStatus = data.harleyStatusUpdate.newStatus;
          if (data.harleyAlignmentUpdate?.alignment) nextState.harleyAlignment = data.harleyAlignmentUpdate.alignment;
          if (data.gordonArcUpdate?.newArc) nextState.gordonArc = data.gordonArcUpdate.newArc;
          if (data.falconeStatusUpdate?.newStatus) nextState.falconeStatus = data.falconeStatusUpdate.newStatus;
          if (data.falconePhaseUpdate?.newPhase) nextState.falconePhase = data.falconePhaseUpdate.newPhase;
          if (data.falconeBranchUpdate?.newBranch) nextState.falconeBranch = data.falconeBranchUpdate.newBranch;
          if (data.falconeLedgerUpdate?.newStatus) nextState.falconeLedgerStatus = data.falconeLedgerUpdate.newStatus;
          if (data.falconeMoleFoundUpdate?.found) nextState.falconeMoleFound = data.falconeMoleFoundUpdate.found;
          if (data.falconeMoleIdentityUpdate?.identity) nextState.falconeMoleIdentity = data.falconeMoleIdentityUpdate.identity;
          if (data.catwomanChoiceUpdate?.choice) nextState.catwomanChoice = data.catwomanChoiceUpdate.choice;
          if (data.selinaAlignmentUpdate?.alignment) nextState.selinaAlignment = data.selinaAlignmentUpdate.alignment;
          if (data.penguinStatusUpdate?.newStatus) nextState.penguinStatus = data.penguinStatusUpdate.newStatus;
          if (data.penguinArcPhaseUpdate?.newPhase) nextState.penguinArcPhase = data.penguinArcPhaseUpdate.newPhase;
          if (data.gcpdMoleArcPhaseUpdate?.newPhase) nextState.gcpdMoleArcPhase = data.gcpdMoleArcPhaseUpdate.newPhase;
          if (data.episodeUpdate?.episode) nextState.episode = data.episodeUpdate.episode;
          if (data.scene45AppealFlagUpdate?.flag !== undefined) nextState.scene45AppealFlag = data.scene45AppealFlagUpdate.flag;
          if (data.outcomeUpdate?.outcome) {
            if (data.outcomeUpdate.outcome === 'city-falls' && nextState.gamePhase !== 'no-mans-land') {
              nextState.gamePhase = 'no-mans-land';
            } else {
              nextState.outcome = data.outcomeUpdate.outcome;
            }
          }
          if (data.alfredStatusUpdate?.status) nextState.alfredStatus = data.alfredStatusUpdate.status;
          if (data.jokerInfectionSpreadUpdate?.spread !== undefined) nextState.jokerInfectionSpread = data.jokerInfectionSpreadUpdate.spread;
          if (data.harleyChaosBondUpdate?.bond !== undefined) nextState.harleyChaosBond = data.harleyChaosBondUpdate.bond;
          
          if (data.chapterUpdate?.chapter) {
            if (nextState.chapter === 1 && data.chapterUpdate.chapter === 2) {
               if (nextState.outcome === 'wrong-ending') {
                 nextState.selinaTrust = 0;
                 nextState.selinaAlignment = 'neutral';
               }
            }
            nextState.chapter = data.chapterUpdate.chapter;
          }
          if (data.gothamChaosUpdate?.chaos !== undefined) nextState.gothamChaos = data.gothamChaosUpdate.chaos;
          if (data.jokerPhaseUpdate?.phase) nextState.jokerPhase = data.jokerPhaseUpdate.phase;
          if (data.robinTrustUpdate?.trust !== undefined) nextState.robinTrust = data.robinTrustUpdate.trust;
          if (data.robinPhaseUpdate?.phase) nextState.robinPhase = data.robinPhaseUpdate.phase;
          if (data.gordonJokerPhaseUpdate?.phase) nextState.gordonJokerPhase = data.gordonJokerPhaseUpdate.phase;
          if (data.gildaJokerPhaseUpdate?.phase) nextState.gildaJokerPhase = data.gildaJokerPhaseUpdate.phase;
          if (data.hallucinationPhaseUpdate?.phase) nextState.hallucinationPhase = data.hallucinationPhaseUpdate.phase;
          if (data.gamePhaseUpdate?.newPhase) nextState.gamePhase = data.gamePhaseUpdate.newPhase;
          if (data.territoriesUpdate) {
            nextState.territories = data.territoriesUpdate.territories;
            nextState.gcpdSquadsAvailable = data.territoriesUpdate.gcpdSquadsAvailable;
            
            // Check win/loss condition for No Man's Land
            if (nextState.territories) {
               const allGcpd = Object.values(nextState.territories).every(t => t.control === 'gcpd');
               if (allGcpd) {
                  nextState.outcome = 'gotham-survives';
               } else if ((nextState.gcpdSquadsAvailable || 0) <= 0) {
                  nextState.outcome = 'city-falls';
               }
            }
          }
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
          if (data.scannableEvidence && Array.isArray(data.scannableEvidence)) {
            if (nextState.activeCase) {
              const currentEvidence = nextState.activeCase.scannableEvidence || [];
              const newItems = data.scannableEvidence.map((ev: { id: string, description: string }) => ({ ...ev, isLinked: false }));
              nextState.activeCase = { ...nextState.activeCase, scannableEvidence: [...currentEvidence, ...newItems] };
            }
          }
          return nextState;
        });
        
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

  if (state && state.outcome) {
    return (
      <EpilogueViewer 
        outcome={state.outcome} 
        onRestart={() => {
          window.location.href = '/'
        }} 
      />
    )
  }

  return (
    <div className={`fixed inset-0 flex flex-col font-mono text-primary bg-[#020408] selection:bg-alert/30 selection:text-white transition-colors duration-1000 ${state?.activeIdentity === 'bruce' ? 'theme-bruce' : 'theme-batman'}`}>
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
      <BackgroundEffects visualEffect={visualEffect} sceneImageUrl={sceneImageUrl} />
      <AudioManager ambientAudioUrl={ambientAudioUrl} brucePsycheCost={state.brucePsycheCost} />

      {/* Top Bar - Consequence Ribbon & Identity Toggle */}
      <div className="shrink-0 border-b border-border bg-surface/80 backdrop-blur-md relative z-40 shadow-md pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-2 md:px-4 py-1">
          <button 
            className="md:hidden p-2 text-primary hover:bg-white/5 rounded mr-2"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button 
            className="p-2 text-primary/70 hover:text-primary hover:bg-white/5 rounded transition-colors mr-2 flex items-center gap-1"
            onClick={() => setShowSaveManager(true)}
            title="System Records"
          >
            <Save size={18} />
            <span className="hidden md:inline font-mono text-xs uppercase tracking-wider">Records</span>
          </button>
          <div className="flex-1 overflow-x-auto custom-scrollbar">
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
          {state.chapter === 2 && (
            <div className="absolute inset-0 pointer-events-none bg-purple-900/10 mix-blend-color z-0 animate-pulse" />
          )}
          
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

        {/* Mobile Sidebar Backdrop */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setMobileSidebarOpen(false)} 
          />
        )}

        {/* Right Sidebar - Allies & Case */}
        <div className={`${mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 absolute right-0 top-0 bottom-0 md:relative w-[320px] shrink-0 flex flex-col border-l border-border bg-surface/95 md:bg-surface/50 z-50 shadow-[-5px_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden transition-transform duration-300`}>
          <div className="h-1/2 overflow-hidden border-b border-border/50">
            <AllyPanel 
              allies={state.allies}
              harveyStability={state.harveyStability}
            />
          </div>
          <div className="h-1/2 flex flex-col overflow-hidden">
            {state.activeIdentity === 'batman' ? (
              state.gamePhase === 'no-mans-land' ? (
                <div className="flex-1 overflow-hidden">
                  <TerritoryMap 
                    state={state} 
                    onAllocateSquad={(districtId, districtName) => {
                      // Generate a custom choice message for the LLM
                      handleChoice('tactical_deployment', `Deployed GCPD Squad to ${districtName}.`)
                    }} 
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-hidden min-h-[50%]">
                    <CaseBoard activeCase={state.activeCase} />
                  </div>
                  <div className="h-[200px] shrink-0 border-t border-border/50">
                    <InventoryPanel />
                  </div>
                </>
              )
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

                   {state.chapter === 2 && (
                     <div className="pt-4 border-t border-border/50">
                       <div className="flex justify-between text-xs font-serif mb-1 text-primary/80">
                         <span className="text-purple-400">Gotham Chaos</span>
                         <span className="font-mono text-[10px] text-purple-400">{state.gothamChaos}</span>
                       </div>
                       <div className="h-1 bg-background rounded overflow-hidden">
                         <div className="h-full bg-purple-600 transition-all duration-1000" style={{ width: `${state.gothamChaos}%` }} />
                       </div>
                     </div>
                   )}

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

      {showSaveManager && (
        <SaveManager onClose={() => setShowSaveManager(false)} />
      )}
    </div>
  )
}

