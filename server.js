import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3100;  // Use process.env.PORT if available, else fallback to 3100

app.use(cors());
app.use(express.json());

// Function to scrape data using Puppeteer
const scrapeData = async (query) => {
  // Your Puppeteer scraping logic here
};

// Endpoint to handle the scrape request
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

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
