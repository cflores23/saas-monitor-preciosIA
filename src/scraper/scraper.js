// src/scraper/scraper.js
const puppeteer = require('puppeteer');
const db = require('../config/db'); // 👉 ajustado a la ruta correcta
const { URL } = require('url');

async function scrapeProduct(url) {
  let browser;

  try {
    // 1. Extraer el dominio del URL
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace('www.', ''); // ejemplo: amazon.com

    // 2. Verificar si el dominio está en allowed_sites
    const [rows] = await db.execute(
      'SELECT * FROM allowed_sites WHERE domain = ?',
      [domain]
    );

    if (rows.length === 0) {
      return { error: `El dominio ${domain} no está permitido para scraping.` };
    }

    // 3. Lanzar navegador headless con Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // 4. Ejemplo: obtener nombre y precio
    const product = await page.evaluate(() => {
      const name = document.querySelector('h1')?.innerText || '';
      const price =
        document.querySelector('.price')?.innerText ||
        document.querySelector('[data-price]')?.getAttribute('data-price') ||
        '';
      return { name, price };
    });

    return { domain, ...product };
  } catch (err) {
    console.error('Error en el scraper:', err);
    return { error: 'Error al procesar el scraping.' };
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeProduct };
