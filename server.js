// server.js
import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3100;  // Use environment variable for port (for Render, Heroku, etc.)

app.use(cors());
app.use(express.json());

// Scraping logic
const scrapeData = async (query) => {
  // Puppeteer scraping logic
};

// API route to handle scrape request
app.post('/scrape', async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const data = await scrapeData(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape data', details: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
