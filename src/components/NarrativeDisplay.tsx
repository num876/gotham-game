import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useGameStore } from '@/lib/store'

interface SpeakerLine {
  character: string
  line: string
  emotion?: string
}

interface NarrativeDisplayProps {
  prose: string
  sceneTitle?: string
  speakerLines: SpeakerLine[]
  isLoading: boolean
  sessionId?: string
  turn?: number
}

function getAvatar(char: string) {
  const lower = char.toLowerCase()
  if (lower.includes('batman')) return 'batman.png'
  if (lower.includes('bruce')) return 'bruce_wayne.png'
  if (lower.includes('alfred')) return 'alfred.png'
  if (lower.includes('gordon')) return 'gordon.png'
  if (lower.includes('two-face') || lower.includes('two face')) return 'two_face.png'
  if (lower.includes('gilda')) return 'gilda.png'
  if (lower.includes('harvey') || lower.includes('dent')) return 'harvey.png'
  if (lower.includes('catwoman')) return 'catwoman.png'
  if (lower.includes('selina')) return 'selina.png'
  if (lower.includes('falcone') || lower.includes('carmine')) return 'falcone.png'
  if (lower.includes('lucius') || lower.includes('fox')) return 'lucius.png'
  if (lower.includes('harley') || lower.includes('quinn')) return 'harley_quinn.png'
  if (lower.includes('harleen') || lower.includes('quinzel')) return 'quinzel.png'
  if (lower.includes('oswald') || lower.includes('cobblepot') || lower.includes('penguin')) return 'penguin.png'
  return null
}

