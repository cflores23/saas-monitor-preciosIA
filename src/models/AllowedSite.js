// src/models/AllowedSite.js
const db = require('../config/db');

const AllowedSite = {
  // Buscar dominio permitido por su nombre
  async findByDomain(domain) {
    const [rows] = await db.query(
      'SELECT * FROM allowed_sites WHERE domain = ? LIMIT 1',
      [domain]
    );
    return rows[0] || null;
  },

  // Crear un nuevo dominio permitido
  async create(domain, description = null) {
    const [result] = await db.query(
      'INSERT INTO allowed_sites (domain, description) VALUES (?, ?)',
      [domain, description]
    );
    return result.insertId;
  },

  // Listar todos los dominios permitidos
  async getAll() {
    const [rows] = await db.query('SELECT * FROM allowed_sites ORDER BY created_at DESC');
    return rows;
  },

  // Eliminar un dominio permitido por ID
  async deleteById(id) {
    const [result] = await db.query('DELETE FROM allowed_sites WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = AllowedSite;
