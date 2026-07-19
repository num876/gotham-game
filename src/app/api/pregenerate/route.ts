import { NextResponse } from 'next/server'
import { GameState } from '@/types/game'
import { setCachedNarrative } from '@/lib/cache'
import OpenAI from 'openai'
import { buildSystemPrompt, buildUserMessage } from '@/lib/openai'
import { retrieveRelevantMemories } from '@/lib/vector-store'
import { generateHarleyDialogue } from '@/lib/agents/harley'

const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey, baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" }) : null

export async function POST(req: Request) {
  if (!openai) {
    return NextResponse.json({ success: false, reason: 'No OpenAI API key' })
  }

  try {
    const { state, choices, messageHistory, narrativeSummary } = await req.json()
    const sanitizedState = JSON.parse(JSON.stringify(state)) as GameState

    // We do not wait for this to finish before returning success to the client.
    // Background generation for all 3 choices.
    choices.forEach(async (choice: any) => {
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

        const response = await openai.chat.completions.create({
          model: 'gemini-1.5-pro',
          response_format: { type: "json_object" }, // we use json_object for pregen as json_schema is huge to duplicate here, but we can trust the LLM mostly
          messages: [
            { role: 'system', content: finalSystemPrompt + `\n\nRespond with valid JSON following the narrative_response schema.` },
            ...messageHistory.slice(-14),
            { role: 'user', content: buildUserMessage(sanitizedState, choice.label) }
          ],
          max_tokens: 4000
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          setCachedNarrative(state.sessionId, choice.id, parsed);
        }
      } catch (e) {
        console.error(`Pre-generation failed for choice ${choice.id}:`, e)
      }
    })

    return NextResponse.json({ success: true, message: 'Pre-generation started in background' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to trigger pre-generation' }, { status: 500 })
  }
}
