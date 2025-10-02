// src/routes/scraperRoutes.js
const express = require('express');
const router = express.Router();
const { scrapeProduct } = require('../scraper/scraper');
const AllowedSite = require('../models/AllowedSite');
const { scrapeAllUsers } = require('../scraper/multiScraper');
const { ensureAuthenticated } = require('../middleware/middleware');

// Endpoint GET para probar el scraper
router.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ success: false, message: 'Falta la URL' });
  }

  try {
    // Obtener el dominio del URL
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace('www.', '');

    // Validar si el dominio está permitido
    const allowed = await AllowedSite.findByDomain(domain);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: `El scraping en el sitio ${domain} no está permitido`
      });
    }

    // Ejecutar scraping
    const result = await scrapeProduct(url);
    res.json({
      success: true,
      site: domain,
      data: result
    });

  } catch (err) {
    console.error('Error en /scrape:', err);
    res.status(500).json({
      success: false,
      message: 'Error ejecutando el scraper',
      error: err.message
    });
  }
});

router.get('/run', async (req, res) => {
  console.log('➡️ Entrando a /api/scraper/run...');
  try {
    const result = await scrapeAllUsers();
    console.log('✅ scrapeAllUsers terminó con:', result);
    res.json({ 
      success: true, 
      message: `Scraper ejecutado. Éxitos: ${result.successCount}, Fallos: ${result.failCount}`,
      ...result
    });
  } catch (err) {
    console.error('❌ Error en /run:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error ejecutando scraper', 
      error: err.message 
    });
  }
});


module.exports = router;
