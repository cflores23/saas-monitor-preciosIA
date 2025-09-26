// src/routes/exampleRoutes.js
const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ message: 'Pong! 🚀' });
});

module.exports = router;
