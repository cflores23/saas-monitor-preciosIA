// src/app.js
const express = require('express');
const app = express();
const routes = require('./routes/exampleRoutes');
const cors = require('cors');
console.log(">>> Despliegue automático funcionando <<<");
console.log(">>> Despliegue automático funcionando <<<");

app.use(cors());

app.use(express.json());
app.use('/api/example', routes);;

const dbTestRoutes = require('./routes/dbTest');
app.use('/api/db-test', dbTestRoutes);


module.exports = app;