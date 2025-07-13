require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { generateDocsFromRepo } = require('./ai/generateDocs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Docs generation endpoint
app.get('/generate-docs', async (req, res) => {
  try {
    const { repo } = req.query;
    
    if (!repo) {
      return res.status(400).json({ error: "GitHub repository URL is required" });
    }

    const markdown = await generateDocsFromRepo(repo);
    res.json({ content: markdown });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ 
      error: "Failed to generate documentation",
      details: err.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
});