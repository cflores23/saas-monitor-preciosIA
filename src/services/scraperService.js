// src/services/scraperService.js
const puppeteer = require('puppeteer');

async function scrapePage(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Ejemplo: extraer título de la página
    const title = await page.title();

    // Ejemplo: buscar precio (ajustaremos selectores después)
    let price = await page.$eval('.price', el => el.innerText).catch(() => null);

    return { title, price };
  } finally {
    await browser.close();
  }
}

module.exports = { scrapePage };
