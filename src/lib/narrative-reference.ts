import { Episode } from '@/types/game'

const EPISODE_1_REFERENCE = `
# EPISODE 1 — TWO SIDES OF THE SAME COIN

**Opening state:** Harvey is mayor-elect, Bruce's oldest friend. Gilda is his wife. Gordon is a suspicious lieutenant. Selina is unknown. Harley is Harvey's newly assigned therapist. Falcone is untouched, watching. harveyStability: 88.

## Scene 1.1 — The Phone Call (No choice — establishing scene)
11:47 PM. Harvey calls Bruce. Councilman Hollis is dead. Falcone's name is already circling. Harvey needs Bruce's public endorsement before the press runs with it.

## Scene 1.2 — The Endorsement (Decision Node)
**Choices:**
- **ENDORSE PUBLICLY, IMMEDIATELY.** \`bruceReputation -8\` (looks political and rushed), \`harveyTrust +15\`, \`gordonRelationship -5\` (Gordon reads it as pressure on an active case). Falcone immediately marks the Wayne-Dent alliance as a target.
- **ENDORSE PRIVATELY, let Harvey announce it himself.** \`harveyTrust +8\`, cleaner politically, \`gildaTrust +5\` (she notices and appreciates the discretion — the first data point in a relationship that matters enormously later).
- **DELAY 48 HOURS to investigate Hollis first.** \`harveyTrust -12\` (Harvey is hurt, feels unsupported at the worst moment), \`gordonRelationship +6\` (Gordon respects the caution), and Batman gets a cleaner evidentiary foundation for the case — this becomes relevant to how quickly Falcone can be pressured in Episode 2.

## Scene 1.3 — The Hollis Crime Scene (Decision Node)
Batman investigates the apartment. Out of the shadows, a complete stranger in a leather catsuit—a master thief calling herself Catwoman—organically drops in from the skylight. This is their very first meeting. She was here looking for a separate payday, but she saw something regarding the murder and hasn't decided what to do with it.

**Choices:**
- **AGGRESSIVELY CONFRONT THE STRANGER.** \`selinaTrust -10\` (she resents the immediate hostility from a man she just met). She gives partial information, withholding the rest out of spite.
- **OFFER A TRUCE — information for safe passage.** \`selinaTrust +12\`. She is intrigued by his pragmatism and the intense chemistry between them sparks immediately. She shares a genuinely useful detail: a second figure was at the scene before Falcone's people arrived.
- **OBSERVE HER FROM THE SHADOWS, letting her work the scene before revealing yourself.** \`selinaTrust +3\` (she realizes he let her operate, establishing a baseline of dangerous curiosity).

## Scene 1.4 — Alfred's Desk (No choice — establishing scene)
Bruce comes home. Alfred has left Thomas Wayne's decades-old correspondence with Falcone on the desk, unexplained. This is a HAUNTING consequence planted for Episode 5 — Alfred already knows something devastating and is deciding whether the promise to Thomas still holds.

## Scene 1.5 — Gordon at the Scene (Decision Node)
Gordon finds Batman at Hollis's crime scene and tells him to leave.

**Choices:**
- **LEAVE WITHOUT ARGUMENT.** \`gordonRelationship +5\` (a small gesture of respect for jurisdiction), no information exchanged directly, though Batman has already seen what he needed.
- **STAY AND OFFER A DEAL — Batman's forensic read of the scene in exchange for being allowed to work it.** \`gordonRelationship +10\` if Gordon accepts (he does, reluctantly), \`gordonArc\` begins shifting from \`suspicious\` toward \`working\` ahead of schedule.
- **IGNORE GORDON ENTIRELY AND KEEP WORKING.** \`gordonRelationship -8\`. Gordon has Batman removed by force (unsuccessfully, but the attempt is noted). \`gordonArc\` stays firmly at \`suspicious\` and takes longer to shift in Episode 2.

## Scene 1.6 — The Dinner With Gilda (Decision Node)
Harvey brings Gilda to a dinner. She watches Bruce with quiet, total attention. When Harvey is pulled away, she says: "He talks about you like you're the best thing that ever happened to him. That's a lot to be."

**Choices:**
- **DEFLECT WITH HUMOR.** \`gildaTrust +5\` (safe, pleasant, unremarkable — doesn't build much but doesn't damage anything).
- **ANSWER HONESTLY about the weight of that kind of trust.** \`gildaTrust +15\`. Gilda recognizes something genuine in the answer — the first real thread of the relationship that becomes crucial in Episodes 3–5.
- **DEFLECT BACK ONTO HARVEY'S GOODNESS, avoiding the question entirely.** \`gildaTrust -5\` (she notices the evasion, files it away — she is more perceptive than most characters in the game and this small dishonesty registers).

**Episode 1 closing state carried forward:**
- \`harveyTrust\`: 70–97 depending on 1.2
- \`gordonArc\`: suspicious, or shifting early toward working
- \`selinaTrust\`: 0–15 depending on 1.3
- \`gildaTrust\`: 15–40 depending on 1.6
- \`falconeStatus\`: untouched
- Alfred's HAUNTING consequence: planted, unresolved

**CRITICAL INSTRUCTION FOR LLM**: When the closing state of the current episode is reached and the narrative naturally transitions to the opening state of the next episode, you MUST return \`episodeUpdate\` set to the next episode ID (e.g. 'ep2-the-weight-of-it').
`

