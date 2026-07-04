import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

export async function POST(req: Request) {
  try {
    if (!openai) {
      return NextResponse.json({ error: 'OpenAI API key missing' }, { status: 503 })
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

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    })

    const imageUrl = response?.data?.[0]?.url
    if (!imageUrl) throw new Error('No image URL returned from OpenAI')

    // Download the image
    const imageResponse = await fetch(imageUrl)
    const arrayBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Save to public directory
    await fs.writeFile(imagePath, buffer)

    return NextResponse.json({ success: true, path: `/characters/${characterId}.png` })
  } catch (error: unknown) {
    console.error('Portrait generation error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
