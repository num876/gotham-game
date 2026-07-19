import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  try {
    const list = await openai.models.list();
    const modelNames = list.data.map(m => m.id);
    const imageModels = modelNames.filter(m => m.includes('dall-e'));
    console.log("Available DALL-E models:", imageModels);
  } catch (err) {
    console.error("Error listing models:", err.message);
  }
}

main();
