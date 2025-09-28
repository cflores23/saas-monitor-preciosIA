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
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error al conectar a la DB:', err.code, '-', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('🔹 Verifica que el servidor MySQL esté corriendo y que el firewall permita conexiones externas.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('🔹 Verifica el usuario y la contraseña de la DB.');
        } else if (err.code === 'ENOTFOUND') {
            console.error('🔹 Host de la DB no encontrado. Revisa DB_HOST en .env');
        }
        process.exit(1); // Sale del proceso si no se puede conectar
    } else {
        console.log('✅ Conexión a la DB exitosa');
        connection.release();
    }
});

module.exports = db.promise();
