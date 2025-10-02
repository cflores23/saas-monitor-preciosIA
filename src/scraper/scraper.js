// src/scraper/scraper.js
const puppeteer = require('puppeteer');
const db = require('../config/db');
const { URL } = require('url');

async function scrapeProduct(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const hostname = new URL(url).hostname;
    let name = '';
    let price = '';

    if (hostname.includes('bestbuy.com')) {
      // BestBuy
      name = await page.$eval('h1.sku-title, h1.sku-header__title', el => el.innerText.trim()).catch(() => '');
    
      // Esperar a que aparezca el contenedor de precio
      await page.waitForSelector('.priceView-hero-price span, .priceView-customer-price span, [data-testid="customer-price"]', { timeout: 15000 }).catch(() => null);
    
      price = await page.$eval('.priceView-hero-price span', el => el.innerText.trim())
        .catch(async () => {
          return await page.$eval('.priceView-customer-price span', el => el.innerText.trim())
            .catch(async () => {
              return await page.$eval('[data-testid="customer-price"]', el => el.innerText.trim()).catch(() => '');
            });
        });
    }
     else if (hostname.includes('apple.com')) {
      // Apple
      await page.waitForSelector('h1.product-title').catch(() => {});
  name = await page.$eval('h1.product-title', el => el.innerText.trim()).catch(() => '');
  price = await page.$eval('[data-autom="current-price"]', el => el.innerText.trim()).catch(() => '');
    } else {
      throw new Error('Dominio no permitido');
    }

    if (!name || !price) {
      return { success: false, reason: 'No se pudo extraer nombre o precio.', data: { name, price } };
    }

    return { success: true, data: { name, price } };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}


module.exports = { scrapeProduct };
