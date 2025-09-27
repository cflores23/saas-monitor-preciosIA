// index.js en la raíz
require('dotenv').config();                // Para cargar variables de entorno
const app = require('./src/app');          // <- Importa la app que tiene las rutas
const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT} para SaaS Monitor de Precios`);
});