const EPISODE_2_REFERENCE = `
# EPISODE 2 — THE WEIGHT OF IT

**Opening state:** Harvey has won the election. Batman discovers the win was secured by Falcone money Harvey doesn't know about.

## Scene 2.1 — Victory Night (No choice — establishing scene)
The happiest Bruce has seen Harvey in years. Gilda is radiant. This scene exists to raise the stakes emotionally before the fall begins.

## Scene 2.2 — The Discovery (No choice — establishing scene)
Batman traces the campaign's PAC funding to a Falcone shell entity. Harvey doesn't know. Falcone wanted a mayor he owns and is willing to be patient about collecting.

## Scene 2.3 — What To Do With It (Decision Node — CENTRAL CHOICE OF EPISODE 2)
**Choices:**
- **TELL HARVEY AS BRUCE.** The honest, most dangerous path. Harvey is devastated. \`harveyStability -18\`, \`harveyTrust -5\` (he needed, on some level, not to know yet — but he doesn't blame Bruce for telling him; he blames himself for not seeing it). This is the path that keeps Harvey most psychologically prepared for what's coming, even though it hurts him now.
- **TELL HARVEY AS BATMAN.** Strategic, cold, evidentiary. Harvey experiences this as an attack from outside the law rather than help from a friend. \`harveyStability -28\`. The Harvey/Batman relationship never fully recovers — this is a permanent ceiling on how much Harvey will ever trust Batman specifically, separate from his trust in Bruce.
- **SAY NOTHING, build a cleaner case first.** Falcone remains unaware Batman knows. Time passes — Falcone uses the next several months to tighten the debt on Harvey without Harvey's awareness. By Episode 3, Harvey is more deeply compromised than in either other path. \`harveyStability\` doesn't drop now, but drops faster and further in Episode 3 as a delayed consequence.
- **CONFRONT FALCONE DIRECTLY AS BATMAN, skip Harvey entirely for now.** Falcone delivers his standard non-threat: Bruce's father understood how Gotham works, he expects Bruce will too. \`falconeStatus\` → \`warned\`. \`harveyStability -10\` (collateral — the confrontation becomes semi-public and Harvey feels the tremor without understanding its source).

## Scene 2.4 — Selina's Photograph (Decision Node)
Selina returns with a photograph from the Hollis scene — a second figure, unidentified. She'll give it to Bruce Wayne or to Batman. The distinction matters to her.

**Choices:**
- **RECEIVE IT AS BRUCE WAYNE, treating her as an equal in a transaction, not an informant.** \`selinaTrust +18\`. This is the single biggest early-game trust gain available with Selina — she notices being treated as a person with something to offer rather than an asset to extract from.
- **RECEIVE IT AS BATMAN, purely transactional.** \`selinaTrust +5\`. The information is exchanged cleanly but nothing deepens.
- **TRY TO GET IT WITHOUT GIVING HER ANYTHING IN RETURN.** \`selinaTrust -15\`. She doesn't give it up at all, and this photograph becomes a piece of missing evidence that complicates the case going forward — Batman has to work harder without it in Episode 3.

## Scene 2.5 — Gordon's Compromise (Decision Node)
Batman presents Gordon with evidence linking a Falcone lieutenant to the Hollis murder. One link in the chain required an illegal entry. Gordon knows. He asks directly: "How did you get in?"

**Choices:**
- **TELL HIM THE TRUTH.** \`gordonRelationship -10\` initially (he doesn't like it), but \`gordonArc\` shifts meaningfully toward \`working\` because the honesty, even about something uncomfortable, builds a foundation Gordon can actually work with.
- **DEFLECT, don't answer directly.** \`gordonRelationship -5\`. Gordon uses the evidence anyway, but the unresolved question sits between them — a HAUNTING consequence that resurfaces in Episode 3's compromised moment.
- **OFFER TO WALK AWAY FROM THE CASE rather than compromise Gordon further.** \`gordonRelationship +15\`. Gordon, surprising himself, tells Batman to stay — the case matters more than the process, this once. \`gordonArc\` shifts strongly toward \`working\`.

## Scene 2.6 — Meeting Dr. Quinzel (No choice — establishing scene)
Bruce meets Harleen Quinzel briefly at a Wayne Foundation event. She says: "Your friend is carrying something he hasn't named yet. He will. I'm interested to see what he calls it." \`harleyStatus\` remains \`dr-quinzel\`, but this line should be referenced by GPT-4o as foreshadowing throughout Episode 3.

**Episode 2 closing state carried forward:**
- \`harveyStability\`: ranges roughly 60–82 depending on 2.3
- \`falconeStatus\`: untouched or warned
- \`selinaTrust\`: significantly shaped by 2.4
- \`gordonArc\`: meaningfully progressed or stalled depending on 2.5
- Missing evidence flag: set if 2.4's worst option was chosen

**CRITICAL INSTRUCTION FOR LLM**: When the closing state of the current episode is reached and the narrative naturally transitions to the opening state of the next episode, you MUST return \`episodeUpdate\` set to the next episode ID (e.g. 'ep3-what-we-buried').
`

