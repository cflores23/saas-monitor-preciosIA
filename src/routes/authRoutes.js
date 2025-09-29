// src/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const { dashboard, logout } = require('../controllers/authController');
const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback de Google
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Login exitoso
        res.send(`¡Hola ${req.user.displayName}! Sesión iniciada correctamente.`);
    }
);

router.get('/dashboard', dashboard);
router.get('/logout', logout);

module.exports = router;