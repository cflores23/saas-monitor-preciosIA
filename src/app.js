require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const exampleRoutes = require('./routes/exampleRoutes');
const dbTestRoutes = require('./routes/dbTest');
const scraperRoutes = require('./routes/scraperRoutes');
const allowedSitesRoutes = require('./routes/allowedSitesRoutes');
const cron = require('node-cron');
const { scrapeAllUsers } = require('./scraper/multiScraper');
const multiScraper = require('./src/scraper/multiScraper');




const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir frontend

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use('/auth', authRoutes);
app.use('/api/example', exampleRoutes);
app.use('/api', dbTestRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/allowed-sites', allowedSitesRoutes);
const productRoutes = require('./routes/productRoutes');
app.use('/products', productRoutes);



// 🕑 Ejecutar el scraper todos los días a medianoche (00:00)
cron.schedule('0 3 * * *', async () => {
  console.log('⏳ Ejecutando scraper automático (cada 24h, medianoche)...');
  try {
    await scrapeAllUsers();
    console.log('✅ Scraper automático completado');
  } catch (err) {
    console.error('❌ Error en scraper automático:', err.message);
  }
});

module.exports = app;
