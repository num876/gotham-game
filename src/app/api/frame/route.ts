import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const apiKey = process.env.GEMINI_API_KEY
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

export async function POST(req: Request) {
  try {
    const { sceneTitle, narrative, sessionId, turn } = await req.json()

    if (!sceneTitle || !narrative || !sessionId || typeof turn !== 'number') {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    if (!ai) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 503 })
    }

    const artStyle = "A highly realistic, cinematic visual photograph of the scene. Dark, gritty, and atmospheric. Masterful cinematography, dramatic lighting, moody shadows. Shot on 35mm film, photorealistic. CRITICAL: DO NOT include any text, words, borders, panels, or storyboard elements. This must be a single immersive photograph."
    const fullPrompt = `${artStyle} Environment: "${sceneTitle}". Description: ${narrative.substring(0, 300)}`

    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: fullPrompt.substring(0, 1000), 
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
        outputMimeType: "image/jpeg"
      }
    })

    const base64 = response.generatedImages?.[0]?.image?.imageBytes
    
    if (!base64) {
      throw new Error('No image data returned from Gemini Imagen')
    }

    const url = `data:image/jpeg;base64,${base64}`

    return NextResponse.json({ url })
  } catch (error: unknown) {
    console.error('Frame generation error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
