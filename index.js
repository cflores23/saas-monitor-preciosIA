const express = require('express');
const app = express();
const PORT = 4000;

app.get('/', (req, res) => {
    res.send('Servidor corriendo!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
