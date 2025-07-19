// Generate Documentation from Repo - Using Together.ai API with Token Limit Handling

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
const MODEL_NAME = 'meta-llama/Llama-3-70b-chat-hf';

async function generateDocumentation(repoContent) {
  try {
    // Limit tokens to avoid input overflow error
    const maxInputTokens = 7000;
    const maxNewTokens = 512;
    const safeInput = repoContent.slice(0, maxInputTokens);

    if (repoContent.length > maxInputTokens) {
      console.warn("⚠️ Truncated input to avoid token limit overflow.");
    }

    const headers = {
      'Authorization': `Bearer ${TOGETHER_API_KEY}`,
      'Content-Type': 'application/json'
    };

    const payload = {
      model: MODEL_NAME,
      messages: [
        {
          role: "user",
          content: `Generate a detailed README.md and documentation for the following project source code:

${safeInput}`
        }
      ],
      max_tokens: maxNewTokens,
      temperature: 0.7
    };

    const response = await axios.post(TOGETHER_API_URL, payload, { headers });
    const result = response.data.choices[0].message.content;
    console.log("📘 Generated Documentation:\n");
    console.log(result);
    fs.writeFileSync("GENERATED_README.md", result);
    console.log("✅ Documentation saved to GENERATED_README.md");
  } catch (error) {
    console.error("❌ Error: Failed to generate documentation from Together.ai");
    console.error(error.response?.data || error.message);
  }
}

// Example usage
const repoPath = './sharmmohit/weather-app';
const readSourceFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files
    .filter(file => file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.md'))
    .map(file => fs.readFileSync(`${dir}/${file}`, 'utf-8'))
    .join('\n\n');
};

const repoContent = readSourceFiles(repoPath);
generateDocumentation(repoContent);
