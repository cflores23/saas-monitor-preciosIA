const express = require('express');
const app = express();

// Aquí van tus rutas y middlewares
app.get('/', (req, res) => {
  res.send('Servidor corriendo!');
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT} para SaaS Monitor de Precios`);
});


