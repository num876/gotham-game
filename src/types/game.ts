export type ActiveIdentity = 'bruce' | 'batman'

export type Episode =
  | 'ep1-two-sides'
  | 'ep2-the-weight-of-it'
  | 'ep3-what-we-buried'
  | 'ep4-the-coin'
  | 'ep5-city-of-light'

export type AllyStatus = 'trusted' | 'neutral' | 'strained' | 'broken' | 'unknown'

export type HarveyArcStage =
  | 'idealist'       // Ep1 — DA, mayor-elect, Bruce's best friend
  | 'pressured'      // Ep2 — cracks forming under the weight
  | 'compromised'    // Ep3 — made a deal he cannot undo
  | 'fracturing'     // Ep4 — the scarring, the coin takes hold
  | 'two-face'       // Ep5 — Harvey Dent is gone

export type HarleyStatus =
  | 'dr-quinzel'     // Ep1–2 — professional, perceptive, opaque
  | 'entangled'      // Ep3 — sessions with Harvey changing her
  | 'unravelling'    // Ep4 — protecting him, not treating him
  | 'quinn'          // Ep5 — Harley Quinn, fully herself

export type GordanArc =
  | 'suspicious'     // Ep1 — tolerates Batman, does not trust him
  | 'working'        // Ep2 — reluctant operational partnership
  | 'conflicted'     // Ep3 — knows more than he should, acts on less
  | 'broken-trust'   // Ep4 — Batman did something Gordon cannot forgive
  | 'uneasy-allies'  // Ep4 alt — they came through something together
  | 'commissioner'   // Ep5 — Gordon has the rooftop light. He uses it.

export type SuspectStatus = 'unknown' | 'person-of-interest' | 'suspect' | 'cleared' | 'confirmed'

export interface Ally {
  id: string
  name: string
  role: string
  knowsIdentity: boolean
  trustLevel: number         // 0–100
  status: AllyStatus
  lastInteraction: string
  notes: string[]
}

export interface Suspect {
  id: string
  name: string
  knownAlias?: string
  suspectStatus: SuspectStatus
  connectionTo: string[]
  evidence: string[]
  notes: string[]
}

export interface CaseFile {
  id: string
  title: string
  status: 'open' | 'closed' | 'cold'
  suspects: Suspect[]
  locations: string[]
  keyEvidence: string[]
}

export interface Consequence {
  id: string
  decisionMade: string
  impact: string
  status: 'pending' | 'resolved' | 'haunting'
  turnMade: number
}

export type GamePhase = 'investigation' | 'escalation' | 'finale'

export interface GameState {
  sessionId: string
  gamePhase: GamePhase
  episode: Episode
  activeIdentity: ActiveIdentity
  turn: number
  date: string
  location: string
  chapterTitle: string
  allies: Ally[]
  activeCase: CaseFile | null
  consequences: Consequence[]
  bruceReputation: number
  batmanFear: number
  gordonRelationship: number
  cityHope: number
  brucePsycheCost: number
  harveyArc: HarveyArcStage
  harveyTrust: number         // Harvey's personal trust in Bruce
  harveyStability: number     // 0–100, 0 = Two-Face
  gildaTrust: number          // 0–100 Gilda's trust in Bruce
  gildaKnows: boolean         // whether Gilda has guessed the secret
  selinaTrust: number
  selinaAlignment: 'ally' | 'neutral' | 'antagonist' | 'gone'
  harleyStatus: HarleyStatus
  gordonArc: GordanArc
  falconeStatus: 'untouched' | 'warned' | 'exposed' | 'arrested' | 'dead'
  penguinStatus: 'untouched' | 'warned' | 'exposed' | 'arrested' | 'dead'
  currentSceneTitle: string
  identitySwitchAvailable?: boolean
  choices: Choice[]
  gameOver: boolean
  outcome?: 'harvey-saved' | 'gotham-saved' | 'gotham-survives' | 'wrong-ending' | 'batman-broken' | 'bruce-exposed' | 'city-falls'
}

export interface Choice {
  id: string
  label: string
  identity: ActiveIdentity
  risk: 'measured' | 'aggressive' | 'risky' | 'the-line'
  consequence: string        // short plain-English description of likely outcome
  hint?: string
}
