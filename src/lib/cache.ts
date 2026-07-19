import fs from 'fs'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), '.gotham-cache')

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

export function setCachedNarrative(sessionId: string, choiceId: string, data: unknown) {
  const filePath = path.join(CACHE_DIR, `${sessionId}-${choiceId}.json`)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('Failed to write to cache', e)
  }
}

export function getCachedNarrative(sessionId: string, choiceId: string): unknown | null {
  const filePath = path.join(CACHE_DIR, `${sessionId}-${choiceId}.json`)
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data)
    } catch (e) {
      console.error('Failed to read from cache', e)
      return null
    }
  }
  return null
}
