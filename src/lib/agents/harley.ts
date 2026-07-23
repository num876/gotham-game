import { GoogleGenAI } from '@google/genai'
import { GameState } from '@/types/game'

const apiKey = process.env.GEMINI_API_KEY
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

export async function generateHarleyDialogue(state: GameState, playerChoice: string): Promise<string | null> {
  if (!ai) return null;
  
  // Harley only matters significantly in episodes > 5 or if harleyChaosBond > 20
  if (state.episode !== 'ep6-sable-point' && state.episode !== 'ep7-what-the-water-remembers' && state.episode !== 'ep8-the-thing-in-the-walls' && state.episode !== 'ep9-sable-point-burns' && (state.harleyChaosBond || 0) < 20) {
    return null;
  }

  const prompt = `
You are HARLEY QUINN. 
You are currently observing the player (who is acting as ${state.activeIdentity.toUpperCase()}) making a choice: "${playerChoice}".
The scene is: ${state.currentSceneTitle}.
Your current bond with the player is: ${state.harleyChaosBond} / 100. (High bond = more affectionate and terrifyingly obsessed. Low bond = more erratic and purely destructive).

Respond with EXACTLY ONE line of dialogue. Do not include actions, stage directions, or quotation marks. Just the spoken words. 
Keep it under 30 words.
Be manic, darkly humorous, and unsettling. Use your thick Brooklyn accent occasionally.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 50,
        temperature: 0.9,
      }
    });
    
    return response.text?.trim() || null;
  } catch (e) {
    console.error('Failed to generate Harley dialogue:', e);
    return null;
  }
}
