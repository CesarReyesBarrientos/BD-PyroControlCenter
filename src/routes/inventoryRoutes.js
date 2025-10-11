// src/routes/inventoryRoutes.js
const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const router = express.Router();

router.get('/', inventoryController.getAllInventory);
router.post('/', inventoryController.createProduct);
router.get('/:id', inventoryController.getProductById);
router.put('/:id/deactivate', inventoryController.deactivateProduct);
router.put('/:id/stock', inventoryController.addStock);

module.exports = router;