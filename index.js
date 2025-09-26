require('dotenv').config();
const express = require('express');
require('dotenv').config();

const app = require('./src/app');
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

