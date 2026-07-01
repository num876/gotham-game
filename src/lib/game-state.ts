import { GameState } from '@/types/game'

export const EP1_INITIAL_STATE: Omit<GameState, 'sessionId'> = {
  episode: 'ep1-two-sides',
  activeIdentity: 'bruce',
  turn: 0,
  date: 'Thursday, 11:47 PM',
  location: 'Wayne Manor — Study',
  chapterTitle: 'Two Sides of the Same Coin',
  allies: [
    { id: 'alfred', name: 'Alfred Pennyworth', role: 'Butler / Confidant', knowsIdentity: true, trustLevel: 100, status: 'trusted', lastInteraction: 'Now', notes: ['Left Thomas Wayne\\'s Falcone correspondence on the desk tonight. Has not explained why.'] },
    { id: 'harvey', name: 'Harvey Dent', role: 'DA — Mayor-elect', knowsIdentity: false, trustLevel: 82, status: 'trusted', lastInteraction: 'One hour ago — phone call', notes: ['Wants Bruce\\'s public endorsement tonight. Hollis is dead. Harvey is frightened and hiding it.'] },
    { id: 'gilda', name: 'Gilda Dent', role: 'Harvey\\'s wife', knowsIdentity: false, trustLevel: 25, status: 'neutral', lastInteraction: 'Dinner last week', notes: ['Watches Bruce carefully. Warm but not soft. Loves Harvey with open eyes.'] },
    { id: 'gordon', name: 'James Gordon', role: 'GCPD Lieutenant', knowsIdentity: false, trustLevel: 30, status: 'neutral', lastInteraction: 'Crime scene — Hollis', notes: ['Told Batman to leave the scene. Batman didn\\'t. Gordon filed it and moved on. He is deciding what that means.'] },
    { id: 'selina', name: 'Selina Kyle', role: 'Unknown', knowsIdentity: false, trustLevel: 0, status: 'unknown', lastInteraction: 'Rooftop — Hollis scene', notes: ['Was there first. Knows something. Has not decided what to do with it.'] },
    { id: 'harley', name: 'Dr. Harleen Quinzel', role: 'Arkham — Harvey\\'s therapist', knowsIdentity: false, trustLevel: 10, status: 'unknown', lastInteraction: 'Wayne Foundation gala', notes: ['Said one thing at the gala. Bruce has not stopped thinking about it. She knows he hasn\\'t.'] }
  ],
  activeCase: {
    id: 'case-01',
    title: 'The Falcone Connection',
    status: 'open',
    suspects: [
      { id: 's1', name: 'Carmine Falcone', knownAlias: 'The Roman', suspectStatus: 'suspect', connectionTo: ['Hollis', 'Thomas Wayne'], evidence: [], notes: ['Fingerprints at scene — too clean. He wanted them found. Or someone wanted them found.'] }
    ],
    locations: ['Gotham City Hall', 'Falcone Shipping Yard', 'Crime Alley', 'Wayne Foundation Archive'],
    keyEvidence: ['Hollis found dead — staged as suicide', 'Falcone prints on scene, deliberately placed', 'Thomas Wayne correspondence — contents unknown']
  },
  consequences: [],
  bruceReputation: 72,
  batmanFear: 58,
  gordonRelationship: 30,
  cityHope: 35,
  brucePsycheCost: 20,
  harveyArc: 'idealist',
  harveyTrust: 82,
  harveyStability: 88,
  gildaTrust: 25,
  gildaKnows: false,
  selinaTrust: 0,
  selinaAlignment: 'neutral',
  harleyStatus: 'dr-quinzel',
  gordonArc: 'suspicious',
  falconeStatus: 'untouched',
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
  gameOver: false
}

export function initializeGameState(sessionId: string): GameState {
  return {
    ...EP1_INITIAL_STATE,
    sessionId
  }
}
