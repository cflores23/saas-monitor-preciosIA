const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,       // tu Client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // tu Client Secret
    callbackURL: process.env.GOOGLE_CALLBACK_URL // URL de ngrok
}, (accessToken, refreshToken, profile, done) => {
    // Aquí puedes guardar el usuario en DB si quieres
    return done(null, profile);
}));

module.exports = passport;

