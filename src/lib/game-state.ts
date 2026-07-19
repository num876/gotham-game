import { GameState } from '@/types/game'

export const EP1_INITIAL_STATE: Omit<GameState, 'sessionId'> = {
  gamePhase: 'investigation',
  episode: 'ep1-two-sides',
  activeIdentity: 'bruce',
  turn: 0,
  date: 'Thursday, 11:47 PM',
  location: 'Wayne Manor — Study',
  chapterTitle: 'Two Sides of the Same Coin',
  allies: [
    { id: 'alfred', name: 'Alfred Pennyworth', role: 'Butler / Confidant', knowsIdentity: true, trustLevel: 100, status: 'trusted', lastInteraction: 'Now', notes: ["Left Thomas Wayne's Falcone correspondence on the desk tonight. Has not explained why."] },
    { id: 'harvey', name: 'Harvey Dent', role: 'DA — Mayor-elect', knowsIdentity: false, trustLevel: 82, status: 'trusted', lastInteraction: 'One hour ago — phone call', notes: ["Wants Bruce's public endorsement tonight. Hollis is dead. Harvey is frightened and hiding it."] },
    { id: 'gilda', name: 'Gilda Dent', role: "Harvey's wife", knowsIdentity: false, trustLevel: 25, status: 'neutral', lastInteraction: 'Dinner last week', notes: ['Watches Bruce carefully. Warm but not soft. Loves Harvey with open eyes.'] },
    { id: 'gordon', name: 'James Gordon', role: 'GCPD Lieutenant', knowsIdentity: false, trustLevel: 30, status: 'neutral', lastInteraction: 'Crime scene — Hollis', notes: ["Told Batman to leave the scene. Batman didn't. Gordon filed it and moved on. He is deciding what that means."] },
    { id: 'selina', name: 'Selina Kyle / Catwoman', role: 'Unknown', knowsIdentity: false, trustLevel: 0, status: 'unknown', lastInteraction: 'None', notes: ['Unknown master thief operating in the Narrows. Complete stranger.'] },
    { id: 'harley', name: 'Dr. Harleen Quinzel', role: "Arkham — Harvey's therapist", knowsIdentity: false, trustLevel: 10, status: 'unknown', lastInteraction: 'Wayne Foundation gala', notes: ["Said one thing at the gala. Bruce has not stopped thinking about it. She knows he hasn't."] },
    { id: 'lucius', name: 'Lucius Fox', role: 'Wayne Enterprises R&D', knowsIdentity: true, trustLevel: 95, status: 'trusted', lastInteraction: 'Yesterday — applied ballistics', notes: ['Never asks what the tech is for. Doesn\'t need to.'] }
  ],
  activeCase: {
    id: 'case-01',
    title: 'The Falcone Connection',
    status: 'open',
    scannableEvidence: [],
    suspects: [
      { id: 's1', name: 'Carmine Falcone', knownAlias: 'The Roman', suspectStatus: 'suspect', connectionTo: ['Hollis', 'Thomas Wayne'], evidence: [], notes: ['Fingerprints at scene — too clean. He wanted them found. Or someone wanted them found.'] }
    ],
    locations: ['Gotham City Hall', 'Falcone Shipping Yard', 'Crime Alley', 'Wayne Foundation Archive'],
    keyEvidence: ['Hollis found dead — staged as suicide', 'Falcone prints on scene, deliberately placed', 'Thomas Wayne correspondence — contents unknown']
  },
  consequences: [],
  bruceReputation: 85,
  batmanFear: 20,
  gordonRelationship: 30,
  cityHope: 60,
  brucePsycheCost: 10,
  inventory: ['Batarang', 'Smoke Pellet', 'EMP Device', 'Grapple Gun'],
  harveyArc: 'idealist',
  harveyTrust: 82,
  harveyStability: 88,
  twoFacePhase: null,
  gildaTrust: 40,
  gildaKnows: false,
  gildaArcPhase: 'unsuspecting',
  selinaTrust: 0,
  selinaAlignment: 'neutral',
  harleyStatus: 'dr-quinzel',
  harleyAlignment: 'neutral',
  gordonArc: 'suspicious',
  falconeStatus: 'untouched',
  falconePhase: 1,
  falconeBranch: null,
  falconeMoleFound: false,
  falconeLedgerStatus: 'with-falcone',
  chapter: 1,
  gothamChaos: 0,
  jokerPhase: 1,
  robinTrust: 0,
  robinPhase: 1,
  gordonJokerPhase: 1,
  gildaJokerPhase: 1,
  hallucinationPhase: 1,
  falconeMoleIdentity: null,
  catwomanChoice: null,
  penguinStatus: 'untouched',
  penguinArcPhase: 1,
  gcpdMoleArcPhase: 1,
  currentSceneTitle: 'A Phone Call at Midnight',
  choices: [
    {
      id: 'ep1-c1',
      label: 'Endorse publicly and immediately',
      identity: 'bruce',
      risk: 'risky',
      consequence: 'Harvey gains significant trust, but Falcone targets the Wayne-Dent alliance. Gordon reads it as pressure.',
      hint: 'Looks political, makes you a target.'
    },
    {
      id: 'ep1-c2',
      label: 'Endorse privately, let Harvey announce',
      identity: 'bruce',
      risk: 'measured',
      consequence: 'Harvey is reassured. Cleaner politically. Gilda appreciates the discretion.',
      hint: 'The safer path.'
    },
    {
      id: 'ep1-c3',
      label: 'Delay — ask for 48 hours to investigate Hollis first',
      identity: 'bruce',
      risk: 'the-line',
      consequence: 'Harvey is hurt, feeling abandoned. Gordon respects it. Gives Batman time to build a cleaner case.',
      hint: 'Sacrifice friendship for tactical advantage.'
    }
  ],
  gameOver: false,
  scene45AppealFlag: false,
  alfredStatus: 'normal',
  jokerInfectionSpread: 0,
  harleyChaosBond: 0,
  gcpdSquadsAvailable: 5,
  territories: {
    'downtown': { control: 'contested', squadsAssigned: 0 },
    'narrows': { control: 'contested', squadsAssigned: 0 },
    'industrial': { control: 'contested', squadsAssigned: 0 },
    'diamond': { control: 'contested', squadsAssigned: 0 },
    'port': { control: 'contested', squadsAssigned: 0 }
  }
}

export function initializeGameState(sessionId: string): GameState {
  return {
    ...EP1_INITIAL_STATE,
    sessionId
  }
}
