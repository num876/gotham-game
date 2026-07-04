import { NextResponse } from 'next/server'

function getVoiceId(char: string): string {
  const lower = (char || '').toLowerCase()
  if (lower.includes('batman')) return 'VxfsVBtoMoDz0PkhJBck'
  if (lower.includes('bruce')) return 'hQiwN2MhQBvtCYC4m40M'
  if (lower.includes('alfred')) return 'zDXJ9cwDU4ePiEdS60v7'
  if (lower.includes('gordon')) return 'cVJuz66fGl0o8fYZAYVV'
  if (lower.includes('two-face') || lower.includes('two face')) return 'jPp7R5uAZZj8K8qCtkxL'
  if (lower.includes('gilda')) return 'jg9bvFBBro9TXeCsGYPl'
  if (lower.includes('harvey') || lower.includes('dent')) return 'ZXnRaw8ZglWMIUuT4guk'
  if (lower.includes('selina') || lower.includes('catwoman')) return '78z0jBQKhn6JvSz1UCYX'
  if (lower.includes('falcone') || lower.includes('carmine')) return 'wuuHmQtMcb2ie78kSnos'
  if (lower.includes('lucius') || lower.includes('fox')) return 'uZLoCnAjr6ponDqIAa99'
  if (lower.includes('harley') || lower.includes('quinn')) return '7tc0293rSVCRnQT3cXpo'
  if (lower.includes('harleen') || lower.includes('quinzel')) return 'S9KHEWvsQv2rOCD8aNze'
  if (lower.includes('oswald') || lower.includes('cobblepot') || lower.includes('penguin')) return 'VCbSJfzSQ2x2NFCTdfnx'
  return 'IKne3meq5aSn9XLyUdCD' // DEFAULT_VOICE (Charlie)
}

export async function POST(req: Request) {
  try {
    const { text, character, emotion } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API Key not configured' }, { status: 503 })
    }

    const voiceId = getVoiceId(character)

    // Dynamic Emotion Mapping for ElevenLabs
    let stability = 0.35 // Lower stability = much more emotional and less robotic
    let similarity_boost = 0.70
    let style = 0.45 // Higher style forces the AI to match the emotional context of the text

    if (emotion) {
      const e = emotion.toLowerCase()
      if (['angry', 'furious', 'yelling', 'shouting', 'intense', 'panicked', 'desperate'].some(v => e.includes(v))) {
        stability = 0.20 // Maximum variation and expressiveness
        similarity_boost = 0.80
        style = 0.85 // Extremely high style boosts pitch and raw aggression
      } else if (['sad', 'hesitant', 'whisper', 'afraid', 'broken', 'quiet', 'grief'].some(v => e.includes(v))) {
        stability = 0.25 // Allows for cracking and breathing
        similarity_boost = 0.60
        style = 0.35
      } else if (['calm', 'cold', 'stoic', 'calculated', 'flat', 'serious'].some(v => e.includes(v))) {
        stability = 0.65 // Controlled, but not 100% robotic
        similarity_boost = 0.75
        style = 0.15
      } else if (['happy', 'amused', 'laughing', 'warm', 'mocking'].some(v => e.includes(v))) {
        stability = 0.35 
        similarity_boost = 0.75
        style = 0.50
      }
    }

    // Batman remains more stoic than others, but still needs some organic texture
    if (voiceId === 'VxfsVBtoMoDz0PkhJBck') {
       stability = Math.max(stability, 0.45)
    }

    // Harvey Dent speaks too quickly by default. We lower style and similarity to force a slower, more deliberate cadence.
    if (voiceId === 'ZXnRaw8ZglWMIUuT4guk') {
       similarity_boost = 0.50
       style = 0.10
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability,
          similarity_boost,
          style,
          use_speaker_boost: true
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('ElevenLabs API Error:', errorData || response.statusText)
      throw new Error('Failed to generate audio from ElevenLabs')
    }

    const arrayBuffer = await response.arrayBuffer()
    
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600' // Cache for an hour to prevent re-fetching the exact same line
      }
    })
  } catch (error: unknown) {
    console.error('Voice generation error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
