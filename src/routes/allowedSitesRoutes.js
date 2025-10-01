// src/routes/allowedSitesRoutes.js
const express = require('express');
const router = express.Router();
const AllowedSite = require('../models/AllowedSite');

// Listar todos los dominios permitidos
router.get('/', async (req, res) => {
  try {
    const sites = await AllowedSite.getAll();
    res.json(sites); // devolver directamente un array, coincide con el frontend
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Crear un nuevo dominio permitido
router.post('/add', async (req, res) => {
  const { domain, description } = req.body;
  if (!domain) {
    return res.status(400).json({ success: false, message: 'Falta el dominio' });
  }

  try {
    const id = await AllowedSite.create(domain, description);
    res.json({ success: true, message: 'Dominio agregado', id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Eliminar un dominio por ID
router.post('/delete', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ success: false, message: 'Falta el ID' });

  try {
    const affectedRows = await AllowedSite.deleteById(id);
    if (affectedRows === 0) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.json({ success: true, message: 'Dominio eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
