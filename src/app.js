require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport'); // ✅ ya configurado
const routes = require('./routes/exampleRoutes');
const dbTestRoutes = require('./routes/dbTest');
const authRoutes = require('./routes/authRoutes');

const app = express();
console.log(">>> Despliegue automático funcionando <<<");

// Middlewares
app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ Rutas
app.use('/auth', authRoutes);
app.use('/api/example', routes);
app.use('/api', dbTestRoutes); // Aquí estará el /ping final

module.exports = app;
