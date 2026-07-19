import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { ambientPrompt, sessionId, turn } = await req.json()

    if (!ambientPrompt || !sessionId || typeof turn !== 'number') {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API Key not configured' }, { status: 503 })
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/sound-generation`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: ambientPrompt,
        duration_seconds: 15,
        prompt_influence: 0.3
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} ${errorData ? JSON.stringify(errorData) : ''}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    })
  } catch (error: unknown) {
    console.error('Ambient generation error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
