// config/db.js
const mysql = require('mysql2');

// Crear pool con promesas
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise(); // 🔹 Aquí se activa el uso de promesas

// Verificación al iniciar
(async () => {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('✅ Conexión a la DB exitosa');
  } catch (err) {
    console.error('❌ Error al conectar a la DB:', err.code, '-', err.message);
    process.exit(1);
  }
})();

module.exports = db;

