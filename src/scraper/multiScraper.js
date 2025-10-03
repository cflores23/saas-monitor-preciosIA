// src/scraper/multiScraper.js
const Product = require('../models/Product');
const AllowedSite = require('../models/AllowedSite');
const { scrapeProduct } = require('./scraper');
const db = require('../config/db');

async function scrapeAllUsers() {
  console.log('🔎 scrapeAllUsers iniciado...');
  const [products] = await db.query('SELECT * FROM products');
  console.log(`📦 Productos encontrados: ${products.length}`);

  // Traer los dominios permitidos de la base de datos
  const [rows] = await db.query('SELECT domain FROM allowed_sites');
  const allowedDomains = rows.map(r => r.domain); 

  let successCount = 0;
  let failCount = 0;
  const errors = []; // Log detallado de fallos

  for (const product of products) {
    try {
      const domain = new URL(product.url).hostname.replace('www.', '');
      const allowed = await AllowedSite.findByDomain(domain);

      if (!allowed) {
        console.warn(`❌ Scraping no permitido para ${product.url}`);
        failCount++;
        errors.push({ productId: product.id, url: product.url, reason: 'Dominio no permitido' });
        continue;
      }

      const hostname = new URL(url).hostname.toLowerCase(); // www.mercadolibre.com.mx
      const allowedDomains = rows.map(r => r.domain.toLowerCase()); // mercadolibre.com

      const isAllowed = allowedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));

      if (!isAllowed) {
        throw new Error('Dominio no permitido');
      }


      const data = await scrapeProduct(product.url);

      if (data.error || !data.price) {
        console.warn(`❌ No se obtuvo precio para ${product.url}`);
        failCount++;
        errors.push({ productId: product.id, url: product.url, reason: data.error || 'No se obtuvo precio', data });
        continue;
      }

      // Guardar precio en la tabla prices
      await db.query(
        `INSERT INTO prices (product_id, price, currency, recorded_at) VALUES (?, ?, ?, NOW())`,
        [product.id, data.price, 'USD']
      );

      successCount++;
      console.log(`✅ Precio actualizado: ${product.url} → ${data.price}`);

    } catch (err) {
      console.error(`❌ Error scrapeando producto ${product.id} (${product.url}):`, err.message);
      failCount++;
      errors.push({ productId: product.id, url: product.url, reason: err.message, stack: err.stack });
    }
  }

  console.info(`🔹 Scraper finalizado. Éxitos: ${successCount}, Fallos: ${failCount}`);
  return { successCount, failCount, errors };
}

module.exports = { scrapeAllUsers };
