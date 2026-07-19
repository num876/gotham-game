import OpenAI from 'openai'
import { GameState } from '@/types/game'

const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey, baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" }) : null

export async function generateHarleyDialogue(state: GameState, playerChoice: string): Promise<string | null> {
  if (!openai) return null;
  
  // Harley only matters significantly in episodes > 5 or if harleyChaosBond > 20
  if (state.episode !== 'Episode 6' && state.episode !== 'Episode 7' && state.episode !== 'Episode 8' && state.episode !== 'Episode 9' && (state.harleyChaosBond || 0) < 20) {
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
    const response = await openai.chat.completions.create({
      model: 'gemini-1.5-pro',
      messages: [{ role: 'system', content: prompt }],
      max_tokens: 50,
      temperature: 0.9,
    });
    
    return response.choices[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error('Failed to generate Harley dialogue:', e);
    return null;
  }
}
