const puppeteer = require('puppeteer');
const db = require('../config/db');
const { URL } = require('url');

async function scrapeProduct(url) {
  const browser = await puppeteer.launch({
    headless: "new", // 🔹 Usamos nuevo headless
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
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    console.log("✅ Página cargada:", url);

    await page.screenshot({ path: 'test.png', fullPage: true });

    const hostname = new URL(url).hostname;
    let name = '';
    let price = '';

    if (hostname.includes('bestbuy.com')) {
      // Nombre
      const [nameEl] = await page.$x('//h1[contains(@class,"sku-title") or contains(@class,"sku-header__title")]');
      name = nameEl ? await page.evaluate(el => el.innerText.trim(), nameEl) : '';

      // Precio: intentamos selectores generales primero
      const priceSelectors = [
        '.priceView-hero-price span',
        '.priceView-customer-price span',
        '[data-testid="customer-price"]'
      ];
      for (const sel of priceSelectors) {
        try {
          await page.waitForSelector(sel, { timeout: 10000 });
          price = await page.$eval(sel, el => el.innerText.trim());
          if (price) break;
        } catch {}
      }

      // Fallback XPath profundo
      if (!price) {
        const priceXPath = '/html/body/div[5]/div[4]/div[1]/div/div[4]/div/div/div[1]/div/div[1]/div[1]/div[1]/div/div/div/div[1]/span';
        const [priceEl] = await page.$x(priceXPath);
        price = priceEl ? await page.evaluate(el => el.innerText.trim(), priceEl) : '';
      }

    } else if (hostname.includes('apple.com')) {
      // Nombre
      const [nameEl] = await page.$x('//h1[contains(@class,"product-title")]');
      name = nameEl ? await page.evaluate(el => el.innerText.trim(), nameEl) : '';

      // Precio: span con data-autom
      try {
        await page.waitForXPath('//span[@data-autom="current-price"]', { timeout: 15000 });
        const [priceEl] = await page.$x('//span[@data-autom="current-price"]');
        price = priceEl ? await page.evaluate(el => el.innerText.trim(), priceEl) : '';
      } catch {}

      // Si sigue vacío, intenta con Shadow DOM
      if (!price) {
        const container = await page.$('body');
        if (container) {
          try {
            price = await container.evaluate(el => {
              const shadow = el.querySelector('div')?.shadowRoot;
              return shadow?.querySelector('span[data-autom="current-price"]')?.innerText.trim() || '';
            });
          } catch {}
        }
      }

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
