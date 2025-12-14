// src/controllers/customerController.js
const { pool } = require('../config/database');

// POST /api/customers - Crear un nuevo cliente
exports.createCustomer = async (req, res, next) => {
  console.log('\n--- [DEBUG] Iniciando createCustomer ---');
  // Extraemos solo los campos que REALMENTE existen en tu base de datos
  const { CustomerName, PhoneNumber, Email, Address, estado } = req.body;

  if (!CustomerName || !Email) {
    const error = new Error('CustomerName y Email son campos requeridos.');
    error.statusCode = 400;
    return next(error);
  }

  try {
    // SQL ajustado a las columnas reales: CustomerName, PhoneNumber, Email, Address, estado
    const sql = 'INSERT INTO customers (CustomerName, PhoneNumber, Email, Address, estado) VALUES (?, ?, ?, ?, ?)';
    
    const estadoValue = estado !== undefined ? estado : 1; // Por defecto activo (1)
    
    const [result] = await pool.execute(sql, [CustomerName, PhoneNumber, Email, Address, estadoValue]);
    
    res.status(201).json({ message: 'Cliente creado exitosamente.', customerId: result.insertId });
  } catch (error) {
    console.error('Error SQL en createCustomer:', error.message); // Log para ver error exacto si falla
    next(error);
  }
};

// GET /api/customers - Obtener todos los clientes activos
exports.getAllCustomers = async (req, res, next) => {
  try {
    // SQL ajustado: Eliminadas referencias a CountryCode, State, PostalCode, CountryName
    const sql = `
      SELECT 
        CustomerID,
        CustomerName,
        PhoneNumber,
        Email,
        Address,
        estado
      FROM customers 
      WHERE estado = 1
      ORDER BY CustomerID DESC
    `;
    const [rows] = await pool.execute(sql);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// GET /api/customers/:id/orders - Obtener todas las órdenes de un cliente
exports.getCustomerOrders = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Este estaba bien, pero agregamos validación extra por si acaso
    const sql = 'SELECT * FROM orders WHERE CustomerID = ?';
    const [orders] = await pool.execute(sql, [id]);
    
    // Opcional: Verificar si el cliente existe antes de buscar órdenes (para ser más estrictos),
    // pero para este test, validar si hay órdenes es suficiente.
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No se encontraron órdenes para este cliente.' });
    }
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// PUT /api/customers/:id - Actualizar un cliente
exports.updateCustomer = async (req, res, next) => {
  const { id } = req.params;
  // Extraemos solo lo que existe en BD
  const { CustomerName, PhoneNumber, Email, Address } = req.body;
  
  try {
    // SQL ajustado: Eliminados campos extra
    const sql = `
      UPDATE customers 
      SET CustomerName = ?, PhoneNumber = ?, Email = ?, Address = ?
      WHERE CustomerID = ?
    `;
    const [result] = await pool.execute(sql, [
      CustomerName, PhoneNumber, Email, Address, id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    
    res.status(200).json({ message: 'Cliente actualizado correctamente.' });
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