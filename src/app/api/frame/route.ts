import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'

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

    // Check if the frame already exists to avoid redundant generation
    const framesDir = path.join(process.cwd(), 'public', 'frames', sessionId)
    await fs.mkdir(framesDir, { recursive: true })
    const filePath = path.join(framesDir, `turn-${turn}.png`)

    try {
      await fs.access(filePath)
      // File exists, just return the path
      return NextResponse.json({ url: `/frames/${sessionId}/turn-${turn}.png` })
    } catch {
      // File does not exist, proceed to generate
    }

    const artStyle = "A highly realistic, cinematic visual photograph of the scene. Dark, gritty, and atmospheric. Masterful cinematography, dramatic lighting, moody shadows. Shot on 35mm film, photorealistic. CRITICAL: DO NOT include any text, words, borders, panels, or storyboard elements. This must be a single immersive photograph."
    const fullPrompt = `${artStyle} Environment: "${sceneTitle}". Description: ${narrative.substring(0, 300)}`

    const response = await openai.images.generate({
      model: "gpt-image-2",
      prompt: fullPrompt.substring(0, 1000), 
      n: 1,
      size: "1024x1024",
    })

    const b64 = response.data?.[0]?.b64_json
    const url = response.data?.[0]?.url
    
    if (b64) {
      await fs.writeFile(filePath, Buffer.from(b64, 'base64'))
    } else if (url) {
      const imageRes = await fetch(url)
      if (!imageRes.ok) throw new Error('Failed to download image from OpenAI URL')
      const buffer = await imageRes.arrayBuffer()
      await fs.writeFile(filePath, Buffer.from(buffer))
    } else {
      throw new Error('No image data returned from OpenAI')
    }

    return NextResponse.json({ url: `/frames/${sessionId}/turn-${turn}.png` })
  } catch (error: unknown) {
    console.error('Frame generation error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
