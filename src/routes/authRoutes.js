const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// Endpoint para recibir ID token desde frontend
router.post('/google', async (req, res) => {
  const { id_token } = req.body;
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

    await User.createOrUpdate(profile);

    // Crear sesión opcional
    req.session.user = profile;

    res.json({ success: true, user: profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.status(401).send('No autenticado');
  res.send(`<h1>Bienvenido ${req.session.user.displayName}</h1>`);
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Sesión cerrada');
});

module.exports = router;
