// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Rutas
const authRoutes = require('./routes/authRoutes');
const exampleRoutes = require('./routes/exampleRoutes');
const dbTestRoutes = require('./routes/dbTest');
const db = require('./config/db'); // Pool MySQL

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir frontend estático

// ===== SESIÓN PERSISTENTE EN DB =====
const sessionStore = new MySQLStore({}, db);

app.use(session({
  key: 'saas_monitor_session',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
}));

// ===== MIDDLEWARE PARA RUTAS PRIVADAS =====
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.status(401).send('No autenticado');
}

// ===== RUTAS =====
app.use('/auth', authRoutes);
app.use('/api/example', exampleRoutes);
app.use('/api', dbTestRoutes);

// Ejemplo de ruta protegida
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.send(`<h1>Bienvenido ${req.session.user.displayName}</h1>`);
});

module.exports = app;
