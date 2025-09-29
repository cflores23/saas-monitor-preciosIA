const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // ✅ importar modelo
require('dotenv').config();

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    console.log('>>> Google callback ejecutado <<<');
    console.log('Profile recibido:', profile);

    try {
        await User.createOrUpdate(profile); // ✅ guardar o actualizar en DB
        console.log('>>> Usuario creado/actualizado correctamente <<<');
        done(null, profile);
    } catch (err) {
        console.error('❌ Error al crear/actualizar usuario:', err);
        done(err, null);
    }
}));

module.exports = passport;
