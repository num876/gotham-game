/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenAI } from '@google/genai'
import { buildSystemPrompt, buildUserMessage } from '@/lib/openai'
import { GameState } from '@/types/game'
import { NextResponse } from 'next/server'
import { addMemory, retrieveRelevantMemories } from '@/lib/vector-store'
import { getCachedNarrative } from '@/lib/cache'
import { generateHarleyDialogue } from '@/lib/agents/harley'

// We will skip Gemini if there's no API key to allow testing the UI
const apiKey = process.env.GEMINI_API_KEY
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

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

  if (!ai) {
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

    // Merge messages into the format Gemini expects for contents
    let contentsText = finalSystemPrompt + `\n\nRespond with valid JSON following the narrative_response schema.\n\n`;
    
    (messageHistory || []).slice(-14).forEach((msg: any) => {
      contentsText += `${msg.role.toUpperCase()}: ${msg.content}\n\n`
    })
    contentsText += `USER: ${buildUserMessage(sanitizedState, playerChoice || "Begin game.")}`

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-1.5-flash',
      contents: contentsText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT" as any,
          properties: {
            narrative: { type: "STRING" as any },
            speakerLines: {
              type: "ARRAY" as any,
              items: {
                type: "OBJECT" as any,
                properties: {
                  character: { type: "STRING" as any },
                  line: { type: "STRING" as any },
                  emotion: { type: "STRING" as any, nullable: true, description: "Optional emotion" }
                },
                required: ["character", "line"]
              }
            },
            newConsequence: {
              type: "OBJECT" as any,
              nullable: true,
              properties: {
                id: { type: "STRING" as any },
                decisionMade: { type: "STRING" as any },
                impact: { type: "STRING" as any },
                status: { type: "STRING" as any, enum: ["pending", "resolved", "haunting"] },
                turnMade: { type: "NUMBER" as any }
              },
              required: ["id", "decisionMade", "impact", "status", "turnMade"]
            },
            caseUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: {
                suspectId: { type: "STRING" as any },
                newEvidence: { type: "STRING" as any },
                newSuspectNote: { type: "STRING" as any }
              },
              required: ["suspectId", "newEvidence", "newSuspectNote"]
            },
            scannableEvidence: {
              type: "ARRAY" as any,
              nullable: true,
              items: {
                type: "OBJECT" as any,
                properties: {
                  id: { type: "STRING" as any },
                  name: { type: "STRING" as any },
                  description: { type: "STRING" as any }
                },
                required: ["id", "name", "description"]
              }
            },
            statDeltas: {
              type: "OBJECT" as any,
              properties: {
                harveyStability: { type: "NUMBER" as any },
                gordonRelationship: { type: "NUMBER" as any },
                selinaTrust: { type: "NUMBER" as any },
                gildaTrust: { type: "NUMBER" as any },
                cityHope: { type: "NUMBER" as any },
                brucePsycheCost: { type: "NUMBER" as any }
              },
              required: ["harveyStability", "gordonRelationship", "selinaTrust", "gildaTrust", "cityHope", "brucePsycheCost"]
            },
            harveyArcUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: {
                newStage: { type: "STRING" as any },
                triggerEvent: { type: "STRING" as any }
              },
              required: ["newStage", "triggerEvent"]
            },
            twoFacePhaseUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newPhase: { type: "NUMBER" as any } },
              required: ["newPhase"]
            },
            gildaArcPhaseUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newPhase: { type: "STRING" as any, enum: ["unsuspecting", "suspicious", "discovery", "the-choice"] } },
              required: ["newPhase"]
            },
            gildaKnowsUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { knows: { type: "BOOLEAN" as any } },
              required: ["knows"]
            },
            gamePhaseUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newPhase: { type: "STRING" as any, enum: ["investigation", "escalation", "finale"] } },
              required: ["newPhase"]
            },
            harleyStatusUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newStatus: { type: "STRING" as any } },
              required: ["newStatus"]
            },
            harleyAlignmentUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { alignment: { type: "STRING" as any, enum: ["chaos-ally", "chaos-antagonist"] } },
              required: ["alignment"]
            },
            gordonArcUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newArc: { type: "STRING" as any } },
              required: ["newArc"]
            },
            falconeStatusUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newStatus: { type: "STRING" as any } },
              required: ["newStatus"]
            },
            falconePhaseUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newPhase: { type: "NUMBER" as any } },
              required: ["newPhase"]
            },
            falconeBranchUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newBranch: { type: "STRING" as any, enum: ["docks", "money"] } },
              required: ["newBranch"]
            },
            falconeLedgerUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newStatus: { type: "STRING" as any, enum: ["with-falcone", "with-catwoman", "with-player", "destroyed"] } },
              required: ["newStatus"]
            },
            falconeMoleFoundUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { found: { type: "BOOLEAN" as any } },
              required: ["found"]
            },
            falconeMoleIdentityUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { identity: { type: "STRING" as any } },
              required: ["identity"]
            },
            catwomanChoiceUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { choice: { type: "STRING" as any, enum: ["team-up", "rejected", "let-go"] } },
              required: ["choice"]
            },
            selinaAlignmentUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { alignment: { type: "STRING" as any, enum: ["ally", "neutral", "antagonist", "gone"] } },
              required: ["alignment"]
            },
            penguinStatusUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newStatus: { type: "STRING" as any } },
              required: ["newStatus"]
            },
            penguinArcPhaseUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newPhase: { type: "NUMBER" as any } },
              required: ["newPhase"]
            },
            gcpdMoleArcPhaseUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: { newPhase: { type: "NUMBER" as any } },
              required: ["newPhase"]
            },
            territoriesUpdate: {
              type: "OBJECT" as any,
              nullable: true,
              properties: {
                territories: {
                  type: "OBJECT" as any,
                  properties: {
                    downtown: { type: "OBJECT" as any, properties: { control: { type: "STRING" as any }, squadsAssigned: { type: "NUMBER" as any } }, required: ["control", "squadsAssigned"] },
                    narrows: { type: "OBJECT" as any, properties: { control: { type: "STRING" as any }, squadsAssigned: { type: "NUMBER" as any } }, required: ["control", "squadsAssigned"] },
                    industrial: { type: "OBJECT" as any, properties: { control: { type: "STRING" as any }, squadsAssigned: { type: "NUMBER" as any } }, required: ["control", "squadsAssigned"] },
                    diamond: { type: "OBJECT" as any, properties: { control: { type: "STRING" as any }, squadsAssigned: { type: "NUMBER" as any } }, required: ["control", "squadsAssigned"] },
                    port: { type: "OBJECT" as any, properties: { control: { type: "STRING" as any }, squadsAssigned: { type: "NUMBER" as any } }, required: ["control", "squadsAssigned"] }
                  },
                  required: ["downtown", "narrows", "industrial", "diamond", "port"]
                },
                gcpdSquadsAvailable: { type: "NUMBER" as any }
              },
              required: ["territories", "gcpdSquadsAvailable"]
            },
            episodeUpdate: { type: "OBJECT" as any, nullable: true, properties: { episode: { type: "STRING" as any } }, required: ['episode'] },
            scene45AppealFlagUpdate: { type: "OBJECT" as any, nullable: true, properties: { flag: { type: "BOOLEAN" as any } }, required: ['flag'] },
            outcomeUpdate: { type: "OBJECT" as any, nullable: true, properties: { outcome: { type: "STRING" as any } }, required: ['outcome'] },
            alfredStatusUpdate: { type: "OBJECT" as any, nullable: true, properties: { status: { type: "STRING" as any } }, required: ['status'] },
            jokerInfectionSpreadUpdate: { type: "OBJECT" as any, nullable: true, properties: { spread: { type: "NUMBER" as any } }, required: ['spread'] },
            harleyChaosBondUpdate: { type: "OBJECT" as any, nullable: true, properties: { bond: { type: "NUMBER" as any } }, required: ['bond'] },
            chapterUpdate: { type: "OBJECT" as any, nullable: true, properties: { chapter: { type: "NUMBER" as any } }, required: ['chapter'] },
            gothamChaosUpdate: { type: "OBJECT" as any, nullable: true, properties: { chaos: { type: "NUMBER" as any } }, required: ['chaos'] },
            jokerPhaseUpdate: { type: "OBJECT" as any, nullable: true, properties: { phase: { type: "NUMBER" as any } }, required: ['phase'] },
            robinTrustUpdate: { type: "OBJECT" as any, nullable: true, properties: { trust: { type: "NUMBER" as any } }, required: ['trust'] },
            robinPhaseUpdate: { type: "OBJECT" as any, nullable: true, properties: { phase: { type: "NUMBER" as any } }, required: ['phase'] },
            gordonJokerPhaseUpdate: { type: "OBJECT" as any, nullable: true, properties: { phase: { type: "NUMBER" as any } }, required: ['phase'] },
            gildaJokerPhaseUpdate: { type: "OBJECT" as any, nullable: true, properties: { phase: { type: "NUMBER" as any } }, required: ['phase'] },
            hallucinationPhaseUpdate: { type: "OBJECT" as any, nullable: true, properties: { phase: { type: "NUMBER" as any } }, required: ['phase'] },
            identitySwitchAvailable: { type: "BOOLEAN" as any },
            choices: {
              type: "ARRAY" as any,
              items: {
                type: "OBJECT" as any,
                properties: {
                  id: { type: "STRING" as any },
                  label: { type: "STRING" as any },
                  identity: { type: "STRING" as any, enum: ["bruce", "batman"] },
                  risk: { type: "STRING" as any },
                  consequence: { type: "STRING" as any },
                  hint: { type: "STRING" as any, nullable: true }
                },
                required: ["id", "label", "identity", "risk", "consequence"]
              }
            },
            sceneTitle: { type: "STRING" as any },
            visualEffect: { type: "STRING" as any, nullable: true },
            sceneImagePrompt: { type: "STRING" as any, nullable: true },
            ambientAudioPrompt: { type: "STRING" as any, nullable: true }
          },
          required: [
            "narrative",
            "speakerLines",
            "statDeltas",
            "identitySwitchAvailable",
            "choices",
            "sceneTitle"
          ]
        }
      }
    })

    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of responseStream) {
            const text = chunk.text
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
