import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const { messages, currentSummary } = await req.json()
    
    if (!messages || messages.length === 0) {
      return NextResponse.json({ summary: currentSummary })
    }

    const conversationText = messages.map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')

    const prompt = `You are a narrative summarizer for a Batman text adventure game.
Your task is to take the previous summary (if any) and the recent conversation history, and output a single, dense, atmospheric paragraph summarizing the current state of the story.

PREVIOUS SUMMARY:
${currentSummary || "None."}

RECENT CONVERSATION:
${conversationText}

Write a new, cohesive summary in third-person present tense focusing on key events, decisions, and character statuses. Keep it under 150 words.`

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt,
      temperature: 0.3
    })

    return NextResponse.json({ summary: text.trim() })
  } catch (error) {
    console.error("Summarize error", error)
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 })
  }
}
