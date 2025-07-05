const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { generateDocsFromRepo } = require("./ai/generateDocs");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/generate-docs", async (req, res) => {
  const { repo } = req.query;
  if (!repo) return res.status(400).json({ error: "Repo name required" });

  try {
    const markdown = await generateDocsFromRepo(repo);
    res.json({ content: markdown });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to generate docs" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
