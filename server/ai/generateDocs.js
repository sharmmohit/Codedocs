const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

async function readCodeFiles(dir) {
  const files = await fs.readdir(dir);
  let result = "";

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (file === 'node_modules' || file === '.git') continue;
      result += await readCodeFiles(fullPath);
    } else {
      const ext = path.extname(file);
      const validExtensions = ['.js', '.ts', '.py', '.java', '.md', '.html', '.css', '.json'];

      if (validExtensions.includes(ext)) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          result += `=== FILE: ${file} ===\n\n${content}\n\n`;
        } catch (err) {
          console.warn(`⚠️ Could not read ${file}: ${err.message}`);
        result += `=== FILE: ${file} ===\n\n[Content could not be read]\n\n`;
        }
      }
    }
  }

  return result;
}

async function generateDocsFromRepo(repo) {
  const tmpDir = path.join(__dirname, '../../tmp');
  await fs.ensureDir(tmpDir);

  const repoName = repo.split('/')[1] || 'repository';
  const repoPath = path.join(tmpDir, repoName);

  // Cleanup previous clone if exists
  if (fs.existsSync(repoPath)) {
    await fs.remove(repoPath);
  }

  console.log(`📦 Cloning ${repo}...`);
  try {
    execSync(`git clone https://github.com/${repo}.git ${repoName}`, { 
      cwd: tmpDir,
      stdio: 'pipe'
    });
  } catch (err) {
    throw new Error(`Failed to clone repository: ${err.message}`);
  }

  // Read code files
  const codeContent = await readCodeFiles(repoPath);
  if (!codeContent.trim()) {
    throw new Error("No readable files found in the repository");
  }

  // Prepare prompt for Gemini
  const prompt = `
You are an expert technical writer. Create comprehensive documentation for the following codebase in Markdown format.

Include these sections:
1. Project Overview - Purpose and main functionality
2. Installation - How to install and set up
3. Usage - How to use the project
4. Architecture - Key components and structure
5. Configuration - Available options and settings
6. API Reference (if applicable)
7. Contributing Guidelines
8. License Information

Format the documentation professionally with proper headings, code blocks, and examples.

Repository content:
${codeContent.substring(0, 30000)}  // Limiting to ~30k chars
`;

  // Call Gemini API
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  const data = await response.json();

  // Cleanup
  await fs.remove(repoPath);

  if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error('API Error:', JSON.stringify(data, null, 2));
    throw new Error('Failed to generate documentation from API response');
  }

  return data.candidates[0].content.parts[0].text;
}

module.exports = { generateDocsFromRepo };