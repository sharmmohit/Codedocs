const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateDocsFromRepo(repo) {
  const tmpDir = path.join(__dirname, "../../tmp");
  await fs.ensureDir(tmpDir);
  const repoUrl = `https://github.com/${repo}.git`;
  const repoName = repo.split("/")[1];
  const repoPath = path.join(tmpDir, repoName);

  // Cleanup & Clone
  if (fs.existsSync(repoPath)) await fs.remove(repoPath);
  execSync(`git clone --depth=1 ${repoUrl}`, { cwd: tmpDir });

  // Read all .js, .ts, .md, .py files
  const files = await fs.readdir(repoPath);
  let content = "";

  for (const file of files) {
    const ext = path.extname(file);
    if ([".js", ".ts", ".tsx", ".py", ".md"].includes(ext)) {
      const data = await fs.readFile(path.join(repoPath, file), "utf8");
      content += `File: ${file}\n\n${data}\n\n---\n\n`;
    }
  }

  // Use OpenAI to generate documentation
  const prompt = `You're a documentation assistant. Generate clear README-style docs for the following codebase:\n\n${content.slice(0, 12000)}`;

  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  // Cleanup cloned repo
  await fs.remove(repoPath);

  return response.choices[0].message.content;
}

module.exports = { generateDocsFromRepo };