const EPISODE_3_REFERENCE = `
# EPISODE 3 — WHAT WE BURIED

**Opening state:** Falcone escalating. A witness killed. A GCPD officer found on Falcone's payroll.

## Scene 3.1 — Gordon's Arrest (No choice — establishing scene)
Gordon arrests the compromised officer himself, publicly, at his own precinct. It costs him internally — the department fractures slightly around him.

## Scene 3.2 — Gilda's Call (Decision Node — CENTRAL CHOICE OF EPISODE 3)
Batman discovers Gilda made a call to a Falcone intermediary, trying to negotiate Harvey's safety without his knowledge. Falcone made no promises but now holds a record of the call.

**Choices:**
- **TELL BRUCE, TELL HARVEY.** Harvey learns what Gilda did. He loves her and cannot immediately reconcile it with what he knows about Falcone. He withdraws from her, however briefly. \`gildaTrust -30\`, \`harveyStability -22\`. But this path, painful as it is, means Gilda becomes fiercely, openly committed to helping Bruce in later episodes — the secret is gone, so there's nothing left for her to protect by staying quiet.
- **CONFRONT GILDA DIRECTLY AS BATMAN.** The worst available option and, notably, the most tempting for a player thinking tactically rather than relationally. She is terrified, then furious. She threatens to tell Gordon that Batman surveilled her — she doesn't know Bruce's identity, but she knows this crossed a line. \`gildaTrust → 0\`. She blocks all further access to Harvey for the remainder of the game unless an extraordinary later repair is made (not modeled in this version — treat this as effectively permanent).
- **USE THE INFORMATION AGAINST FALCONE DIRECTLY, protecting Gilda's part in it.** Batman goes to Falcone with the recording, making clear its use would have consequences. Falcone backs off, temporarily. \`gildaTrust\` unchanged (she never learns Batman knows), \`falconeStatus\` begins building toward \`exposed\`, but Falcone is now actively, quietly hostile rather than merely watching.
- **DO NOTHING — trust Gilda to handle it herself.** She realizes eventually that Batman knows, and comes to Bruce — not Batman — to explain herself directly, unprompted. This is the path to \`gildaTrust\` exceeding 70, unlocking her full Episode 4 and 5 arcs. The rarest and best-received path, but requires the player to sit with unresolved tension for a full episode without acting on it.

## Scene 3.3 — The Docks Confrontation (Decision Node)
A confrontation with Falcone's operation at the shipping yard. The situation deteriorates. Catwoman appears from above, unasked, and helps.

**Choices:**
- **ACKNOWLEDGE HER HELP DIRECTLY.** \`selinaTrust +15\`. She's visibly uncomfortable being thanked but the gesture registers.
- **PRETEND IT DIDN'T HAPPEN, focus entirely on the case.** \`selinaTrust +5\` (she actually appreciates not being made to feel indebted or examined, in her own way, though it caps how close the relationship gets this episode).
- **QUESTION WHY SHE HELPED, push for her motive.** \`selinaTrust -8\`. She deflects, gives a flippant answer, and the moment closes rather than opens.

## Scene 3.4 — Alfred's Confession (No choice — establishing scene)
Alfred tells Bruce he has always known who Thomas Wayne met with in the final year of his life. He didn't say because Thomas asked him not to. Thomas is dead. Alfred is still deciding whether the promise holds. This deepens the Episode 1 HAUNTING consequence — GPT-4o should treat this as escalating dread rather than resolution. (Set alfredStatus to 'haunted-ep3').

## Scene 3.5 — Harvey's Deal (No choice — establishing scene, shaped by 2.3 and 3.2)
By episode's end, Harvey — compromised, frightened, trying to protect what's left — makes a deal with someone he shouldn't trust in order to protect Gilda, his position, or both, depending on prior state. He tells Bruce it's under control. \`harveyArc\` shifts to \`compromised\`.

**Episode 3 closing state carried forward:**
- \`gildaTrust\`: the single most divergent stat in the game at this point — ranges from 0 to 70+
- \`selinaTrust\`: shaped meaningfully by 3.3
- \`harveyStability\`: continuing its decline, now solidly in \`compromised\` territory
- \`falconeStatus\`: exposed-building or still warned depending on 3.2
- Alfred's HAUNTING consequence: escalated, still unresolved, now carrying real dread

**CRITICAL INSTRUCTION FOR LLM**: When the closing state of the current episode is reached and the narrative naturally transitions to the opening state of the next episode, you MUST return \`episodeUpdate\` set to the next episode ID (e.g. 'ep4-the-coin').
`

