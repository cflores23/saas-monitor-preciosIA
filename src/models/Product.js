const db = require('../config/db');

class Product {
    static async create(userId, name, url, description) {
        try {
          console.log('[Product.create] Datos a insertar:', { userId, name, url, description });
    
          const [result] = await db.query(
            `INSERT INTO products (user_id, name, url, description) VALUES (?, ?, ?, ?)`,
            [userId, name, url, description]
          );
    
          console.log('[Product.create] Resultado MySQL:', result);
    
          return result.insertId;
        } catch (err) {
          console.error('[Product.create] Error al insertar:', err.message);
          throw err; // para que la ruta también reciba el error
        }
      }

  static async getAllByUser(userId) {
    const [rows] = await db.query(
      `SELECT * FROM products WHERE user_id = ?`,
      [userId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM products WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async deleteById(id) {
    const [result] = await db.query(
      `DELETE FROM products WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Product;
