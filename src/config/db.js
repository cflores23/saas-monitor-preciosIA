// config/db.js
const mysql = require('mysql2/promise');

// Crear pool de conexiones
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

// Verificación de conexión al iniciar
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Conexión a la DB exitosa');
        connection.release();
    } catch (err) {
        console.error('❌ Error al conectar a la DB:', err.code, '-', err.message);
        process.exit(1);
    }
})();

module.exports = db;   // 🔹 NO usar .promise()
