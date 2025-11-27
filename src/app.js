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

// 2. Luego Helmet, pero desactiva la política que bloquea recursos cruzados
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler)

module.exports = app;