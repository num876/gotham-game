import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const apiKey = process.env.GEMINI_API_KEY
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

export async function POST(req: Request) {
  try {
    const { prompt, sessionId, turn } = await req.json()
    
    if (!prompt || !sessionId) {
      return NextResponse.json({ error: 'Missing prompt or sessionId' }, { status: 400 })
    }

    if (!ai) {
      // Offline fallback: Return a static placeholder or nothing
      return NextResponse.json({ url: null })
    }

    console.log(`Generating scene image for Turn ${turn}: "${prompt}"`)

    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
        outputMimeType: "image/jpeg"
      }
    })

    const base64 = response.generatedImages?.[0]?.image?.imageBytes
    if (!base64) {
      throw new Error('No image generated')
    }

    const url = `data:image/jpeg;base64,${base64}`

    return NextResponse.json({ url })

  } catch (error) {
    const err = error as Error
    console.error('Failed to generate scene image:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
