// src/middleware/authMiddleware.js
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
      return next(); // Usuario autenticado, continúa
    }
    // No autenticado: redirige al login
    res.redirect('/login.html');
  }
  
  module.exports = { ensureAuthenticated };
  