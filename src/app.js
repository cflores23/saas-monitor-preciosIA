// src/app.js
const express = require('express');
const app = express();
const routes = require('./routes/exampleRoutes');
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use('/api', routes);

module.exports = app;