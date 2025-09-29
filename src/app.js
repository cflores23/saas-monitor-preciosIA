require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const exampleRoutes = require('./routes/exampleRoutes');
const dbTestRoutes = require('./routes/dbTest');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir frontend

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use('/auth', authRoutes);
app.use('/api/example', exampleRoutes);
app.use('/api', dbTestRoutes);

module.exports = app;
