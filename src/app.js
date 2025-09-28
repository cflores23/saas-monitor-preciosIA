// src/app.js
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const routes = require('./routes/exampleRoutes');
const dbTestRoutes = require('./routes/dbTest');

console.log(">>> Despliegue automático funcionando <<<");

app.use(cors());
app.use(express.json());

// ----------------- Configuración de sesiones -----------------
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// ----------------- Configuración de Passport con Google -----------------
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  // Aquí normalmente guardarías o actualizarías el usuario en la base de datos
  return done(null, profile);
}));

// ----------------- Rutas de autenticación -----------------
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Login exitoso, redirige al dashboard
    res.redirect('/dashboard');
  }
);

// Ruta de ejemplo protegida
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');
  res.send(`Hola ${req.user.displayName}, bienvenido al dashboard`);
});

// Ruta de logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// ----------------- Rutas existentes -----------------
app.use('/api/example', routes);
app.use('/api', dbTestRoutes);

module.exports = app;
