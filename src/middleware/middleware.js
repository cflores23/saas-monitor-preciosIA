// src/middleware/authMiddleware.js
function ensureAuthenticated(req, res, next) {
  console.log('Middleware check, user:', req.session.user);
  if (req.session.user) return next(); // Usuario autenticado

  // Detectar si es una petición AJAX/fetch
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }

  // Si es acceso directo a página, redirigir
  res.redirect('/login.html');
}

module.exports = { ensureAuthenticated };

  