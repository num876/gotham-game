import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

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

    const ambientDir = path.join(process.cwd(), 'public', 'ambient', sessionId)
    await fs.mkdir(ambientDir, { recursive: true })
    const filePath = path.join(ambientDir, `turn-${turn}.mp3`)

    try {
      await fs.access(filePath)
      return NextResponse.json({ url: `/ambient/${sessionId}/turn-${turn}.mp3` })
    } catch {
      // File does not exist, proceed
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

    const buffer = await response.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(buffer))

    return NextResponse.json({ url: `/ambient/${sessionId}/turn-${turn}.mp3` })
  } catch (error: unknown) {
    console.error('Ambient generation error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
