const db = require('../config/db');

class Product {
  static async create(userId, name, url, description = '') {
    const [result] = await db.query(
      `INSERT INTO products (user_id, name, url, description) VALUES (?, ?, ?, ?)`,
      [userId, name, url, description]
    );
    return result.insertId;
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
