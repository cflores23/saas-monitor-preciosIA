// src/scraper/scraper.js
const puppeteer = require('puppeteer');
const db = require('../config/db');
const { URL } = require('url');

async function scrapeProduct(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const hostname = new URL(url).hostname;
    let name = '';
    let price = '';

    if (hostname.includes('bestbuy.com')) {
      // BestBuy
      name = await page.$eval('h1.sku-header__title', el => el.innerText.trim()).catch(() => '');
      price = await page.$eval('.priceView-customer-price span', el => el.innerText.trim()).catch(() => '');
    } else if (hostname.includes('apple.com')) {
      // Apple
      name = await page.$eval('h1.product-title', el => el.innerText.trim()).catch(() => '');
      // Precio en Apple puede estar dentro de aria-label o data-price
      price = await page.$eval('[data-autom="current-price"], [aria-label*="Price"]', el => el.innerText.trim()).catch(() => '');
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
