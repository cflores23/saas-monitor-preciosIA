const puppeteer = require('puppeteer');
const db = require('../config/db');
const { URL } = require('url');

// Función para extraer texto desde XPath, soportando Shadow DOM
async function getPrice(page, xPaths) {
  for (const xp of xPaths) {
    try {
      await page.waitForFunction(
        xp => {
          const el = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.innerText.trim().length > 0;
        },
        { timeout: 15000 },
        xp
      );
      const [el] = await page.$x(xp);
      if (el) {
        const text = await page.evaluate(el => el.innerText.trim(), el);
        if (text) return text;
      }
    } catch {
      // Ignora error y prueba siguiente XPath
    }
  }

  // Intento dentro de Shadow DOM si no encontró
  for (const selector of ['div#pricing', 'div.price-section']) { // ejemplos comunes
    try {
      const text = await page.evaluate(sel => {
        const host = document.querySelector(sel);
        if (!host) return '';
        const shadowRoot = host.shadowRoot;
        if (!shadowRoot) return '';
        const span = shadowRoot.querySelector('span');
        return span ? span.innerText.trim() : '';
      }, selector);
      if (text) return text;
    } catch {
      continue;
    }
  }

  return '';
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

      // Precio
      const priceXPaths = [
        '//div[contains(@class,"priceView-hero-price")]/span',
        '//div[contains(@class,"priceView-customer-price")]/span',
        '//*[@data-testid="customer-price"]'
      ];
      price = await getPrice(page, priceXPaths);

    } else if (hostname.includes('apple.com')) {
      // Nombre
      const [nameEl] = await page.$x('//h1[contains(@class,"product-title")]');
      name = nameEl ? await page.evaluate(el => el.innerText.trim(), nameEl) : '';

      // Precio
      const priceXPaths = ['//span[@data-autom="current-price"]'];
      price = await getPrice(page, priceXPaths);

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
