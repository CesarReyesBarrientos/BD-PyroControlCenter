// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler'); // <-- Asegúrate de que esta línea esté bien
const notFoundHandler = require('./middlewares/notFoundHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/', apiRoutes);

// El manejador 404 va después de las rutas
app.use(notFoundHandler);
// EL MANEJADOR DE ERRORES DEBE SER EL ÚLTIMO
app.use(errorHandler); // <-- Asegúrate de que esta línea sea la última

module.exports = app;