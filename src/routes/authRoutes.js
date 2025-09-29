// src/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const { dashboard, logout } = require('../controllers/authController');
const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/dashboard')
);

router.get('/dashboard', dashboard);
router.get('/logout', logout);

module.exports = router;