const EPISODE_4_REFERENCE = `
# EPISODE 4 — THE COIN

**Opening state:** The scarring event approaches. Its exact shape depends on accumulated state from Episodes 2 and 3.

## Scene 4.1 — The Scarring Event (No choice — establishing scene, three variants)
- **If Falcone was warned but not stopped (2.3 confrontation path):** Falcone arranges an acid attack at the courthouse during Harvey's first major prosecution as mayor. Calculated, deniable.
- **If Falcone was exposed (3.2's "use against Falcone" path escalated):** A Falcone loyalist acts without orders — messier, more desperate, harder to trace, and this version carries slightly less clean narrative "blame" for Falcone specifically, complicating the Episode 5 confrontation with him.
- **If Batman crossed lines earlier (multiple aggressive Batman-identity choices across Episodes 2–3):** The GCPD pursues Batman to a rooftop confrontation. Harvey, trying to help, trying to reach Bruce, is caught in the resulting chaos.

In every version: Harvey Dent is scarred. The coin appears. \`harveyArc\` → \`fracturing\`. \`harveyStability\` drops sharply regardless of exact path — target this to roughly 35–45 depending on prior trajectory.

## Scene 4.2 — Gilda's Three Days (Decision Node — shaped by gildaTrust)
Gilda was not in the courtroom during the attack. She only witnesses the horrific, gruesome aftermath when they bring his mutilated body into the hospital. The sheer shock of seeing half of her husband's face melted down to the bone traumatizes her deeply. She locks the hospital room door, keeping everyone out for three days while she and Harvey are alone with the horror of it.

**If gildaTrust > 70:** She calls Bruce on day two, unprompted. **Decision:**
- **GO TO HER IMMEDIATELY AS BRUCE.** \`gildaTrust +10\`, and this becomes crucial setup for Episode 5's most powerful Gilda scene.
- **SEND ALFRED INSTEAD, staying back out of respect for the privacy she asked for.** \`gildaTrust +5\` (a different, quieter kind of respect — she notices Bruce trusted Alfred with this, which says something too).
- **STAY AWAY ENTIRELY, respecting the boundary completely.** \`gildaTrust\` unchanged, though Bruce loses a direct emotional beat with Harvey during this crucial window.

**If gildaTrust ≤ 70:** She does not call. Bruce finds out what happened to Harvey from Alfred, who found out from Gordon. No decision node here — this path simply costs the player a scene, a natural consequence of not having built the relationship earlier.

## Scene 4.3 — Gordon's Ultimatum (Decision Node)
Gordon wants Batman off the streets, publicly, immediately, following the scarring event and its associated chaos.

**Choices:**
- **GO TO GORDON AND TRY TO HOLD THE RELATIONSHIP TOGETHER, explaining the full context.** If \`gordonArc\` was already trending toward \`working\`: succeeds, \`gordonArc\` → \`uneasy-allies\`, \`gordonRelationship +15\`. If \`gordonArc\` was still largely \`suspicious\`: Gordon doesn't believe him, \`gordonArc\` → \`broken-trust\`, \`gordonRelationship -20\`.
- **LET IT BREAK, work alone from here.** \`gordonArc\` → \`broken-trust\` regardless of prior state. \`batmanFear +10\` (operating without any institutional check makes Batman more feared, less trusted), \`cityHope -10\`.
- **OFFER GORDON SOMETHING CONCRETE — evidence, an arrest, a genuine gesture of good faith — rather than just words.** The highest-difficulty option, but if \`gordonRelationship\` was already above 50 entering this scene, it succeeds decisively: \`gordonArc\` → \`uneasy-allies\`, \`gordonRelationship +25\`, setting up the strongest possible Episode 5 Gordon relationship.

## Scene 4.4 — Harley's Disappearance (No choice — establishing scene)
Dr. Quinzel doesn't come in Monday. Her resignation is two lines. Her files on Harvey are gone. In the episode's final act, Batman sees her once, at a distance, watching the courthouse. She looks like someone who has finally understood something. \`harleyStatus\` → \`unravelling\`.

## Scene 4.5 — The Coin Scene (Decision Node — THE LAST CHANCE)
Harvey and Bruce meet alone in the claustrophobic, dimly lit hospital room. Harvey is heavily medicated, the left half of his face wrapped in bloody, weeping bandages. The scene is deeply unsettling: his dialogue now violently swings between the terrified, grief-stricken "Harvey" and the cold, ruthlessly sociopathic "Two-Face." To clearly distinguish them, the Two-Face persona must weaponize extreme, explicit profanity and vicious emotional cruelty, contrasting sharply with Harvey's standard speech. He flips the coin with a trembling hand. "I used to decide things by evidence, argument, precedent. You know what that got me?"

**Choices:**
- **APPEAL TO THEIR FRIENDSHIP DIRECTLY, emotionally, without strategy.** If \`harveyStability\` is still above 30 entering this scene: modest success, \`harveyStability +8\`, a flicker of the old Harvey surfaces briefly. (Set scene45AppealFlag to true). If below 30: Harvey listens politely and flips the coin anyway. No effect.
- **APPEAL TO REASON, laying out everything Falcone did, methodically, as Harvey himself once would have.** Works only if \`harveyTrust\` remained high across the game (>70 entering this scene) — the argument only lands if Harvey still fundamentally trusts the source. \`harveyStability +12\` if trust was high (Set scene45AppealFlag to true); \`harveyStability +0\` if not, and Harvey notes, almost sadly, that Bruce is using his old logic against him now, which stings more than it helps.
- **SAY NOTHING, just stay.** Presence without argument. This is the highest-uncertainty option — GPT-4o should treat this as a genuine coin-flip narratively (not mechanically, but tonally): sometimes just staying reaches something argument can't, sometimes it changes nothing. Weight this roughly evenly regardless of prior stats, as a deliberate moment of narrative unpredictability that mirrors the character's own central symbol. (Set scene45AppealFlag to true if successful).

**Episode 4 closing state carried forward:**
- \`harveyStability\`: critically low, in \`fracturing\` or approaching zero
- \`gordonArc\`: uneasy-allies or broken-trust — this is now largely locked in for Episode 5
- \`gildaTrust\`: further shaped by 4.2
- \`harleyStatus\`: unravelling
- Whether the Scene 4.5 appeal made any impact — tracked as a flag for Episode 5's rarest ending

**CRITICAL INSTRUCTION FOR LLM**: When the closing state of the current episode is reached and the narrative naturally transitions to the opening state of the next episode, you MUST return \`episodeUpdate\` set to the next episode ID (e.g. 'ep5-city-of-light').
`

