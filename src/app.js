// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:4200', 
    'https://cesarreyesbarrientos.github.io'
  ],
  credentials: true // Importante si en el futuro manejas cookies o headers de auth
}));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Permite conexiones a tu propio backend, a Auth0 y a localhost (para desarrollo)
        connectSrc: [
          "'self'", 
          "https://bd-pyrocontrolcenter.onrender.com",
          "https://dev-1kquk0aiaxxh1wly.us.auth0.com", 
          "http://localhost:4200",
          "ws://localhost:4200" // Para el hot-reload de Angular
        ],
        // Permite scripts de Auth0 si los necesitas
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.auth0.com"], 
        // Permite imágenes de Auth0 (avatares)
        imgSrc: ["'self'", "data:", "https://*.gravatar.com", "https://*.wp.com"] 
      },
    },
    crossOriginResourcePolicy: false, // Mantén esto como te dije antes
  })
);
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler)

module.exports = app;