// src/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 🔹 Verificar conexión inicial una sola vez al levantar la app
(async () => {
    try {
        const connection = await db.getConnection();
        console.info('✅ [DB] Conexión exitosa a la base de datos');
        connection.release();
    } catch (err) {
        console.error('❌ [DB] Error de conexión:', err.code || err.message);
        process.exit(1); // Detener app si no hay conexión
    }
})();

module.exports = db; // 👉 Se exporta el pool directamente
