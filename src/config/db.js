const mysql = require('mysql2');

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

console.log(`Conectando a DB en ${process.env.DB_HOST} con usuario ${process.env.DB_USER}`);

module.exports = db.promise();
