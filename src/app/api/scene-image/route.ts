import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey }) : null

export async function POST(req: Request) {
  try {
    const { prompt, sessionId, turn } = await req.json()
    
    if (!prompt || !sessionId) {
      return NextResponse.json({ error: 'Missing prompt or sessionId' }, { status: 400 })
    }

    if (!openai) {
      // Offline fallback: Return a static placeholder or nothing
      return NextResponse.json({ url: null })
    }

    console.log(`Generating scene image for Turn ${turn}: "${prompt}"`)

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024"
    })

    const url = response.data?.[0]?.url
    if (!url) {
      throw new Error('No image generated')
    }

    return NextResponse.json({ url })

  } catch (error) {
    const err = error as Error
    console.error('Failed to generate scene image:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
