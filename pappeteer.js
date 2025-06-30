const puppeteer = require('puppeteer');
const fs = require('fs');

const keywords = require('./keywords.json').keywords;
const OUTPUT_FILE = 'emploitic_jobs.txt';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  fs.writeFileSync(OUTPUT_FILE, ''); // Clear file

  for (const keyword of keywords) {
    const encoded = encodeURIComponent(keyword);
    const url = `https://emploitic.com/offres-d-emploi?location=c1dfd96eea8cc2b62785275bca38ac261256e278&search=${encoded}`;

    console.log(`\n🔍 Searching for "${keyword}"`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    try {
      await page.waitForSelector('[data-testid="jobs-item"]', { timeout: 10000 });

      const jobs = await page.evaluate(() => {
        const jobItems = document.querySelectorAll('[data-testid="jobs-item"]');
        const base = 'https://emploitic.com';
        const results = [];

        jobItems.forEach(item => {
          const title = item.querySelector('h2')?.innerText.trim() || '';
          const company = item.querySelector('[data-testid="jobs-item-company"]')?.innerText.trim() || '';
          const locationDivs = item.querySelectorAll('[data-testid="RoomRoundedIcon"]');
          const location = locationDivs.length ? locationDivs[0].parentElement.textContent.trim() : '';
          const link = base + (item.querySelector('a')?.getAttribute('href') || '');

          if (title && company && location && link) {
            results.push({ title, company, location, link });
          }
        });

        return results;
      });

      const lines = jobs.map(job =>
        `Keyword: ${keyword}\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nLink: ${job.link}\n---\n`
      );
      fs.appendFileSync(OUTPUT_FILE, lines.join('\n'));

      console.log(`✅ Found ${jobs.length} jobs`);
    } catch (err) {
      console.error(`❌ Error for "${keyword}":`, err.message);
    }

    await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay
  }

  await browser.close();
})();
