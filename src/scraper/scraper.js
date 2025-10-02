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

    const hostname = new URL(url).hostname;
    let name = '';
    let price = '';

    if (hostname.includes('bestbuy.com')) {
      // Nombre del producto
      const [nameEl] = await page.$x('//h1[contains(@class,"sku-title") or contains(@class,"sku-header__title")]');
      name = nameEl ? await page.evaluate(el => el.innerText.trim(), nameEl) : '';
    
      // Precios posibles (XPath dinámico)
      const priceXPaths = [
        '/html/body/div[5]/div[4]/div[1]/div/div[4]/div/div/div[1]/div/div[1]/div[1]/div[1]/div/div/div/div[1]/span',
        '//div[contains(@class,"priceView-hero-price")]/span',
        '//div[contains(@class,"priceView-customer-price")]/span',
        '//*[@data-testid="customer-price"]'
      ];
    
      price = '';
      for (const xp of priceXPaths) {
        try {
          await page.waitForXPath(xp, { timeout: 5000 });
          const [el] = await page.$x(xp);
          if (el) {
            price = await page.evaluate(el => el.innerText.trim(), el);
            if (price) break; // si encontramos el precio, salimos del loop
          }
        } catch (e) {
          // no hacemos nada, probamos el siguiente XPath
        }
      }
    }
     else if (hostname.includes('apple.com')) {
      // Nombre
      const [nameEl] = await page.$x('//h1[contains(@class,"product-title")]');
      name = nameEl ? await page.evaluate(el => el.innerText.trim(), nameEl) : '';

      // Precio
      const [priceEl] = await page.$x('//span[@data-autom="current-price"]');
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