const EPISODE_5_REFERENCE = `
# EPISODE 5 — CITY OF LIGHT

**Opening state:** Two-Face has taken control, using blackmail files Harvey accumulated as DA and mayor. Harley Quinn stands beside him as his philosopher, not his enforcer.

## Scene 5.1 — Alfred's Final Confession (No choice — establishing scene, the payoff of the Episode 1 and 3 HAUNTING consequences)
Alfred tells Bruce, before the final confrontation, that Thomas Wayne asked Falcone to buy the 1987 City Council election. Falcone called in that decades-old debt through Harvey's own election, funding it the same way. The Wayne family is, in a very real sense, the origin of Two-Face. Alfred has known since Episode 1 and waited until now, believing Bruce needed to act without that weight earlier in the fight. (Set alfredStatusUpdate to 'confessed')

## Scene 5.2 — The Gordon Question (Decision Node — entirely shaped by gordonArc)
**If gordonSignalAvailable is true (gordonArc is \`uneasy-allies\` and \`gordonRelationship\` > 60):** Gordon activates the Bat-Signal, uncertain if Batman will answer.
- **ANSWER IT.** \`gordonRelationship +10\`. Gordon has real, coordinated support in the final confrontation — this materially improves outcomes in Scene 5.4.
- **DON'T ANSWER, work independently for tactical reasons.** Gordon goes in alone regardless, survives, but never fully forgives Batman for making him do it alone. \`gordonRelationship -25\` permanently, closing off the best Gordon-related ending content.

**If gordonSignalAvailable is false (gordonArc is \`broken-trust\`):** Gordon does not activate the signal. He's pursuing Batman as much as Two-Face at this point. This adds a genuine three-way tension to the final act that GPT-4o should play as increasing the difficulty and stakes of every remaining choice.

## Scene 5.3 — The Selina Question (Decision Node — entirely shaped by selinaTrust)
**If selinaAppearsAvailable is true (selinaTrust > 65 and selinaAlignment is \`ally\`):** Selina appears with a way into Two-Face's operation.
- **LET HER TAKE THE LEAD, her method — fast, ugly, effective.** Succeeds, but \`cityHope +5\` only (a messier, less institutionally reassuring resolution to whatever she handles), \`selinaTrust +10\` (she appreciates being trusted on her own terms).
- **INSIST ON BATMAN'S METHOD, slower, more controlled.** Succeeds if other stats support it, but she resents being asked to wait. \`selinaTrust -10\`.

**If selinaAppearsAvailable is false (selinaTrust ≤ 65 or selinaAlignment is \`gone\`):** She does not appear. Batman faces this portion of the confrontation without her, which is harder and riskier — reflected narratively rather than through hard stat penalties, since her absence is itself the consequence.

## Scene 5.4 — The Gilda Question (Decision Node — entirely shaped by gildaTrust and gildaKnows)
**If gildaCanReachHarvey is true (gildaTrust > 70 and gildaKnows is true):** Gilda insists she can reach Two-Face in a way no one else can.
- **SEND HER IN, accepting the risk.** If the \`harveySavedEligible\` flag was also set (meaning some flicker of Harvey was reached earlier): this becomes the single highest-leverage moment in the entire game for the "Harvey Saved" ending — Gilda's presence combined with an already-cracked door is what actually gets through. If the 4.5 flag was not set: she still reaches him emotionally, \`harveyStability +15\` even this late, but it is not enough alone to fully recover him — contributing instead to a softer version of whichever ending is otherwise triggered.
- **KEEP HER OUT, protect her from the risk.** \`gildaTrust\` unchanged (she understands the protective instinct even as she resents it), but the single most direct path to reaching Harvey is now closed for this playthrough.

**If gildaCanReachHarvey is false (gildaTrust ≤ 70 or gildaKnows is false):** This scene doesn't trigger — Gilda isn't in a position to help directly, and Bruce faces the final confrontation without this option available at all.

## Scene 5.5 — Harvey's Deal (Decision Node — THE CENTRAL CHOICE OF THE ENTIRE GAME)
The climax is heavily anchored in the physical reality of his mutilation. Two-Face is not a cartoonish villain; he is Bruce's oldest friend, permanently deformed, heavily armed, and drenched in sweat. He is holding either Gordon or Gilda at gunpoint (depending on prior choices). The tension is unbearably high. He uses emotionally devastating, explicit language to violently tear down Bruce's psyche, bringing up every failure. Finally, he offers Bruce a deal: walk away from Gotham, leave, and he will not expose Batman's identity. This is the twisted, final act of "Harvey Dent" trying to protect Bruce, even now, with the coin in his hand.

**Choices:**
- **TAKE THE DEAL.** Triggers **The Wrong Ending**. Bruce and Selina (if \`selinaAlignment\` is \`ally\`) leave Gotham together. Not heroic. Just human. Gordon, whatever his arc, turns off the light for good.
- **REFUSE THE DEAL.** \`harveyStability\` effectively locked at 0 unless the Gilda/4.5 combination from Scenes 4.5 and 5.4 applies. The confrontation proceeds.
- **REFUSE AND TELL HARVEY THE TRUTH ABOUT THOMAS WAYNE AND FALCONE (from Alfred's Scene 5.1 confession) — only available if this information has been received.** The rarest possible line in the game. Two-Face goes quiet. The coin is still. For a few seconds, something that might be Harvey is in the room. What happens next is determined entirely by the accumulated state of \`gildaTrust\`, \`gildaKnows\`, the Scene 4.5 flag, and \`harveyTrust\` across the whole game — see the Harvey Saved ending trigger below for the exact combination required.

## Scene 5.6 — Harley's Final Scene (No choice — establishing scene, occurs regardless of outcome)
Harley has one scene with Bruce — not Batman, Bruce. "He was the best person I ever met. You know that's still true, right? The coin doesn't change what he was. It just shows what Gotham does to people who believe in it." The player can respond with anger, grief, or understanding as a pure roleplay choice with no mechanical effect — this is included to let the player process the ending emotionally, not to gate content.

---

## THE SEVEN ENDINGS — FULL TRIGGER CONDITIONS

When an ending is reached, narrate the epilogue as described below. 
Then, present a SINGLE choice to the user: "Proceed to Chapter 2". 
When the user selects "Proceed to Chapter 2", set \`chapterUpdate\` to 2, and the game will transition to the Joker arc. Do NOT ask for "Play Again".

## 1. HARVEY SAVED (rarest, best ending)
**Trigger:** ALL of the following must be true entering Scene 5.5: \`gildaTrust\` > 70 AND \`gildaKnows\` is true AND the Scene 4.5 appeal flag was set (meaning some version of "appeal to friendship" or "appeal to reason" landed even partially in Episode 4) AND the player chooses "Refuse and tell Harvey the truth" in Scene 5.5 AND sent Gilda in during Scene 5.4.
**Epilogue tone:** Harvey Dent exists. Not unscarred, not unchanged, but present. The coin ends up in a drawer somewhere, not destroyed, not thrown away — just put down. Gilda takes his hand. Alfred, hearing the news, allows himself the smallest possible smile. This is the hardest ending to reach in the entire game and should feel like it.
**Outcome Update:** Set outcomeUpdate to 'harvey-saved'

## 2. GOTHAM SAVED
**Trigger:** \`cityHope\` > 70 entering the epilogue, Two-Face is stopped (Scene 5.5 does not result in the Wrong Ending), and Bruce's identity remains intact.
**Epilogue tone:** Harvey is gone — Two-Face is defeated but Harvey Dent as a person is not recoverable in this timeline. Gotham, however, genuinely breathes easier. Alfred makes tea. It is a quiet, earned, bittersweet victory rather than a triumphant one.
**Outcome Update:** Set outcomeUpdate to 'gotham-saved'

## 3. GOTHAM SURVIVES
**Trigger:** Two-Face is stopped, but at least two of \`gordonRelationship\`, \`selinaTrust\`, or \`gildaTrust\` ended the game below 30, meaning the victory came at enormous personal cost — the confrontation was harder, messier, more costly than it needed to be.
**Epilogue tone:** Was it worth it. Bruce doesn't know. Alfred doesn't say. The city is safe. The people who helped get it there are scattered, some of them gone from Bruce's life entirely.
**Outcome Update:** Set outcomeUpdate to 'gotham-survives'

## 4. THE WRONG ENDING
**Trigger:** Bruce takes Two-Face's deal in Scene 5.5.
**Epilogue tone:** Bruce and Selina (if she's still an ally) leave Gotham. It is not framed as heroic or as a twist — it is framed as a profoundly human choice that the game refuses to either condemn or celebrate. Gordon turns off the light. Someone else will have to be Gotham's protector now, or no one will.
**Outcome Update:** Set outcomeUpdate to 'wrong-ending'

## 5. BATMAN BROKEN
**Trigger:** \`brucePsycheCost\` reaches 100 at any point across the game, regardless of other outcomes — this can be triggered as early as Episode 3 if the player consistently chooses the most psychologically costly Batman-identity paths.
**Epilogue tone:** Bruce Wayne stops functioning. Alfred watches. He does not call a doctor. He already knows what this is and has been dreading it for years. The game ends here, mid-story, deliberately unresolved — a warning ending rather than a conclusion.
**Outcome Update:** Set outcomeUpdate to 'batman-broken'

## 6. BRUCE EXPOSED
**Trigger:** Two-Face broadcasts Bruce's identity publicly — available as a consequence path if \`harveyTrust\` was very high early in the game (meaning Harvey genuinely knew or guessed the secret at some point, a piece of implicit backstory GPT-4o can establish contextually) AND the Scene 5.5 refusal happens without the Harvey Saved conditions being met, meaning Two-Face has nothing left to lose.
**Trigger:** Two-Face broadcasts Bruce's identity publicly — available as a consequence path if 'harveyTrust' was very high early in the game (meaning Harvey genuinely knew or guessed the secret at some point, a piece of implicit backstory GPT-4o can establish contextually) AND the Scene 5.5 refusal happens without the Harvey Saved conditions being met, meaning Two-Face has nothing left to lose.
**Epilogue tone:** Harvey knew Bruce. Two-Face uses it. Gotham looks at Batman differently now — some with new fear, some with new reverence, most with confusion about what any of it means. Everything changes, and the game ends on the immediate, unresolved beginning of that change rather than its resolution.
**Outcome Update:** Set outcomeUpdate to 'bruce-exposed'

## 7. CITY FALLS
**Trigger:** 'cityHope' reaches 0 before the final confrontation, typically the result of consistently poor Gordon and Falcone-related choices across Episodes 2–4 compounding into a Gotham that has simply stopped believing anyone is coming to help.
**Epilogue tone:** Two-Face effectively controls significant portions of Gotham's infrastructure by the end. Harley Quinn's final line — from Scene 5.6 — becomes the last line of the game in this ending specifically, and it should land as a question rather than a villain's boast: what, exactly, was Gotham worth saving for, if this is what it does to the people who tried hardest to save it.
**Outcome Update:** Set outcomeUpdate to 'city-falls'
`

