import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

export async function POST(req: Request) {
  try {
    const { sceneTitle, narrative, sessionId, turn } = await req.json()

    if (!sceneTitle || !narrative || !sessionId || typeof turn !== 'number') {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    if (!openai) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 })
    }

    const artStyle = "A highly realistic, cinematic visual photograph of the scene. Dark, gritty, and atmospheric. Masterful cinematography, dramatic lighting, moody shadows. Shot on 35mm film, photorealistic. CRITICAL: DO NOT include any text, words, borders, panels, or storyboard elements. This must be a single immersive photograph."
    const fullPrompt = `${artStyle} Environment: "${sceneTitle}". Description: ${narrative.substring(0, 300)}`

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt.substring(0, 1000), 
      n: 1,
      size: "1024x1024",
    })

    const url = response.data?.[0]?.url
    
    if (!url) {
      throw new Error('No image data returned from OpenAI')
    }

    return NextResponse.json({ url })
  } catch (error: unknown) {
    console.error('Frame generation error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
