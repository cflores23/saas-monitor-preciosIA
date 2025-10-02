const puppeteer = require('puppeteer');
const db = require('../config/db');
const { URL } = require('url');

// Función reutilizable para esperar y obtener texto desde XPath
async function getPriceByXPath(page, xPath) {
  try {
    await page.waitForFunction(
      xp => {
        const el = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return el && el.innerText.trim().length > 0;
      },
      { timeout: 15000 },
      xPath
    );
    const [el] = await page.$x(xPath);
    return el ? await page.evaluate(el => el.innerText.trim(), el) : '';
  } catch {
    return '';
  }
}

async function scrapeProduct(url) {
  const browser = await puppeteer.launch({
    headless: "new", // evita warning de Puppeteer old Headless
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--single-process',
      '--disable-features=site-per-process'
    ]
  });

  const page = await browser.newPage();

  try {
    console.log("🌐 Navegando a:", url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log("✅ Página cargada:", url);

    await page.screenshot({ path: 'test.png', fullPage: true });

    const hostname = new URL(url).hostname;
    let name = '';
    let price = '';

    if (hostname.includes('bestbuy.com')) {
      // Nombre
      const [nameEl] = await page.$x('//h1[contains(@class,"sku-title") or contains(@class,"sku-header__title")]');
      name = nameEl ? await page.evaluate(el => el.innerText.trim(), nameEl) : '';

      // Precio: intentamos varios XPaths dinámicos
      const priceXPaths = [
        '//div[contains(@class,"priceView-hero-price")]/span',
        '//div[contains(@class,"priceView-customer-price")]/span',
        '//*[@data-testid="customer-price"]'
      ];
      for (const xp of priceXPaths) {
        price = await getPriceByXPath(page, xp);
        if (price) break;
      }

    } else if (hostname.includes('apple.com')) {
      // Nombre
      const [nameEl] = await page.$x('//h1[contains(@class,"product-title")]');
      name = nameEl ? await page.evaluate(el => el.innerText.trim(), nameEl) : '';

      // Precio
      const priceXPath = '//span[@data-autom="current-price"]';
      price = await getPriceByXPath(page, priceXPath);

    } else {
      throw new Error('Dominio no permitido');
    }

    if (!name || !price) {
      return { success: false, reason: 'No se pudo extraer nombre o precio.', data: { name, price } };
    }

    return { success: true, data: { name, price } };

  } catch (err) {
    return { success: false, reason: err.message };
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeProduct };
