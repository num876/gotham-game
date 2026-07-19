import OpenAI from "openai";
import fs from "fs";
import https from "https";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  console.log("Generating image with gpt-image-1.5...");
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1.5",
      prompt: "Photorealistic cinematic portrait of a beautiful female comic character. She has a fit, athletic body. She is wearing a sleek black latex catsuit, unmasked. Short black hair, piercing green eyes, confident expression. Dark gritty cinematic urban background, dramatic neon lighting, 8k resolution, photorealistic.",
      n: 1,
      size: "1024x1024",
    });

    const b64 = response.data[0]?.b64_json;
    if (b64) {
      console.log("Image b64 generated. Saving...");
      const buffer = Buffer.from(b64, "base64");
      fs.writeFileSync("public/characters/catwoman.png", buffer);
      fs.writeFileSync("C:\\Users\\44737\\.gemini\\antigravity\\brain\\ea7b81b2-9ddd-4cde-b76b-a59f85e74fad\\catwoman_dalle.png", buffer);
      console.log("Catwoman image saved successfully.");
      return;
    }
    const url = response.data[0]?.url;
    if (!url) {
      console.log("No URL or b64 found in response.");
      return;
    }
    console.log("Image URL generated:", url);
    console.log("Downloading...");

    const imgRes = await fetch(url);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync("public/characters/catwoman.png", buffer);
    fs.writeFileSync("C:\\Users\\44737\\.gemini\\antigravity\\brain\\ea7b81b2-9ddd-4cde-b76b-a59f85e74fad\\catwoman_dalle.png", buffer);
    console.log("Catwoman image downloaded successfully.");

  } catch (err) {
    console.error("Error generating image:", err);
  }
}

main();
