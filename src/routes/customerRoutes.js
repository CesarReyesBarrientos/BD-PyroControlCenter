// src/routes/customerRoutes.js
const express = require('express');
const customerController = require('../controllers/customerController');
const router = express.Router();

router.post('/', customerController.createCustomer);
router.get('/', customerController.getAllCustomers);
router.get('/:id/orders', customerController.getCustomerOrders);
router.put('/:id/deactivate', customerController.deactivateCustomer);

module.exports = router;