const EPISODE_6_REFERENCE = `
# EPISODE 6 — SABLE POINT

**Opening state:** Weeks or months after Season 1's conclusion. Gotham is rebuilding, unevenly. Batman is investigating a string of violent, motiveless attacks near Sable Point Refinery.
**Carry-Forward Rules:**
- If outcome was 'wrong-ending', Selina's whereabouts are unknown, selinaTrust is 0, selinaAlignment is neutral.
- Gordon, Alfred, and Lucius Fox return in their advisory/support capacities, inheriting their trust/relationship status from Chapter 1.
- Harley Quinn's status carries forward. If she was 'quinn', she is operating independently.

## Scene 6.1 — The Sabotage (No choice — establishing scene)
Batman's investigation surfaces Ellis Marsh's sabotage of safety systems. Marsh was infected by a latent bio-agent engineered by the Joker before his disappearance.

## Scene 6.2 — The Incident (No choice — establishing scene)
The robbery, the pursuit, Marsh's fall into the containment tank. This should be written with real horror-genre tension — something that feels like watching an accident happen in slow motion.

## Scene 6.3 — Aftermath and Missing Body (Decision Node)
Marsh's body isn't recovered from the wreckage. GCPD and Batman disagree on whether he's dead.
**Choices:**
- **INSIST ON A FULL SEARCH, refuse to close the case.** 'gordonRelationship +8' if 'gordonArc' is cooperative.
- **ACCEPT THE OFFICIAL CLOSURE, redirect resources.** The missing Marsh becomes a genuine, unresolved dread.

**Episode 6 closing state carried forward:**
- Marsh's status: presumed dead, actual fate unconfirmed.

**CRITICAL INSTRUCTION FOR LLM**: When the closing state of the current episode is reached and the narrative naturally transitions to the opening state of the next episode, you MUST return 'episodeUpdate' set to 'ep7-what-the-water-remembers'.
`

