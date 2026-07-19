import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey }) : null

const STORE_PATH = path.join(process.cwd(), '.gotham-vector-store.json')

export interface Memory {
  id: string
  sessionId: string
  text: string
  embedding: number[]
  timestamp: number
}

// Cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

function loadStore(): Memory[] {
  if (fs.existsSync(STORE_PATH)) {
    try {
      const data = fs.readFileSync(STORE_PATH, 'utf-8')
      return JSON.parse(data)
    } catch (e) {
      console.error('Failed to load vector store', e)
      return []
    }
  }
  return []
}

function saveStore(store: Memory[]) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2))
  } catch (e) {
    console.error('Failed to save vector store', e)
  }
}

export async function addMemory(sessionId: string, text: string) {
  if (!openai) return
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    
    const embedding = response.data[0].embedding
    const memory: Memory = {
      id: Math.random().toString(36).substring(7),
      sessionId,
      text,
      embedding,
      timestamp: Date.now()
    }
    
    const store = loadStore()
    store.push(memory)
    saveStore(store)
    
  } catch (e) {
    console.error('Failed to add memory', e)
  }
}

export async function retrieveRelevantMemories(sessionId: string, query: string, topK: number = 3): Promise<string[]> {
  if (!openai) return []
  
  try {
    const store = loadStore().filter(m => m.sessionId === sessionId)
    if (store.length === 0) return []
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })
    const queryEmbedding = response.data[0].embedding
    
    const scoredMemories = store.map(memory => ({
      ...memory,
      score: cosineSimilarity(queryEmbedding, memory.embedding)
    }))
    
    // Sort by descending score
    scoredMemories.sort((a, b) => b.score - a.score)
    
    // Return top K text snippets
    return scoredMemories.slice(0, topK).map(m => m.text)
  } catch (e) {
    console.error('Failed to retrieve memories', e)
    return []
  }
}
