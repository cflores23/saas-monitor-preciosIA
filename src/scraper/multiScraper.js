const Product = require('../models/Product');
const AllowedSite = require('../models/AllowedSite');
const { scrapeProduct } = require('./scraper');
const db = require('../config/db');

async function scrapeAllUsers() {
  const [products] = await db.query('SELECT * FROM products');
  let successCount = 0;
  let failCount = 0;

  for (const product of products) {
    try {
      const domain = new URL(product.url).hostname.replace('www.', '');

      // Verificar si el dominio está permitido
      const allowed = await AllowedSite.findByDomain(domain);
      if (!allowed) {
        console.warn(`Scraping no permitido para ${product.url}`);
        failCount++;
        continue;
      }

      const data = await scrapeProduct(product.url);
      if (!data || !data.price) {
        console.warn(`No se obtuvo precio para ${product.url}`);
        failCount++;
        continue;
      }

      // Guardar precio
      await db.query(
        `INSERT INTO prices (product_id, price, currency, recorded_at) VALUES (?, ?, ?, NOW())`,
        [product.id, data.price, data.currency || 'USD']
      );

      successCount++;

      // Aquí puedes agregar lógica de notificaciones si cambia el precio

    } catch (err) {
      console.error(`Error scrapeando producto ${product.id}:`, err.message);
      failCount++;
    }
  }

  console.info(`Scraper finalizado. Éxitos: ${successCount}, Fallos: ${failCount}`);
  return { successCount, failCount };
}

module.exports = { scrapeAllUsers };