export function NarrativeDisplay({ prose, sceneTitle, speakerLines, isLoading, sessionId, turn }: NarrativeDisplayProps) {
  const [playingIndex, setPlayingIndex] = useState<number>(-1)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isFetchingAudio, setIsFetchingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [frameUrl, setFrameUrl] = useState<string | null>(null)
  const [isGeneratingFrame, setIsGeneratingFrame] = useState(false)
  const { setIsVoicePlaying } = useGameStore()
  
  // Track previous scene to detect when scene changes
  const [lastSceneTitle, setLastSceneTitle] = useState<string | undefined>(undefined)

  useEffect(() => {
    // If the turn finishes (isLoading becomes false) and it's a new scene
    if (!isLoading && sceneTitle && sceneTitle !== lastSceneTitle && prose && sessionId && turn !== undefined) {
      setLastSceneTitle(sceneTitle)
      setFrameUrl(null)
      setIsGeneratingFrame(true)
      
      const fetchFrame = async () => {
        try {
          const res = await fetch('/api/frame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sceneTitle, narrative: prose, sessionId, turn })
          })
          if (res.ok) {
            const data = await res.json()
            if (data.url) setFrameUrl(data.url + '?t=' + Date.now()) // cache bust
          }
        } catch (e) {
          console.error('Failed to generate frame', e)
        } finally {
          setIsGeneratingFrame(false)
        }
      }
      
      fetchFrame()
    }
  }, [isLoading, sceneTitle, lastSceneTitle, prose, sessionId, turn])

  // Start sequence when loading finishes
  useEffect(() => {
    if (!isLoading && speakerLines.length > 0) {
      setPlayingIndex(prev => prev === -1 ? 0 : prev)
    } else if (isLoading) {
      setPlayingIndex(-1)
      setAudioUrl(null)
      if (audioRef.current) {
         audioRef.current.pause()
         setIsVoicePlaying(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  // Fetch audio for current playing index
  useEffect(() => {
    if (playingIndex >= 0 && playingIndex < speakerLines.length) {
      let isSubscribed = true
      setIsFetchingAudio(true)
      
      const fetchAudio = async () => {
        try {
          const line = speakerLines[playingIndex]
          const res = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: line.line, character: line.character, emotion: line.emotion })
          })
          
          if (res.ok && isSubscribed) {
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            setAudioUrl(url)
          } else if (isSubscribed) {
            setPlayingIndex(prev => prev + 1) // skip on error
          }
        } catch {
          if (isSubscribed) setPlayingIndex(prev => prev + 1)
        } finally {
          if (isSubscribed) setIsFetchingAudio(false)
        }
      }
      fetchAudio()
      
      return () => { isSubscribed = false }
    } else {
      setAudioUrl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingIndex])

  // Play when URL is ready
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl
      audioRef.current.play().then(() => {
        setIsVoicePlaying(true)
      }).catch(() => {
        console.warn('Auto-play blocked, falling back to visual timing')
        const lineText = speakerLines[playingIndex]?.line || ""
        const duration = Math.max(2000, lineText.length * 60)
        
        setTimeout(() => {
          setPlayingIndex(prev => prev + 1)
        }, duration)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl])

  return (
    <div className="space-y-6 md:space-y-12 relative">
      <audio 
        ref={audioRef} 
        onEnded={() => {
          setIsVoicePlaying(false)
          setPlayingIndex(prev => prev + 1)
        }} 
        onPause={() => setIsVoicePlaying(false)}
        className="hidden" 
      />

      {/* Storyboard Frame */}
      {(frameUrl || isGeneratingFrame) && (
        <div className="relative w-full aspect-[4/3] md:aspect-[21/9] bg-surface overflow-hidden border border-border/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center [clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)] md:[clip-path:polygon(20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px)] group">
          {frameUrl ? (
            <>
              <Image src={frameUrl} alt={sceneTitle || 'Scene Image'} fill className="object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110 grayscale-[0.2]" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30 mix-blend-multiply" />
              <div className="absolute inset-0 crt-overlay opacity-30 mix-blend-overlay" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-primary/50 space-y-4">
              <div className="relative w-10 h-10 md:w-16 md:h-16">
                <div className="absolute inset-0 border-2 border-alert/20 border-t-alert rounded-full animate-spin" />
                <div className="absolute inset-1.5 border-2 border-primary/20 border-b-primary rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                <div className="absolute inset-3 border-2 border-alert/20 border-l-alert rounded-full animate-[spin_3s_linear_infinite]" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">Establishing Feed...</span>
            </div>
          )}
          
          {sceneTitle && (
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 bg-gradient-to-t from-background to-transparent flex justify-between items-end">
              <h2 className="font-serif text-lg md:text-4xl text-white tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">{sceneTitle}</h2>
              <span className="font-mono text-[9px] md:text-[10px] text-alert tracking-widest uppercase mb-1">REC // 00:00:00</span>
            </div>
          )}
        </div>
      )}

      {prose && (
        <div className="prose prose-invert prose-p:font-serif prose-p:text-sm md:prose-p:text-2xl prose-p:leading-relaxed md:prose-p:leading-[1.8] prose-p:text-primary/80 max-w-2xl mx-auto tracking-wide relative">
          <div className="absolute -left-12 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent hidden md:block" />
          {prose.split('\n\n').map((p, i) => (
            <p key={i} className="mb-4 md:mb-6 drop-shadow-sm">{p}</p>
          ))}
        </div>
      )}

      {speakerLines.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-5 md:space-y-10 mt-4 md:mt-16 font-serif">
          {speakerLines.map((s, i) => {
            const avatar = getAvatar(s.character)
            const isPlaying = playingIndex === i
            
            return (
              <div key={i} className={`flex gap-3 md:gap-6 items-start transition-all duration-700 ${isPlaying ? 'opacity-100 translate-x-1 md:translate-x-2' : 'opacity-50 grayscale'}`}>
                {avatar && (
                  <div className={`w-10 h-10 md:w-14 md:h-14 shrink-0 mt-1 shadow-lg transition-all duration-700 [clip-path:polygon(7px_0,100%_0,100%_calc(100%-7px),calc(100%-7px)_100%,0_100%,0_7px)] md:[clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)] relative ${isPlaying ? 'border-none' : 'border border-border/50'}`}>
                     {isPlaying && (
                       <div className="absolute inset-0 bg-alert animate-pulse mix-blend-overlay opacity-30" />
                     )}
                    <Image src={`/characters/${avatar}?v=${Date.now()}`} alt={s.character} fill className={`object-cover ${isPlaying ? 'contrast-125' : 'contrast-75'}`} />
                  </div>
                )}
                <div className="flex flex-col relative flex-1 min-w-0">
                  <div className="flex items-center gap-2 md:gap-4 mb-1.5 md:mb-2">
                    <span className="text-[9px] md:text-[10px] font-mono text-alert tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold truncate">
                      {s.character}
                    </span>
                    {isPlaying && isFetchingAudio && (
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-alert/50" />
                        <span className="w-1.5 h-1.5 bg-alert animate-pulse" />
                        <span className="w-1.5 h-1.5 bg-alert/50" />
                      </span>
                    )}
                    {isPlaying && !isFetchingAudio && (
                      <span className="flex gap-0.5 items-end h-3">
                        <span className="w-0.5 bg-alert h-full audio-bar [animation-delay:0.1s]" />
                        <span className="w-0.5 bg-alert h-2/3 audio-bar [animation-delay:0.3s]" />
                        <span className="w-0.5 bg-alert h-full audio-bar [animation-delay:0.5s]" />
                        <span className="w-0.5 bg-alert h-1/2 audio-bar [animation-delay:0.2s]" />
                      </span>
                    )}
                  </div>
                  <p className={`text-sm md:text-2xl text-primary italic border-l-2 pl-3 md:pl-6 py-1 leading-snug md:leading-[1.6] transition-colors duration-500 ${isPlaying ? 'border-alert/70 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]' : 'border-border/30'}`}>
                    &quot;{s.line}&quot;
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8 md:py-16">
          <div className="flex items-center gap-3 text-secondary font-mono text-[10px] tracking-widest uppercase">
            <span className="w-8 h-px bg-secondary/50" />
            <span className="animate-pulse">Awaiting Transmission</span>
            <span className="w-8 h-px bg-secondary/50" />
          </div>
        </div>
      )}
    </div>
  )
}
