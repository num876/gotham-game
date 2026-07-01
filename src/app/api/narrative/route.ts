import OpenAI from 'openai'
import { SYSTEM_PROMPT, buildUserMessage } from '@/lib/openai'
import { GameState } from '@/types/game'
import { NextResponse } from 'next/server'

// We will skip OpenAI if there's no API key to allow testing the UI
const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey }) : null

export async function POST(req: Request) {
  try {
    const { state, playerChoice, messageHistory } = await req.json() as {
      state: GameState
      playerChoice: string
      messageHistory: { role: 'user' | 'assistant'; content: string }[]
    }

    if (!openai) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messageHistory,
        { role: 'user', content: buildUserMessage(state, playerChoice) }
      ],
      max_tokens: 1200
    })

    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content
            if (text) controller.enqueue(new TextEncoder().encode(text))
          }
          controller.close()
        }
      }),
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    )
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
