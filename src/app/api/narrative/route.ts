import OpenAI from 'openai'
import { buildSystemPrompt, buildUserMessage } from '@/lib/openai'
import { GameState } from '@/types/game'
import { NextResponse } from 'next/server'
import { addMemory, retrieveRelevantMemories } from '@/lib/vector-store'
import { getCachedNarrative } from '@/lib/cache'
import { generateHarleyDialogue } from '@/lib/agents/harley'

// We will skip OpenAI if there's no API key to allow testing the UI
const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ 
  apiKey,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
}) : null

function generateMockResponse(state: GameState, playerChoice: string) {
  let mockNarrative = ""
  let mockSpeakerLines: { character: string; line: string; emotion?: string }[] = []
  let mockChoices: { id: string; label: string; identity: string; risk: string; consequence: string }[] = []
  const newStatDeltas = { harveyStability: 0, gordonRelationship: 0, selinaTrust: 0, gildaTrust: 0, cityHope: 0, brucePsycheCost: 0 }
  
  const turn = state.turn

  if (turn === 1) {
    mockNarrative = "The rain hasn't stopped for three days. It washes the blood off the streets but never cleans the city. You made a choice, and Gotham felt it. Falcone's operation at the docks is exposed, but the GCPD is too compromised to act. Someone needs to force his hand before he regroups."
    mockSpeakerLines = [
      { character: "GORDON", line: "We found the shipping manifest, but half my squad is on his payroll. We can't make a legal move on him.", emotion: "frustrated" },
      { character: "BATMAN", line: "Then I'll make an illegal one.", emotion: "cold" }
    ]
    mockChoices = [
      { id: `c${Date.now()}1`, label: 'Infiltrate the docks violently', identity: 'batman', risk: 'aggressive', consequence: 'High risk of collateral damage' },
      { id: `c${Date.now()}2`, label: 'Use Wayne Tech to freeze their off-shore accounts', identity: 'bruce', risk: 'measured', consequence: 'Causes massive financial disruption' },
      { id: `c${Date.now()}3`, label: 'Interrogate Falcone at his penthouse', identity: 'batman', risk: 'the-line', consequence: 'Pushes you closer to becoming a monster' }
    ]
    newStatDeltas.cityHope = -2
  } else if (turn >= 15 || playerChoice === 'Play Again') {
    if (playerChoice === 'Play Again') {
       mockNarrative = "The simulation has ended. Please refresh the page to restart."
       mockChoices = []
    } else {
      const isHarveyLost = state.harveyStability <= 20
      mockNarrative = isHarveyLost 
        ? `[WARNING: OPENAI API KEY MISSING IN VERCEL]\n[FINALE] The acid burned more than just Harvey's face; it burned his faith in Gotham. He stood atop the GCPD roof, flipping the scarred coin. You tried to reach him, but the man you knew was gone. Two-Face had taken over. Your choices led him here.`
        : `[WARNING: OPENAI API KEY MISSING IN VERCEL]\n[FINALE] It was a brutal night, but you saved Harvey Dent. He stood battered but unbroken on the courtroom steps, ready to prosecute Falcone. Gotham finally has its White Knight. You survived.`
      
      mockSpeakerLines = isHarveyLost
        ? [
            { character: "TWO-FACE", line: "The only morality in a cruel world is chance. Unbiased. Unprejudiced. Fair.", emotion: "flat" },
            { character: "BATMAN", line: "Harvey... put the gun down.", emotion: "desperate" }
          ]
        : [
            { character: "HARVEY DENT", line: "We did it, Bruce. We actually did it. Falcone is going away.", emotion: "determined" },
            { character: "BRUCE WAYNE", line: "You did it, Harvey. The city believes in you.", emotion: "warm" }
          ]
          
      mockChoices = [
        { id: `c${Date.now()}end`, label: 'Play Again', identity: 'bruce', risk: 'measured', consequence: 'Restart the simulation' }
      ]
    }
  } else {
    const locations = ["The Narrows", "Wayne Tower", "Iceberg Lounge", "Arkham Asylum", "Crime Alley", "Gotham Sewers", "Blackgate Penitentiary", "Gotham Docks"]
    const location = locations[Math.floor(Math.random() * locations.length)]
    
    const complications = [
      "A sniper took a shot at you from the rooftops.",
      "GCPD sirens closed in from all sides, blocking your exit.",
      "A riot broke out, fueled by Crane's fear toxin.",
      "You uncovered a ledger tying Mayor Hill to the mob.",
      "Selina Kyle intercepted you, demanding a cut of the intel.",
      "Harvey Dent called, sounding increasingly erratic and unstable.",
      "Falcone's enforcers ambushed you in an alleyway."
    ]
    const complication = complications[Math.floor(Math.random() * complications.length)]
    
    mockNarrative = `[WARNING: OPENAI API KEY MISSING IN VERCEL - USING MOCK BACKEND]\n\nYou decided to: "${playerChoice}".\n\nThe fallout was immediate. You tracked the lead to ${location}. But things didn't go as planned. ${complication} The clock is ticking, and the city is watching your every move.`
    
    const possibleSpeakers = [
      { character: "ALFRED", line: "Master Bruce, your vitals are spiking. You need to pull back before you sustain critical injuries.", emotion: "worried" },
      { character: "GORDON", line: "I can't cover for you much longer. The Commissioner is asking questions about the vigilante.", emotion: "tense" },
      { character: "SELINA", line: "You always take things so seriously. Let me help you... for a price, of course.", emotion: "amused" },
      { character: "HARVEY DENT", line: "Bruce, I need that evidence. If I don't get a conviction tomorrow, they'll bury me!", emotion: "panicked" }
    ]
    const speaker = possibleSpeakers[Math.floor(Math.random() * possibleSpeakers.length)]
    const playerLines = [
      "I handle this my way. Stay out of it.",
      "The city doesn't need your permission.",
      "We're out of time. Move.",
      "If you get in my way, I'll go through you.",
      "It's already done.",
      "I didn't ask for your opinion."
    ]
    const playerLine = playerLines[Math.floor(Math.random() * playerLines.length)]

    mockSpeakerLines = [
      speaker,
      { character: state.activeIdentity === 'batman' ? "BATMAN" : "BRUCE", line: playerLine, emotion: "stoic" }
    ]
    
    newStatDeltas.harveyStability = -Math.floor(Math.random() * 12)
    newStatDeltas.brucePsycheCost = Math.floor(Math.random() * 15)
    newStatDeltas.cityHope = Math.random() > 0.5 ? 5 : -5
    
    const actionVerbs = [
      { verb: "Ambush the thugs from the rafters", identity: "batman", risk: "aggressive" },
      { verb: "Hack the mainframe to expose their operation", identity: "bruce", risk: "measured" },
      { verb: "Bribe the informant for more intel", identity: "bruce", risk: "risky" },
      { verb: "Interrogate the suspect violently until they break", identity: "batman", risk: "the-line" },
      { verb: "Use an EMP to disable their tech", identity: "batman", risk: "measured" },
      { verb: "Call in a favor from Commissioner Gordon", identity: "bruce", risk: "risky" }
    ]
    
    const c1 = actionVerbs[Math.floor(Math.random() * actionVerbs.length)]
    let c2 = actionVerbs[Math.floor(Math.random() * actionVerbs.length)]
    while (c1.verb === c2.verb) c2 = actionVerbs[Math.floor(Math.random() * actionVerbs.length)]
    
    mockChoices = [
      { id: `c${Date.now()}1`, label: c1.verb, identity: c1.identity as 'bruce'|'batman', risk: c1.risk, consequence: 'Outcome unknown' },
      { id: `c${Date.now()}2`, label: c2.verb, identity: c2.identity as 'bruce'|'batman', risk: c2.risk, consequence: 'Could escalate the situation' }
    ]
  }

  return JSON.stringify({
    narrative: mockNarrative,
    speakerLines: mockSpeakerLines,
    newConsequence: { id: Date.now().toString(), decisionMade: playerChoice, impact: `Shifted dynamics`, status: "pending", turnMade: state.turn + 1 },
    caseUpdate: null,
    statDeltas: newStatDeltas,
    harveyStabilityDelta: newStatDeltas.harveyStability,
    harleyStatusUpdate: null,
    gordonArcUpdate: null,
    identitySwitchAvailable: true,
    choices: mockChoices,
    sceneTitle: turn === 1 ? "Rain and Rust" : turn >= 15 ? "The Ending" : `Turn ${turn}: The Fallout`
  })
}

