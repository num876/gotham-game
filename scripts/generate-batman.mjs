import OpenAI from "openai";
import fs from "fs";
import https from "https";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  console.log("Generating image with DALL-E 3...");
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1.5",
      prompt: "Photorealistic cinematic portrait of a mysterious billionaire vigilante hero standing on a gothic stone gargoyle. He wears highly advanced, sleek, ninja-style black robotic sci-fi armor. The helmet has two long pointed horns. His chest armor has a stylized glowing red winged emblem. Glowing red eyes, dramatic neon lighting, rain, incredibly detailed, 8k resolution.",
      n: 1,
      size: "1024x1024",
    });

    const url = response.data[0].url;
    console.log("Image URL generated. Downloading...");
    
    // Download directly to the public folder
    const file = fs.createWriteStream("C:\\Users\\44737\\.gemini\\antigravity\\scratch\\gotham\\public\\characters\\batman.png");
    
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log("Image downloaded and saved successfully to public/characters/batman.png.");
        
        // Also save a copy to the brain folder so we can show it in the artifact
        const brainFile = fs.createWriteStream("C:\\Users\\44737\\.gemini\\antigravity\\brain\\ea7b81b2-9ddd-4cde-b76b-a59f85e74fad\\current_batman.png");
        https.get(url, (res2) => {
          res2.pipe(brainFile);
          brainFile.on('finish', () => {
            brainFile.close();
            console.log("Copy saved for artifact.");
          });
        });
      });
    }).on('error', (err) => {
      console.error("Error downloading image:", err);
    });
  } catch (err) {
    console.error("Error generating image:", err);
  }
}

main();
