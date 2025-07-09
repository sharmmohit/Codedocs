const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

/**
 * Recursively read code files from a directory.
 */
async function readCodeFiles(dir) {
  const files = await fs.readdir(dir);
  let result = "";

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      result += await readCodeFiles(fullPath);
    } else {
      const ext = path.extname(file);
      const validExtensions = [".js", ".ts", ".tsx", ".jsx", ".py", ".java", ".md", ".html", ".css"];

      if (validExtensions.includes(ext)) {
        try {
          const data = await fs.readFile(fullPath, "utf8");
          result += `File: ${fullPath}\n\n${data}\n\n---\n\n`;
        } catch (err) {
          console.warn(`Failed to read ${file}: ${err.message}`);
        }
      }
    }
  }

  return result;
}

/**
 * Generate docs using Gemini 2.0 Flash API.
 */
async function generateDocsFromRepo(repo) {
  const tmpDir = path.join(__dirname, "../../tmp");
  await fs.ensureDir(tmpDir);

  const repoUrl = `https://github.com/${repo}.git`;
  const repoName = repo.split("/")[1];
  const repoPath = path.join(tmpDir, repoName);

  // Cleanup & Clone
  if (fs.existsSync(repoPath)) await fs.remove(repoPath);
  console.log(`📦 Cloning repo ${repoUrl}...`);
  execSync(`git clone --depth=1 ${repoUrl}`, { cwd: tmpDir });

  // Read code files
  const codeContent = await readCodeFiles(repoPath);

  if (!codeContent.trim()) {
    throw new Error("No readable files found in the repo.");
  }

  const prompt = `
You are an expert AI documentation assistant. Analyze the following codebase and generate professional-level documentation (like a README.md) using Markdown. Explain the purpose, structure, components, and how to use the repo clearly.

Only return the generated documentation. Do NOT include code that was used as input. Keep formatting clean.

${codeContent.slice(0, 12000)} 
  `;

  // Call Gemini API
  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const json = await response.json();

  // Cleanup cloned repo
  await fs.remove(repoPath);

  if (!json?.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error("Gemini API Error:", JSON.stringify(json, null, 2));
    throw new Error("Gemini API returned an invalid response.");
  }

  return json.candidates[0].content.parts[0].text;
}

module.exports = { generateDocsFromRepo };