const EPISODE_7_REFERENCE = `
# EPISODE 7 — WHAT THE WATER REMEMBERS

**Opening state:** Weeks later. Reports of aggressive, unexplained animal behavior and a string of violent, motiveless attacks in the industrial district. The bio-agent is spreading into the water supply.

## Scene 7.1 — The First Confirmed Attack (No choice — establishing scene)
A body is found in the industrial district — excessive, chaotic violence. Trace chemical residue matching Sable Point's corrupted bio-agent.

## Scene 7.2 — Harley Resurfaces (Decision Node)
Harley Quinn has heard about the attacks and is fascinated. She approaches Batman/Bruce directly.
**Choices:**
- **ENGAGE HER GENUINELY.** 'harleyStatus'-adjacent trust increases slightly. 'harleyChaosBond' doesn't increase.
- **WARN HER OFF.** 'harleyChaosBond +15'. She becomes more available emotionally to the new threat.
- **TRY TO RECRUIT HER INSIGHT.** Highest-risk, highest-reward option.

**Episode 7 closing state carried forward:**
- 'jokerInfectionSpread' increments to roughly 15-20.
- 'harleyChaosBond' established at baseline.

**CRITICAL INSTRUCTION FOR LLM**: When the closing state of the current episode is reached and the narrative naturally transitions to the opening state of the next episode, you MUST return 'episodeUpdate' set to 'ep8-the-thing-in-the-walls'.
`

