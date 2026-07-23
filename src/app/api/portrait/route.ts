import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import fs from 'fs/promises'
import path from 'path'

const apiKey = process.env.GEMINI_API_KEY
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

export async function POST(req: Request) {
  try {
    if (!ai) {
      return NextResponse.json({ error: 'Gemini API key missing' }, { status: 503 })
    }

    const { characterId, characterName } = await req.json()
    
    if (!characterId || !characterName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const publicDir = path.join(process.cwd(), 'public', 'characters')
    const imagePath = path.join(publicDir, `${characterId}.png`)
    
    // Check if it already exists to prevent duplicate generation
    try {
      await fs.access(imagePath)
      return NextResponse.json({ success: true, path: `/characters/${characterId}.png` })
    } catch {
      // File doesn't exist, proceed to generate
    }

    const prompt = `A dark, cinematic noir style digital painting of ${characterName} from Batman. The lighting is dramatic, heavily shadowed, rim-lit. High contrast, gritty, telltale games aesthetic mixed with modern digital art. Portrait shot, looking directly at the camera.`

    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
        outputMimeType: "image/png"
      }
    })

    const base64 = response.generatedImages?.[0]?.image?.imageBytes
    if (!base64) throw new Error('No image base64 returned from Gemini Imagen')

    const buffer = Buffer.from(base64, 'base64')

    // Save to public directory
    await fs.writeFile(imagePath, buffer)

    return NextResponse.json({ success: true, path: `/characters/${characterId}.png` })
  } catch (error: unknown) {
    console.error('Portrait generation error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
