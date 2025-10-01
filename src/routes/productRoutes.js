// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { ensureAuthenticated } = require('../middleware/middleware');
const { scrapeProduct } = require('../scraper/scraper');
const db = require('../config/db');

// Listar productos de un usuario con su último precio
router.get('/', ensureAuthenticated, async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ success: false, message: 'No autenticado' });

  try {
    const [products] = await db.query(
      `SELECT p.id, p.name, p.description, p.url,
              (SELECT pr.price 
               FROM prices pr 
               WHERE pr.product_id = p.id 
               ORDER BY pr.recorded_at DESC 
               LIMIT 1) AS last_price,
              (SELECT pr.recorded_at 
               FROM prices pr 
               WHERE pr.product_id = p.id 
               ORDER BY pr.recorded_at DESC 
               LIMIT 1) AS last_recorded
       FROM products p
       WHERE p.user_id = ?`,
      [userId]
    );

    res.json({ success: true, data: products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Crear un producto
router.post('/add', ensureAuthenticated, async (req, res) => {
  const { name, url, description } = req.body;
  if (!name || !url) return res.status(400).json({ success: false, message: 'Faltan datos' });

  const id = await Product.create(req.session.user.id, name, url, description);
  res.json({ success: true, message: 'Producto agregado', id });
});

// Eliminar un producto
router.post('/delete', ensureAuthenticated, async (req, res) => {
  const { id } = req.body;
  const affectedRows = await Product.deleteById(id);
  if (affectedRows === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  res.json({ success: true, message: 'Producto eliminado' });
});

// Endpoint para obtener el último precio de un producto
router.get('/:id/last-price', ensureAuthenticated, async (req, res) => {
  const productId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT price, recorded_at 
       FROM prices 
       WHERE product_id = ? 
       ORDER BY recorded_at DESC 
       LIMIT 1`,
      [productId]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: 'No hay precios registrados' });
    }

    const { price, recorded_at } = rows[0];
    res.json({ success: true, price, recorded_at });
  } catch (err) {
    console.error('Error fetching last price:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✨ Nuevo endpoint: actualizar precio de un producto usando el scraper
router.post('/:id/update-price', ensureAuthenticated, async (req, res) => {
  const productId = req.params.id;

  try {
    // Obtener URL del producto
    const [rows] = await db.query('SELECT url FROM products WHERE id = ?', [productId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    const url = rows[0].url;

    // Ejecutar scraper
    const scraped = await scrapeProduct(url);
    if (!scraped || !scraped.price) return res.status(500).json({ success: false, message: 'Error al obtener precio' });

    // Guardar precio en tabla prices
    const [result] = await db.query(
      'INSERT INTO prices (product_id, price, currency, recorded_at) VALUES (?, ?, ?, NOW())',
      [productId, scraped.price, 'MX'] // Puedes ajustar moneda según sea necesario
    );

    res.json({ success: true, message: 'Precio actualizado', price: scraped.price });
  } catch (err) {
    console.error('Error actualizando precio:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
