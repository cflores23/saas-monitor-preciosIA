// routes/dbTest.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ruta de prueba rápida
router.get('/ping', (req, res) => res.send('pong'));

// Ruta de test de DB
router.get('/db-test', async (req, res) => {
    try {
        const [rows] = await db.query('`SELECT NOW() AS current_time`');
        res.json({
            success: true,
            message: 'Conexión a la base de datos exitosa 🎉',
            db_time: rows[0].current_time
        });
    } catch (error) {
        console.error('❌ Error en la conexión a la DB:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error en la conexión a la base de datos',
            error: error.message
        });
    }
});

module.exports = router;
