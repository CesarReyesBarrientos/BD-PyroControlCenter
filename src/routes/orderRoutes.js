// src/routes/orderRoutes.js
const express = require('express');
const orderController = require('../controllers/orderController');
const router = express.Router();

router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderDetails);
router.put('/:id/status', orderController.updateOrderStatus);

// Rutas anidadas para Lotes
router.post('/:orderId/lotes', orderController.createLoteForOrder);
router.get('/:orderId/lotes', orderController.getLotesByOrderId);

// Ruta para lotes individuales (si se necesita acceder por su propio ID)
router.get('/lotes/:id', orderController.getLoteById);


module.exports = router;