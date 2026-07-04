import OpenAI from 'openai'
import { buildSystemPrompt, buildUserMessage } from '@/lib/openai'
import { GameState } from '@/types/game'
import { NextResponse } from 'next/server'

// We will skip OpenAI if there's no API key to allow testing the UI
const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey }) : null

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
        ? `[FINALE] The acid burned more than just Harvey's face; it burned his faith in Gotham. He stood atop the GCPD roof, flipping the scarred coin. You tried to reach him, but the man you knew was gone. Two-Face had taken over. Your choices led him here.`
        : `[FINALE] It was a brutal night, but you saved Harvey Dent. He stood battered but unbroken on the courtroom steps, ready to prosecute Falcone. Gotham finally has its White Knight. You survived.`
      
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
    
    mockNarrative = `You decided to: "${playerChoice}".\n\nThe fallout was immediate. You tracked the lead to ${location}. But things didn't go as planned. ${complication} The clock is ticking, and the city is watching your every move.`
    
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

  let state: GameState, playerChoice: string, messageHistory: { role: 'system' | 'user' | 'assistant'; content: string }[], narrativeSummary: string
  
  try {
    const body = await req.json()
    state = body.state
    playerChoice = body.playerChoice
    messageHistory = body.messageHistory
    narrativeSummary = body.narrativeSummary
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
    // Append the narrative summary to the system prompt if it exists
    let finalSystemPrompt = buildSystemPrompt(state)
    if (narrativeSummary) {
      finalSystemPrompt += `\n\nNARRATIVE SUMMARY SO FAR:\n${narrativeSummary}`
    }

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
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
                    emotion: { type: "string", description: "Optional emotion", nullable: true }
                  },
                  required: ["character", "line"],
                  additionalProperties: false
                }
              },
              newConsequence: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  decisionMade: { type: "string" },
                  impact: { type: "string" },
                  status: { type: "string", enum: ["pending", "resolved", "haunting"] },
                  turnMade: { type: "number" }
                },
                required: ["id", "decisionMade", "impact", "status", "turnMade"],
                additionalProperties: false,
                nullable: true
              },
              caseUpdate: {
                type: "object",
                properties: {
                  suspectId: { type: "string" },
                  newEvidence: { type: "string" },
                  newSuspectNote: { type: "string" }
                },
                required: ["suspectId", "newEvidence", "newSuspectNote"],
                additionalProperties: false,
                nullable: true
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
                type: "object",
                properties: { newStage: { type: "string" } },
                required: ["newStage"],
                additionalProperties: false,
                nullable: true
              },
              harleyStatusUpdate: {
                type: "object",
                properties: { newStatus: { type: "string" } },
                required: ["newStatus"],
                additionalProperties: false,
                nullable: true
              },
              gordonArcUpdate: {
                type: "object",
                properties: { newArc: { type: "string" } },
                required: ["newArc"],
                additionalProperties: false,
                nullable: true
              },
              falconeStatusUpdate: {
                type: "object",
                properties: { newStatus: { type: "string" } },
                required: ["newStatus"],
                additionalProperties: false,
                nullable: true
              },
              penguinStatusUpdate: {
                type: "object",
                properties: { newStatus: { type: "string" } },
                required: ["newStatus"],
                additionalProperties: false,
                nullable: true
              },
              identitySwitchAvailable: { type: "boolean" },
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
                    hint: { type: "string", nullable: true }
                  },
                  required: ["id", "label", "identity", "risk", "consequence"],
                  additionalProperties: false
                }
              },
              sceneTitle: { type: "string" },
              visualEffect: { type: "string", nullable: true },
              sceneImagePrompt: { type: "string", nullable: true },
              ambientAudioPrompt: { type: "string", nullable: true }
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
              "harleyStatusUpdate",
              "gordonArcUpdate",
              "falconeStatusUpdate",
              "penguinStatusUpdate",
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
        { role: 'user', content: buildUserMessage(state, playerChoice) }
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
