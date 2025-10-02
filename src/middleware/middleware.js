// src/middleware/authMiddleware.js
function ensureAuthenticated(req, res, next) {
  console.log("➡️ ensureAuthenticated");
  console.log("   req.session:", req.session);
  console.log("   req.session.user:", req.session.user);
  console.log("   req.user:", req.user);

  if (req.session.user) return next(); // Usuario autenticado

  // Detectar si es una petición AJAX/fetch
  if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }

  console.log("❌ Usuario no autenticado, redirigiendo a /login.html");
  res.redirect('/login.html');
}


module.exports = { ensureAuthenticated };

  