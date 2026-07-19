export type ActiveIdentity = 'bruce' | 'batman'

export type Episode =
  | 'ep1-two-sides'
  | 'ep2-the-weight-of-it'
  | 'ep3-what-we-buried'
  | 'ep4-the-coin'
  | 'ep5-city-of-light'
  | 'ep6-sable-point'
  | 'ep7-what-the-water-remembers'
  | 'ep8-the-thing-in-the-walls'
  | 'ep9-sable-point-burns'

export type AllyStatus = 'trusted' | 'neutral' | 'strained' | 'broken' | 'unknown'

export type HarveyArcStage =
  | 'idealist'       // Ep1 — DA, mayor-elect, Bruce's best friend
  | 'pressured'      // Ep2 — cracks forming under the weight
  | 'compromised'    // Ep3 — made a deal he cannot undo
  | 'fracturing'     // Ep4 — the scarring, the coin takes hold
  | 'two-face'       // Ep5 — Harvey Dent is gone

export type TwoFacePhase = 1 | 2 | 3 | null

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

export type FalconePhase = 1 | 2 | 3 | 4
export type FalconeBranch = 'docks' | 'money' | null
export type FalconeLedgerStatus = 'with-falcone' | 'with-catwoman' | 'with-player' | 'destroyed'
export type CatwomanChoice = 'team-up' | 'rejected' | 'let-go' | null

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

export interface ScannableEvidence {
  id: string
  name: string
  description: string
  isLinked: boolean
}

export interface CaseFile {
  id: string
  title: string
  status: 'open' | 'closed' | 'cold'
  suspects: Suspect[]
  locations: string[]
  keyEvidence: string[]
  scannableEvidence: ScannableEvidence[]
}

export interface Consequence {
  id: string
  decisionMade: string
  impact: string
  status: 'pending' | 'resolved' | 'haunting'
  turnMade: number
}

export type GamePhase = 'investigation' | 'escalation' | 'finale' | 'epilogue' | 'no-mans-land'

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
  inventory: string[]
  activeGadget?: string
  harveyArc: HarveyArcStage
  harveyTrust: number         // Harvey's personal trust in Bruce
  harveyStability: number     // 0–100, 0 = Two-Face
  twoFacePhase: TwoFacePhase  // Tracks progression when stability hits 0
  gildaTrust: number          // 0–100 Gilda's trust in Bruce
  gildaKnows: boolean         // whether Gilda has guessed the secret
  gildaArcPhase: 'unsuspecting' | 'suspicious' | 'discovery' | 'the-choice'
  selinaTrust: number
  selinaAlignment: 'ally' | 'neutral' | 'antagonist' | 'gone'
  harleyStatus: HarleyStatus
  harleyAlignment: 'neutral' | 'chaos-ally' | 'chaos-antagonist'
  gordonArc: GordanArc
  falconeStatus: 'untouched' | 'warned' | 'exposed' | 'arrested' | 'dead' | 'fled'
  falconePhase: FalconePhase
  falconeBranch: FalconeBranch
  falconeMoleFound: boolean
  falconeLedgerStatus: FalconeLedgerStatus
  chapter: 1 | 2
  gothamChaos: number         // 0-100, rising chaos in Chapter 2
  jokerPhase: 1 | 2 | 3 | 4 | 5
  robinTrust: number          // 0-100
  robinPhase: number
  gordonJokerPhase: number
  gildaJokerPhase: number
  hallucinationPhase: number       // 0-100
  falconeMoleIdentity: string | null
  catwomanChoice: CatwomanChoice
  penguinStatus: 'untouched' | 'warned' | 'exposed' | 'arrested' | 'dead'
  penguinArcPhase: number
  territories?: Record<string, { control: 'gcpd' | 'joker' | 'two-face' | 'contested', squadsAssigned: number }>
  gcpdSquadsAvailable?: number
  gcpdMoleArcPhase: number
  currentSceneTitle: string
  identitySwitchAvailable?: boolean
  choices: Choice[]
  gameOver: boolean
  scene45AppealFlag?: boolean
  alfredStatus: 'normal' | 'haunted-ep1' | 'haunted-ep3' | 'confessed'
  outcome?: 'harvey-saved' | 'gotham-saved' | 'gotham-survives' | 'wrong-ending' | 'batman-broken' | 'bruce-exposed' | 'city-falls' | 'contained-not-cured' | 'cost-of-containment' | 'garden-grows-anyway' | 'what-she-became-for-him'
  jokerInfectionSpread?: number
  harleyChaosBond?: number
}
export interface Choice {
  id: string
  label: string
  identity: ActiveIdentity
  risk: 'measured' | 'aggressive' | 'risky' | 'the-line'
  consequence: string        // short plain-English description of likely outcome
  hint?: string
}
