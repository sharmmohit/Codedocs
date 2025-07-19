require('dotenv').config();
const { generateDocsFromRepo } = require('./ai/generateDocs');

(async () => {
  let inputRepo = process.argv[2];
  if (!inputRepo) {
    console.log("❌ Please provide a GitHub repo (e.g., 'user/repo' or full URL)");
    process.exit(1);
  }

  const match = inputRepo.match(/github\.com\/([\w-]+\/[\w.-]+)/);
  const repo = match ? match[1] : inputRepo;

  try {
    console.log(`📁 Generating documentation for: ${repo} ...`);
    const docs = await generateDocsFromRepo(repo);
    console.log(`✅ Documentation generated:\n\n`);
    console.log(docs);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();
