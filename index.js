require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.PORT || 4000;

// Evitar imprimir varias veces si se usan clusters (PM2)
const cluster = require('cluster');

if (!cluster.isWorker) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
} else {
  // En workers solo levantamos el servidor, sin imprimir
  app.listen(PORT);
}

