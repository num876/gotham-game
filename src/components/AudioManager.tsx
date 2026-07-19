import { useEffect, useRef, useState } from 'react'
import { GamePhase } from '@/types/game'
import { useGameStore } from '@/lib/store'

interface AudioManagerProps {
  ambientAudioUrl: string | null
  gamePhase: GamePhase
  brucePsycheCost: number
}

export function AudioManager({ ambientAudioUrl, gamePhase, brucePsycheCost }: AudioManagerProps) {
  const ambientRef = useRef<HTMLAudioElement | null>(null)
  const { isVoicePlaying } = useGameStore()
  
  // Base drone logic (simulated for now, as we don't have local drone MP3s. We could use web audio API oscillators or just let the ElevenLabs audio loop)
  // For the sake of this feature, we will focus on the ElevenLabs ambient audio and make it loop, adjusting its volume based on psyche cost.
  
  const [baseVolume, setBaseVolume] = useState(0.5)

  useEffect(() => {
    // Higher psyche cost = louder, more oppressive ambient sound
    const newVolume = Math.min(1.0, 0.3 + (brucePsycheCost / 100) * 0.7)
    setBaseVolume(newVolume)
  }, [brucePsycheCost])

  useEffect(() => {
    if (ambientRef.current) {
      // Audio ducking: lower volume by 70% when a voice is playing
      const currentVol = isVoicePlaying ? baseVolume * 0.3 : baseVolume
      ambientRef.current.volume = currentVol
    }
  }, [isVoicePlaying, baseVolume])

  useEffect(() => {
    if (ambientRef.current && ambientAudioUrl) {
      ambientRef.current.volume = isVoicePlaying ? baseVolume * 0.3 : baseVolume
      ambientRef.current.play().catch(e => console.warn('Audio autoplay prevented', e))
    }
  }, [ambientAudioUrl])

  return (
    <>
      {ambientAudioUrl && (
        <audio
          ref={ambientRef}
          src={ambientAudioUrl}
          loop
          className="hidden"
        />
      )}
    </>
  )
}
