// src/scraper/scraper.js
const puppeteer = require('puppeteer');
const db = require('../config/db');
const { URL } = require('url');

async function scrapeProduct(url) {
  let browser;

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace('www.', '');
    console.log('🔗 Scraper iniciado para dominio:', domain);

    // Revisar si el dominio está permitido
    const [rows] = await db.execute('SELECT * FROM allowed_sites WHERE domain = ?', [domain]);
    if (rows.length === 0) {
      return { error: `Dominio no permitido: ${domain}` };
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const product = await page.evaluate((domain) => {
      let name = '';
      let price = '';

      // Extraer nombre y precio según el dominio
      if (domain.includes('apple.com')) {
        name = document.querySelector('h1')?.innerText || '';
        price = document.querySelector('meta[itemprop="price"]')?.content || '';
      } else if (domain.includes('bestbuy.com')) {
        name = document.querySelector('.sku-title h1')?.innerText || '';
        price = document.querySelector('.priceView-customer-price span')?.innerText || '';
      } else {
        // fallback genérico
        name = document.querySelector('h1')?.innerText || '';
        price =
          document.querySelector('.price')?.innerText ||
          document.querySelector('[data-price]')?.getAttribute('data-price') ||
          '';
      }

      // Limpiar precio (solo números y punto decimal)
      if (price) {
        price = price.replace(/[^0-9.,]/g, '').replace(',', '.');
      }

      return { name, price };
    }, domain);

    console.log('📦 Datos extraídos:', product);

    if (!product.name || !product.price) {
      return { error: 'No se pudo extraer nombre o precio.' };
    }

    return { domain, ...product };
  } catch (err) {
    console.error('❌ Error en scraper:', err.message);
    return { error: 'Error al procesar el scraping.' };
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeProduct };