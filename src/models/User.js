// src/models/User.js
const db = require('../config/db.js');

const User = {
  async findByGoogleId(googleId) {
    const [rows] = await db.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
    return rows[0];
  },

  async createOrUpdate(profile) {
    const user = await this.findByGoogleId(profile.id);
    if (!user) {
      await db.query(
        `INSERT INTO users (google_id, display_name, email, photo)
         VALUES (?, ?, ?, ?)`,
        [profile.id, profile.displayName, profile.emails[0].value, profile.photos[0]?.value || null]
      );
    } else {
      await db.query(
        `UPDATE users
         SET display_name = ?, email = ?, photo = ?
         WHERE google_id = ?`,
        [profile.displayName, profile.emails[0].value, profile.photos[0]?.value || null, profile.id]
      );
    }
  }
};

module.exports = User;
