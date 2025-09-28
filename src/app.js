// src/app.js
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db'); // Conexión MySQL

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
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Buscar si el usuario ya existe en la DB
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE google_id = ?',
      [profile.id]
    );

    if (rows.length === 0) {
      // Usuario nuevo → insertar
      await pool.query(
        'INSERT INTO users (google_id, display_name, email, photo) VALUES (?, ?, ?, ?)',
        [
          profile.id,
          profile.displayName,
          profile.emails[0].value,
          profile.photos[0]?.value || null
        ]
      );
    } else {
      // Usuario existente → actualizar info
      await pool.query(
        'UPDATE users SET display_name = ?, email = ?, photo = ? WHERE google_id = ?',
        [
          profile.displayName,
          profile.emails[0].value,
          profile.photos[0]?.value || null,
          profile.id
        ]
      );
    }

    return done(null, profile);
  } catch (err) {
    return done(err, null);
  }
}));

// ----------------- Rutas de autenticación -----------------
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Ruta protegida de ejemplo
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');
  res.send(`Hola ${req.user.displayName}, bienvenido al dashboard`);
});

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

// ----------------- Rutas existentes -----------------
app.use('/api/example', routes);
app.use('/api', dbTestRoutes);

module.exports = app;
