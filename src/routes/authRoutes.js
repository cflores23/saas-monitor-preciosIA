const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// Endpoint para recibir ID token desde popup
router.post('/google-popup', async (req, res) => {
  const { credential } = req.body; // viene desde el popup como 'credential'
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID
    });
    const payload = ticket.getPayload();

    const profile = {
      id: payload.sub,
      displayName: payload.name,
      emails: [{ value: payload.email }],
      photos: [{ value: payload.picture }]
    };

    await User.createOrUpdate(profile);

    // Crear sesión opcional
    req.session.user = profile;

    res.json({ success: true, user: profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Dashboard protegido
router.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.status(401).send('No autenticado');
  res.send(`<h1>Bienvenido ${req.session.user.displayName}</h1>`);
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Sesión cerrada');
});

module.exports = router;
