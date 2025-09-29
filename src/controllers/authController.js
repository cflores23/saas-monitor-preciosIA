// src/controllers/authController.js
exports.dashboard = (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/');
    res.send(`Hola ${req.user.displayName}, bienvenido al dashboard`);
  };
  
  exports.logout = (req, res) => {
    req.logout(() => res.redirect('/'));
  };
  