const { GoogleGenAI } = require('@google/genai')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const response = await ai.models.list()
  for await (const model of response) {
    if (model.name.includes('flash')) {
      console.log(model.name)
    }
  }
}

run().catch(console.error)
