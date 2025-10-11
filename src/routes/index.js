// src/routes/index.js
const express = require('express');

// Importar controladores base
const { getHealthStatus, getRootStatus } = require('../controllers/healthController');
const { testDbConnection } = require('../controllers/dbController');

// Importar los nuevos enrutadores
const customerRoutes = require('./customerRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const orderRoutes = require('./orderRoutes');

const router = express.Router();

// Rutas de estado y prueba
router.get('/', getRootStatus);
router.get('/health', getHealthStatus);
router.get('/api/db-test', testDbConnection);

// Montar las rutas de los módulos en sus respectivos endpoints base
router.use('/api/customers', customerRoutes);
router.use('/api/inventory', inventoryRoutes);
router.use('/api/orders', orderRoutes);

// Dejamos la ruta individual para lotes aquí por si acaso
const orderController = require('../controllers/orderController');
router.get('/api/lotes/:id', orderController.getLoteById);

module.exports = router;