/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { GameState } from '@/types/game'
import { setCachedNarrative } from '@/lib/cache'
import { GoogleGenAI } from '@google/genai'
import { buildSystemPrompt, buildUserMessage } from '@/lib/openai'
import { retrieveRelevantMemories } from '@/lib/vector-store'
import { generateHarleyDialogue } from '@/lib/agents/harley'

const apiKey = process.env.GEMINI_API_KEY
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

export async function POST(req: Request) {
  if (!ai) {
    return NextResponse.json({ success: false, reason: 'No Gemini API key' })
  }

  try {
    const { state, choices, messageHistory, narrativeSummary } = await req.json()
    const sanitizedState = JSON.parse(JSON.stringify(state)) as GameState

    // We do not wait for this to finish before returning success to the client.
    // Background generation for all choices.
    choices.forEach(async (choice: { id: string, label: string, identity: string }) => {
      try {
        let finalSystemPrompt = buildSystemPrompt(sanitizedState)
        if (narrativeSummary) {
          finalSystemPrompt += `\n\nNARRATIVE SUMMARY SO FAR:\n${narrativeSummary}`
        }

        const query = `Scene: ${state.currentSceneTitle}. Player Choice: ${choice.label}. Identity: ${choice.identity}`;
        const relevantMemories = await retrieveRelevantMemories(state.sessionId, query);
        if (relevantMemories.length > 0) {
          finalSystemPrompt += `\n\n--- RELEVANT PAST MEMORIES ---\n${relevantMemories.map((m: string, i: number) => `[Memory ${i + 1}]: ${m}`).join('\n')}\n------------------------------`
        }

        const harleyLine = await generateHarleyDialogue(sanitizedState, choice.label);
        if (harleyLine) {
           finalSystemPrompt += `\n\nCRITICAL MULTI-AGENT INJECTION:\nHarley Quinn is present in this scene. Her dedicated agent has generated her dialogue response to the player's choice. You MUST include this exact line of dialogue in your 'speakerLines' output for her: "${harleyLine}"\nEnsure your generated narrative contextualizes her saying this.`
        }

        // Merge messages into the format Gemini expects for contents
        let contentsText = finalSystemPrompt + `\n\nRespond with valid JSON following the narrative_response schema.\n\n`;
        
        (messageHistory || []).slice(-14).forEach((msg: any) => {
          contentsText += `${msg.role.toUpperCase()}: ${msg.content}\n\n`
        })
        contentsText += `USER: ${buildUserMessage(sanitizedState, choice.label)}`

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: contentsText,
          config: {
            responseMimeType: 'application/json',
            maxOutputTokens: 4000
          }
        });

        const content = response.text;
        if (content) {
          const parsed = JSON.parse(content);
          setCachedNarrative(state.sessionId, choice.id, parsed);
        }
      } catch (e) {
        console.error(`Pre-generation failed for choice ${choice.id}:`, e)
      }
    })

    return NextResponse.json({ success: true, message: 'Pre-generation started in background' })
  } catch {
    return NextResponse.json({ error: 'Failed to trigger pre-generation' }, { status: 500 })
  }
}