const rateLimitMap = new Map<string, { count: number, resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return true
  }
  
  if (record.count >= 10) return false // max 10 requests per minute
  
  record.count += 1
  return true
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 })
  }

  let state: GameState, playerChoice: string, messageHistory: { role: 'system' | 'user' | 'assistant'; content: string }[], narrativeSummary: string, choiceId: string
  
  try {
    const body = await req.json()
    state = body.state
    playerChoice = body.playerChoice
    messageHistory = body.messageHistory
    narrativeSummary = body.narrativeSummary
    choiceId = body.choiceId
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!openai) {
    const mockResponse = generateMockResponse(state, playerChoice)
    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(mockResponse))
          controller.close()
        }
      }),
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    )
  }

  try {
    // 0. Check Pre-Generated Cache
    if (choiceId) {
      const cached = getCachedNarrative(state.sessionId, choiceId);
      if (cached) {
        // Stream the cached JSON immediately
        const jsonString = JSON.stringify(cached);
        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode(jsonString))
              controller.close()
            }
          }),
          { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        )
      }
    }

    // Backend Narrative Constraints: Sanitize state before giving it to the LLM to prevent hallucinations
    const sanitizedState = JSON.parse(JSON.stringify(state)) as GameState;
    
    // 1. Remove defeated antagonists from active cases so the LLM cannot hallucinate them back
    if (sanitizedState.activeCase?.suspects) {
      sanitizedState.activeCase.suspects = sanitizedState.activeCase.suspects.filter(suspect => {
        if (suspect.name.includes('Falcone') && ['arrested', 'captured', 'dead', 'fled', 'exposed'].includes(sanitizedState.falconeStatus || '')) return false;
        if ((suspect.name.includes('Penguin') || suspect.name.includes('Cobblepot')) && ['arrested', 'captured', 'dead'].includes(sanitizedState.penguinStatus || '')) return false;
        return true;
      });
    }

    // 2. Enforce Finale phase if Harvey falls, ensuring the TS backend catches it even if the LLM forgets
    if (sanitizedState.harveyStability <= 0 && sanitizedState.gamePhase !== 'finale') {
      sanitizedState.gamePhase = 'finale';
    }

    // Background store current choice + history state into RAG (fire and forget)
    addMemory(state.sessionId, `In episode ${state.episode}, as ${state.activeIdentity}, the player decided to: "${playerChoice}".`);

    // Append the narrative summary to the system prompt if it exists
    let finalSystemPrompt = buildSystemPrompt(sanitizedState)
    if (narrativeSummary) {
      finalSystemPrompt += `\n\nNARRATIVE SUMMARY SO FAR:\n${narrativeSummary}`
    }

    // Query RAG for relevant past memories based on the player's choice and current scene
    const query = `Scene: ${state.currentSceneTitle}. Player Choice: ${playerChoice}. Identity: ${state.activeIdentity}`;
    const relevantMemories = await retrieveRelevantMemories(state.sessionId, query);
    if (relevantMemories.length > 0) {
      finalSystemPrompt += `\n\n--- RELEVANT PAST MEMORIES ---\n${relevantMemories.map((m, i) => `[Memory ${i + 1}]: ${m}`).join('\n')}\n------------------------------`
    }

    // Agentic Injection: Harley Quinn
    const harleyLine = await generateHarleyDialogue(sanitizedState, playerChoice);
    if (harleyLine) {
       finalSystemPrompt += `\n\nCRITICAL MULTI-AGENT INJECTION:\nHarley Quinn is present in this scene. Her dedicated agent has generated her dialogue response to the player's choice. You MUST include this exact line of dialogue in your 'speakerLines' output for her: "${harleyLine}"\nEnsure your generated narrative contextualizes her saying this.`
    }

    const currentTurn = sanitizedState.turn;
    const hauntingConsequences = sanitizedState.consequences?.filter(c => c.status === 'pending' && (currentTurn - c.turnMade >= 3)) || [];
    if (hauntingConsequences.length > 0) {
      finalSystemPrompt += `\n\nCRITICAL DIRECTIVE: You MUST force the following consequences to surface and haunt the player in this exact turn. Their status MUST change to 'haunting' or 'resolved' in your response:\n`
      hauntingConsequences.forEach(c => {
        finalSystemPrompt += `- Consequence from Turn ${c.turnMade}: "${c.impact}" (Decision: ${c.decisionMade})\n`
      })
    }

    const stream = await openai.chat.completions.create({
      model: 'gemini-1.5-pro',
      stream: true,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "narrative_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              narrative: { type: "string" },
              speakerLines: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    character: { type: "string" },
                    line: { type: "string" },
                    emotion: { type: ["string", "null"], description: "Optional emotion" }
                  },
                  required: ["character", "line", "emotion"],
                  additionalProperties: false
                }
              },
              newConsequence: {
                type: ["object", "null"],
                properties: {
                  id: { type: "string" },
                  decisionMade: { type: "string" },
                  impact: { type: "string" },
                  status: { type: "string", enum: ["pending", "resolved", "haunting"] },
                  turnMade: { type: "number" }
                },
                required: ["id", "decisionMade", "impact", "status", "turnMade"],
                additionalProperties: false
              },
              caseUpdate: {
                type: ["object", "null"],
                properties: {
                  suspectId: { type: "string" },
                  newEvidence: { type: "string" },
                  newSuspectNote: { type: "string" }
                },
                required: ["suspectId", "newEvidence", "newSuspectNote"],
                additionalProperties: false
              },
              scannableEvidence: {
                type: ["array", "null"],
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" }
                  },
                  required: ["id", "name", "description"],
                  additionalProperties: false
                }
              },
              statDeltas: {
                type: "object",
                properties: {
                  harveyStability: { type: "number" },
                  gordonRelationship: { type: "number" },
                  selinaTrust: { type: "number" },
                  gildaTrust: { type: "number" },
                  cityHope: { type: "number" },
                  brucePsycheCost: { type: "number" }
                },
                required: ["harveyStability", "gordonRelationship", "selinaTrust", "gildaTrust", "cityHope", "brucePsycheCost"],
                additionalProperties: false
              },
              harveyArcUpdate: {
                type: ["object", "null"],
                properties: {
                  newStage: { type: "string" },
                  triggerEvent: { type: "string" }
                },
                required: ["newStage", "triggerEvent"],
                additionalProperties: false
              },
              twoFacePhaseUpdate: {
                type: ["object", "null"],
                properties: { newPhase: { type: "number" } },
                required: ["newPhase"],
                additionalProperties: false
              },
              gildaArcPhaseUpdate: {
                type: ["object", "null"],
                properties: { newPhase: { type: "string", enum: ["unsuspecting", "suspicious", "discovery", "the-choice"] } },
                required: ["newPhase"],
                additionalProperties: false
              },
              gildaKnowsUpdate: {
                type: ["object", "null"],
                properties: { knows: { type: "boolean" } },
                required: ["knows"],
                additionalProperties: false
              },
              gamePhaseUpdate: {
                type: ["object", "null"],
                properties: { newPhase: { type: "string", enum: ["investigation", "escalation", "finale"] } },
                required: ["newPhase"],
                additionalProperties: false
              },
              harleyStatusUpdate: {
                type: ["object", "null"],
                properties: { newStatus: { type: "string" } },
                required: ["newStatus"],
                additionalProperties: false
              },
              harleyAlignmentUpdate: {
                type: ["object", "null"],
                properties: { alignment: { type: "string", enum: ["chaos-ally", "chaos-antagonist"] } },
                required: ["alignment"],
                additionalProperties: false
              },
              gordonArcUpdate: {
                type: ["object", "null"],
                properties: { newArc: { type: "string" } },
                required: ["newArc"],
                additionalProperties: false
              },
              falconeStatusUpdate: {
                type: ["object", "null"],
                properties: { newStatus: { type: "string" } },
                required: ["newStatus"],
                additionalProperties: false
              },
              falconePhaseUpdate: {
                type: ["object", "null"],
                properties: { newPhase: { type: "number" } },
                required: ["newPhase"],
                additionalProperties: false
              },
              falconeBranchUpdate: {
                type: ["object", "null"],
                properties: { newBranch: { type: "string", enum: ["docks", "money"] } },
                required: ["newBranch"],
                additionalProperties: false
              },
              falconeLedgerUpdate: {
                type: ["object", "null"],
                properties: { newStatus: { type: "string", enum: ["with-falcone", "with-catwoman", "with-player", "destroyed"] } },
                required: ["newStatus"],
                additionalProperties: false
              },
              falconeMoleFoundUpdate: {
                type: ["object", "null"],
                properties: { found: { type: "boolean" } },
                required: ["found"],
                additionalProperties: false
              },
              falconeMoleIdentityUpdate: {
                type: ["object", "null"],
                properties: { identity: { type: "string" } },
                required: ["identity"],
                additionalProperties: false
              },
              catwomanChoiceUpdate: {
                type: ["object", "null"],
                properties: { choice: { type: "string", enum: ["team-up", "rejected", "let-go"] } },
                required: ["choice"],
                additionalProperties: false
              },
              selinaAlignmentUpdate: {
                type: ["object", "null"],
                properties: { alignment: { type: "string", enum: ["ally", "neutral", "antagonist", "gone"] } },
                required: ["alignment"],
                additionalProperties: false
              },
              penguinStatusUpdate: {
                type: ["object", "null"],
                properties: { newStatus: { type: "string" } },
                required: ["newStatus"],
                additionalProperties: false
              },
              penguinArcPhaseUpdate: {
                type: ["object", "null"],
                properties: { newPhase: { type: "number" } },
                required: ["newPhase"],
                additionalProperties: false
              },
              gcpdMoleArcPhaseUpdate: {
                type: ["object", "null"],
                properties: { newPhase: { type: "number" } },
                required: ["newPhase"],
                additionalProperties: false
              },
              territoriesUpdate: {
                type: ['object', 'null'],
                properties: {
                  territories: {
                    type: "object",
                    properties: {
                      downtown: { type: "object", properties: { control: { type: "string" }, squadsAssigned: { type: "number" } }, required: ["control", "squadsAssigned"], additionalProperties: false },
                      narrows: { type: "object", properties: { control: { type: "string" }, squadsAssigned: { type: "number" } }, required: ["control", "squadsAssigned"], additionalProperties: false },
                      industrial: { type: "object", properties: { control: { type: "string" }, squadsAssigned: { type: "number" } }, required: ["control", "squadsAssigned"], additionalProperties: false },
                      diamond: { type: "object", properties: { control: { type: "string" }, squadsAssigned: { type: "number" } }, required: ["control", "squadsAssigned"], additionalProperties: false },
                      port: { type: "object", properties: { control: { type: "string" }, squadsAssigned: { type: "number" } }, required: ["control", "squadsAssigned"], additionalProperties: false }
                    },
                    required: ["downtown", "narrows", "industrial", "diamond", "port"],
                    additionalProperties: false
                  },
                  gcpdSquadsAvailable: { type: "number" }
                },
                required: ["territories", "gcpdSquadsAvailable"],
                additionalProperties: false
              },
              episodeUpdate: { type: ['object', 'null'], properties: { episode: { type: 'string' } }, required: ['episode'], additionalProperties: false },
              scene45AppealFlagUpdate: { type: ['object', 'null'], properties: { flag: { type: 'boolean' } }, required: ['flag'], additionalProperties: false },
              outcomeUpdate: { type: ['object', 'null'], properties: { outcome: { type: 'string' } }, required: ['outcome'], additionalProperties: false },
              alfredStatusUpdate: { type: ['object', 'null'], properties: { status: { type: 'string' } }, required: ['status'], additionalProperties: false },
              jokerInfectionSpreadUpdate: { type: ['object', 'null'], properties: { spread: { type: 'integer' } }, required: ['spread'], additionalProperties: false },
              harleyChaosBondUpdate: { type: ['object', 'null'], properties: { bond: { type: 'integer' } }, required: ['bond'], additionalProperties: false },
              chapterUpdate: { type: ['object', 'null'], properties: { chapter: { type: 'integer' } }, required: ['chapter'], additionalProperties: false },
              gothamChaosUpdate: { type: ['object', 'null'], properties: { chaos: { type: 'integer' } }, required: ['chaos'], additionalProperties: false },
              jokerPhaseUpdate: { type: ['object', 'null'], properties: { phase: { type: 'integer' } }, required: ['phase'], additionalProperties: false },
              robinTrustUpdate: { type: ['object', 'null'], properties: { trust: { type: 'integer' } }, required: ['trust'], additionalProperties: false },
              robinPhaseUpdate: { type: ['object', 'null'], properties: { phase: { type: 'integer' } }, required: ['phase'], additionalProperties: false },
              gordonJokerPhaseUpdate: { type: ['object', 'null'], properties: { phase: { type: 'integer' } }, required: ['phase'], additionalProperties: false },
              gildaJokerPhaseUpdate: { type: ['object', 'null'], properties: { phase: { type: 'integer' } }, required: ['phase'], additionalProperties: false },
              hallucinationPhaseUpdate: { type: ['object', 'null'], properties: { phase: { type: 'integer' } }, required: ['phase'], additionalProperties: false },
              identitySwitchAvailable: { type: 'boolean' },
              choices: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    label: { type: "string" },
                    identity: { type: "string", enum: ["bruce", "batman"] },
                    risk: { type: "string" },
                    consequence: { type: "string" },
                    hint: { type: ["string", "null"] }
                  },
                  required: ["id", "label", "identity", "risk", "consequence", "hint"],
                  additionalProperties: false
                }
              },
              sceneTitle: { type: "string" },
              visualEffect: { type: ["string", "null"] },
              sceneImagePrompt: { type: ["string", "null"] },
              ambientAudioPrompt: { type: ["string", "null"] }
            },
            required: [
              "narrative",
              "speakerLines",
              "statDeltas",
              "identitySwitchAvailable",
              "choices",
              "sceneTitle",
              "newConsequence",
              "caseUpdate",
              "harveyArcUpdate",
              "twoFacePhaseUpdate",
              "gildaArcPhaseUpdate",
              "gildaKnowsUpdate",
              "gamePhaseUpdate",
              "harleyStatusUpdate",
              "harleyAlignmentUpdate",
              "gordonArcUpdate",
              "falconeStatusUpdate",
              "falconePhaseUpdate",
              "falconeBranchUpdate",
              "falconeLedgerUpdate",
              "falconeMoleFoundUpdate",
              "falconeMoleIdentityUpdate",
              "catwomanChoiceUpdate",
              "selinaAlignmentUpdate",
              "penguinStatusUpdate",
              "penguinArcPhaseUpdate",
              "gcpdMoleArcPhaseUpdate",
              "territoriesUpdate",
              "episodeUpdate",
              "scene45AppealFlagUpdate",
              "outcomeUpdate",
              "alfredStatusUpdate",
              "jokerInfectionSpreadUpdate",
              "harleyChaosBondUpdate",
              "chapterUpdate",
              "gothamChaosUpdate",
              "jokerPhaseUpdate",
              "robinTrustUpdate",
              "robinPhaseUpdate",
              "gordonJokerPhaseUpdate",
              "gildaJokerPhaseUpdate",
              "hallucinationPhaseUpdate",
              "visualEffect",
              "sceneImagePrompt",
              "ambientAudioPrompt"
            ],
            additionalProperties: false
          }
        }
      },
      messages: [
        { role: 'system', content: finalSystemPrompt },
        ...messageHistory.slice(-14),
        { role: 'user', content: buildUserMessage(sanitizedState, playerChoice) }
      ],
      max_tokens: 4000
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
  } catch (error) {
    const err = error as Error
    console.error('API Error:', err)
    
    // Since the user upgraded their API plan, any remaining 429 or 500 errors should be bubbled up to the UI so they know exactly what failed, rather than silently falling back to the procedural engine.
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
