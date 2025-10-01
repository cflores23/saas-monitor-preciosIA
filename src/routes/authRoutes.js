const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { ensureAuthenticated } = require('../middleware/middleware');
const path = require('path');


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

    // Crear sesión
    req.session.user = profile;

    res.json({ success: true, user: profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// authRoutes.js
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});


// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html'); // redirige al login
});

// Devuelve datos del usuario de la sesión
router.get('/session-user', (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false });
  res.json({ success: true, user: req.session.user });
});



module.exports = router;
