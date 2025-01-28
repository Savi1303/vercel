import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const port = 3100;

app.use(cors());
app.use(express.json());

// Function to scrape data using Puppeteer
const scrapeData = async (query) => {
  const browser = await puppeteer.launch({ headless: false }); // Headless mode for testing
  const page = await browser.newPage();

  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('.b_algo');

  const result = await page.evaluate(() => {
    const firstResultElement = document.querySelector('.b_algo');
    if (!firstResultElement) {
      return { Name: 'No Result Found', Link: '', hiddenContent: [] };
    }

    const titleElement = firstResultElement.querySelector('h2');
    const linkElement = firstResultElement.querySelector('a');

    const Name = titleElement ? titleElement.innerText : 'No Name Found';
    const Link = linkElement ? linkElement.href : 'No Link Found';

    const visibleContent = Array.from(firstResultElement.querySelectorAll('*'))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return (
          !el.hasAttribute('aria-hidden') &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          parseFloat(style.opacity) > 0
        );
      })
      .map(el => el.textContent?.trim())
      .filter(Boolean);

    const hiddenContent = [];
    visibleContent.forEach(content => {
      content = content.replace(/\b(?:http[s]?:\/\/[^\s]+|roblox\.com|wikipedia\.org|www\.wikipedia\.org)\b/g, ''); 
      content = content.replace(/\[.*?\]/g, ''); 
      content = content.replace(/,?\s*\(.*?\)/g, ''); 
      content = content.replace(/…$/, ''); 
      content = content.replace(/See more/g, '');  
      content = content.replace(/See all/g, '');  
      content = content.replace(/From WikipediaContent.*/g, '');  

      content = content.replace(/Wikipediahttps:\/\/en\.[^\s]+/g, 'Wikipedia');  
      content = content.replace(/https:\/\/[^\s]+/g, '');  

      content = content.replace(/Wikipedia › wiki › [^\s]+/g, '');

      if (content && !hiddenContent.includes(content) && content.length > 10) { 
        hiddenContent.push(content);
      }
    });

    if (Link === null ) {
      return {
        Name,
        Link,
        hiddenContent: hiddenContent.slice(0, 3),
        isLinkClickable: false,
      };
    }

    return {
      Name,
      Link,
      hiddenContent: hiddenContent.slice(0, 3),
      isLinkClickable: true,
    };
  });

  await browser.close();

  return result;
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