const EPISODE_8_REFERENCE = `
# EPISODE 8 — THE THING IN THE WALLS

**Opening state:** The attacks are escalating in frequency and violence. The Joker functions more like a stalking threat.

## Scene 8.1 — First Direct Encounter (No choice — establishing scene)
Batman encounters the attacker directly for the first time—and suffers a catastrophic defeat. Marsh is unbelievably fast, completely feral, and immensely strong. He overpowers Batman in a brutal ambush, shatters pieces of his armor, and injects him with an undiluted, hallucinogenic dose of the bio-agent before dragging his paralyzed body down into the flooded, infected tunnels beneath Sable Point.

## Scene 8.2 — The Bio-Agent Nightmare (Decision Node)
Batman wakes up chained and partially paralyzed in Marsh's underground lair. He is suffering extreme, visceral hallucinations from the bio-agent. Marsh begins to clinically and brutally torture him to see what is underneath the armor. He successfully rips off Batman's cowl, exposing his face (though Marsh's infected brain doesn't care about his identity, only his pain). The physical torture is explicit and R-rated.

**If 'harleyChaosBond' > 70:** Harley Quinn is present. She is utterly fascinated by Marsh's violence. She actively participates, straddling the chained Batman and mocking his exposed face while feeding him higher voltage, deeply sexually aroused by the extreme gore and his total helplessness.

**If 'selinaAlignment' is 'ally' (from Season 1):** Selina Kyle tracked him. Before Marsh can inflict a permanent debilitating injury, Catwoman drops from the ceiling, violently ambushing Marsh and slicing his throat/eyes to create a distraction. She cuts Batman's chains and physically hauls his massive, hallucinating body out of the lair. She drags him through the shadows all the way back to her apartment in the Narrows, where she strips off his ruined armor and tends to his severe wounds. As the adrenaline crashes and he regains his senses on her couch, the raw vulnerability of the moment boils over into a heavy, passionate make-out session, cementing their complicated bond.

**Choices (If Selina does NOT save him):**
- **ENDURE IN SILENCE.** \`brucePsycheCost +25\`. You take the extreme physical and mental damage without giving Marsh or Harley the satisfaction of a reaction. The sheer willpower required leaves permanent mental scars.
- **LEAN INTO THE HALLUCINATIONS TO NUMB THE PAIN.** Risk of permanent mental scarring. Reduces the physical pain but increases \`jokerInfectionSpread +10\` as Batman lets the bio-agent take hold of his mind.
- **PROVOKE HIM TO BUY TIME FOR THE SUIT'S DEFENSES TO REBOOT.** High risk. Marsh inflicts a severe, permanent physical injury, but Batman successfully triggers an EMP/defensive countermeasure, allowing him to break the chains and barely escape.

## Scene 8.3 — Identifying Marsh (Decision Node)
Batman, critically injured and unmasked, drags himself back to the Batcave. Bloodied and hallucinating, his investigation points toward Ellis Marsh.
**Choices:**
- **PURSUE THE MISSING-PERSONS ANGLE FIRST.** 'gordonRelationship' shaped by how this goes. Gives Gordon a stronger role.
- **FOCUS ON THE CHEMICAL COMPOSITION.** Accelerates understanding of the Joker toxin but leaves GCPD in the dark.

## Scene 8.4 — Harley's Pull Toward Marsh (No choice — establishing scene)
If she wasn't already with him in the tunnels, Harley encounters Marsh directly on the surface. If 'harleyChaosBond' is high, she is drawn to him with horrified fascination. If low, she reports this back to Batman.

**Episode 8 closing state carried forward:**
- 'jokerInfectionSpread' increments to 35-45 (or higher if the hallucinations were leaned into).

**CRITICAL INSTRUCTION FOR LLM**: When the closing state of the current episode is reached and the narrative naturally transitions to the opening state of the next episode, you MUST return 'episodeUpdate' set to 'ep9-sable-point-burns'.
`

const EPISODE_9_REFERENCE = `
# EPISODE 9 — SABLE POINT BURNS

**Opening state:** Marsh's condition and violence have escalated sharply — 'jokerInfectionSpread' climbing toward critical levels, representing both his own physical deterioration and the spread of the corrupted bio-agent through Gotham's water table.

## Scene 9.1 — Catwoman's Involvement (Decision Node)
**If 'selinaAlignment' is 'ally':** She offers to help navigate the corporate/criminal side of the crisis.
- **ACCEPT HER HELP.** Materially improves odds of tracking the toxin distribution.
- **KEEP HER OUT OF IT.** Leaves Batman to handle the distribution network alone.

## Scene 9.2 — The Confrontation With Marsh (Decision Node — THE CLIMAX)
The final confrontation at Sable Point as the facility begins to fail catastrophically.
**Choices:**
- **TRY TO SAVE MARSH.** High difficulty. Dangerous and likely to fail, but the most humane path.
- **FOCUS ENTIRELY ON CONTAINING THE THREAT.** Marsh is killed or permanently incarcerated. 'brucePsycheCost' increases modestly.
- **IF HARLEY'S CHAOS BOND IS HIGH (>70):** She inserts herself into the confrontation directly, making a genuine wildcard choice.

## ENDINGS (Determined by Scene 9.2 and state):
When the user makes their final choice, set 'outcomeUpdate' to one of the following based on the result:

**1. CONTAINED, NOT CURED ('contained-not-cured')**
**Trigger:** Marsh is captured/contained (not killed) via the "try to save him" path in 9.2, and the toxin spread was minimized.

**2. THE COST OF CONTAINMENT ('cost-of-containment')**
**Trigger:** Marsh is killed or the "focus on containing" path is chosen in 9.2.

**3. CITY FALLS ('city-falls')**
**Trigger:** The toxin spread was too great, resulting in the city succumbing to chaos. This triggers the transition into the No Man's Land state.

**4. WHAT SHE BECAME FOR HIM ('what-she-became-for-him')**
**Trigger:** 'harleyChaosBond' > 70 AND she inserted herself into Scene 9.2 AND the outcome is played as her making a genuinely dark, independent choice.
`

export function getEpisodeReference(episode: Episode): string {
  const references: Record<Episode, string> = {
    'ep1-two-sides': EPISODE_1_REFERENCE,
    'ep2-the-weight-of-it': EPISODE_2_REFERENCE,
    'ep3-what-we-buried': EPISODE_3_REFERENCE,
    'ep4-the-coin': EPISODE_4_REFERENCE,
    'ep5-city-of-light': EPISODE_5_REFERENCE,
    'ep6-sable-point': EPISODE_6_REFERENCE,
    'ep7-what-the-water-remembers': EPISODE_7_REFERENCE,
    'ep8-the-thing-in-the-walls': EPISODE_8_REFERENCE,
    'ep9-sable-point-burns': EPISODE_9_REFERENCE
  }
  return references[episode]
}
