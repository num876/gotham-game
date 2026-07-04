import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'

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
      size: "1024x1024",
      response_format: "b64_json"
    })

    const b64 = response.data?.[0]?.b64_json
    if (!b64) {
      throw new Error('No image generated')
    }

    // Save locally
    const filename = `scene_${sessionId}_turn${turn}.png`
    const publicPath = path.join(process.cwd(), 'public', 'scenes')
    
    // Ensure dir exists
    await fs.mkdir(publicPath, { recursive: true })
    
    const filePath = path.join(publicPath, filename)
    await fs.writeFile(filePath, Buffer.from(b64, 'base64'))

    const url = `/scenes/${filename}?t=${Date.now()}`
    
    return NextResponse.json({ url })

  } catch (error) {
    const err = error as Error
    console.error('Failed to generate scene image:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
