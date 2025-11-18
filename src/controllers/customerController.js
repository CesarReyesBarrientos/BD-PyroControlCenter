// src/controllers/customerController.js
const { pool } = require('../config/database');

// POST /api/customers - Crear un nuevo cliente
exports.createCustomer = async (req, res, next) => {
    console.log('\n--- [DEBUG] Iniciando createCustomer ---');
    console.log('[DEBUG] Contenido de req.body:', req.body);

  const { CustomerName, PhoneNumber, Email, Address, CountryCode, City, State, PostalCode, estado } = req.body;

    console.log(`[DEBUG] Valor de CustomerName: ${CustomerName}`);
    console.log(`[DEBUG] Valor de Email: ${Email}`);

  if (!CustomerName || !Email) {
    console.log('>>> [DEBUG] CONDICIÓN DE ERROR CUMPLIDA. Enviando error 400.');
    const error = new Error('CustomerName y Email son campos requeridos.');
    error.statusCode = 400;
    return next(error);
  }

  try {
    const sql = 'INSERT INTO customers (CustomerName, PhoneNumber, Email, Address, CountryCode, City, State, PostalCode, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const estadoValue = estado !== undefined ? estado : 1; // Por defecto activo
    const [result] = await pool.execute(sql, [CustomerName, PhoneNumber, Email, Address, CountryCode, City, State, PostalCode, estadoValue]);
    res.status(201).json({ message: 'Cliente creado exitosamente.', customerId: result.insertId });
  } catch (error) {
    next(error);
  }
};

// GET /api/customers - Obtener todos los clientes activos
exports.getAllCustomers = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM customers WHERE estado = 1');
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// GET /api/customers/:id/orders - Obtener todas las órdenes de un cliente
exports.getCustomerOrders = async (req, res, next) => {
  const { id } = req.params;
  try {
    const sql = 'SELECT * FROM orders WHERE CustomerID = ?';
    const [orders] = await pool.execute(sql, [id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No se encontraron órdenes para este cliente o el cliente no existe.' });
    }
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// PUT /api/customers/:id/deactivate - "Dar de baja" un cliente
exports.deactivateCustomer = async (req, res, next) => {
  const { id } = req.params;
  try {
    const sql = 'UPDATE customers SET estado = 0 WHERE CustomerID = ?';
    const [result] = await pool.execute(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    res.status(200).json({ message: 'Cliente desactivado correctamente.' });
  } catch (error) {
    next(error);
  }
};