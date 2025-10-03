const puppeteer = require('puppeteer');
const db = require('../config/db');
const { URL } = require('url');

async function scrapeProduct(url) {
  const browser = await puppeteer.launch({
    headless: true,
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

    // -------------------- VALIDACIÓN DE DOMINIO --------------------
    const [rows] = await db.query('SELECT domain FROM allowed_sites');
    const allowedDomains = rows.map(r => r.domain.toLowerCase());

    const hostname = new URL(url).hostname.toLowerCase();
    const normalizedHost = hostname.startsWith('www.') ? hostname.slice(4) : hostname;

    if (!allowedDomains.some(domain => normalizedHost.includes(domain))) {
      throw new Error('Dominio no permitido');
    }

    let name = '';
    let price = '';

    // -------------------- BEST BUY --------------------
    if (normalizedHost.includes('bestbuy.com')) {
      const [nameEl] = await page.$x('//h1[contains(@class,"sku-title") or contains(@class,"sku-header__title")]');
      name = nameEl ? await page.evaluate(el => el.innerText.trim(), nameEl) : '';

      const priceXPath = '/html/body/div[5]/div[4]/div[1]/div/div[4]/div/div/div[1]/div/div[1]/div[1]/div[1]/div/div/div/div[1]/span';
      await page.waitForXPath(priceXPath, { timeout: 15000 });
      const [priceEl] = await page.$x(priceXPath);
      price = priceEl ? await page.evaluate(el => el.innerText.trim(), priceEl) : '';

    // -------------------- APPLE --------------------
    } else if (normalizedHost.includes('apple.com')) {
      const [nameEl] = await page.$x('//h1[contains(@class,"product-title")]');
      name = nameEl ? await page.evaluate(el => el.innerText.trim(), nameEl) : '';

      const [priceEl] = await page.$x('//span[@data-autom="current-price"]');
      price = priceEl ? await page.evaluate(el => el.innerText.trim(), priceEl) : '';

    // -------------------- MERCADO LIBRE --------------------
    } else if (normalizedHost.includes('mercadolibre.com')) {
      // Nombre del producto
      const [nameEl] = await page.$x('//h1[@class="ui-pdp-title"]');
      name = nameEl ? await page.evaluate(el => el.innerText.trim(), nameEl) : '';

      // Precio usando XPath completo
      const priceXPathFull = '/html/body/main/div[2]/div[5]/div[2]/div[2]/div/div[1]/form/div[1]/ul/li[2]/div/div[2]/div/div/div/div[1]/span/span/span[2]';
      await page.waitForXPath(priceXPathFull, { timeout: 15000 });
      const [priceEl] = await page.$x(priceXPathFull);
      price = priceEl ? await page.evaluate(el => el.innerText.trim(), priceEl) : '';

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
