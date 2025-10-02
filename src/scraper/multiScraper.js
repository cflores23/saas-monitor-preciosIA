const Product = require('../models/Product');
const AllowedSite = require('../models/AllowedSite');
const { scrapeProduct } = require('./scraper');
const db = require('../config/db');

async function scrapeAllUsers() {
  const [products] = await db.query('SELECT * FROM products');
  let successCount = 0;
  let failCount = 0;
  const errors = []; // Nuevo: para log detallado

  for (const product of products) {
    try {
      const domain = new URL(product.url).hostname.replace('www.', '');
      const allowed = await AllowedSite.findByDomain(domain);

      if (!allowed) {
        console.warn(`❌ Scraping no permitido para ${product.url}`);
        failCount++;
        errors.push({ product: product.id, reason: 'Dominio no permitido' });
        continue;
      }

      const data = await scrapeProduct(product.url);
      if (!data || !data.price) {
        console.warn(`❌ No se obtuvo precio para ${product.url}`);
        failCount++;
        errors.push({ product: product.id, reason: 'No se obtuvo precio', data });
        continue;
      }

      await db.query(
        `INSERT INTO prices (product_id, price, currency, recorded_at) VALUES (?, ?, ?, NOW())`,
        [product.id, data.price, data.currency || 'USD']
      );

      successCount++;

    } catch (err) {
      console.error(`❌ Error scrapeando producto ${product.id}:`, err);
      failCount++;
      errors.push({ product: product.id, reason: err.message || 'Error desconocido', stack: err.stack });
    }
  }

  console.info(`Scraper finalizado. Éxitos: ${successCount}, Fallos: ${failCount}`);
  return { successCount, failCount, errors }; // Nuevo: devuelve errores
}

module.exports = { scrapeAllUsers };
