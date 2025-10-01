// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// Middleware para rutas privadas
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ success: false, error: 'No autenticado' });
}

// Endpoint para recibir ID token desde popup
router.post('/google-popup', async (req, res) => {
  const { id_token } = req.body; // viene desde popup como 'id_token'

  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: CLIENT_ID
    });

    const payload = ticket.getPayload();

    const profile = {
      id: payload.sub,
      displayName: payload.name,
      emails: [{ value: payload.email }],
      photos: [{ value: payload.picture }]
    };

    // Guardar o actualizar usuario en la DB
    await User.createOrUpdate(profile);

    // Crear sesión
    req.session.user = profile;

    res.json({ success: true, user: profile });
  } catch (err) {
    console.error('Error autenticando con Google:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Sesión cerrada' });
});

// Ruta protegida ejemplo
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.send(`<h1>Bienvenido ${req.session.user.displayName}</h1>`);
});

module.exports = router;
