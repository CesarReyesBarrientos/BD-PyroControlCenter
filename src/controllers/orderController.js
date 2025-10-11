// src/controllers/orderController.js
const { pool } = require('../config/database');

// POST /api/orders - Crear una nueva orden
exports.createOrder = async (req, res, next) => {
  const { CustomerID, Invoice } = req.body;
  if (!CustomerID) {
    const error = new Error('CustomerID es un campo requerido.');
    error.statusCode = 400;
    return next(error);
  }
  try {
    const sql = 'INSERT INTO orders (CustomerID, Invoice) VALUES (?, ?)';
    const [result] = await pool.execute(sql, [CustomerID, Invoice]);
    res.status(201).json({ message: 'Orden creada exitosamente.', orderId: result.insertId });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id - Ver detalle de una orden y sus lotes
exports.getOrderDetails = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Obtener datos de la orden y del cliente
    const orderSql = 'SELECT o.*, c.CustomerName, c.Email FROM orders o JOIN customers c ON o.CustomerID = c.CustomerID WHERE o.OrderID = ?';
    const [orderDetails] = await pool.execute(orderSql, [id]);
    
    if (orderDetails.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada.' });
    }
    
    // Obtener los lotes asociados
    const lotesSql = 'SELECT * FROM lote WHERE OrderID = ?';
    const [lotes] = await pool.execute(lotesSql, [id]);

    const response = {
      ...orderDetails[0],
      lotes: lotes
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/status - Cambiar el estado de una orden
exports.updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { estado } = req.body;
  const validStatus = ['Nuevo', 'En proceso', 'Pagada', 'Enviando', 'Entregada', 'Finalizada'];

  if (!estado || !validStatus.includes(estado)) {
    const error = new Error(`El campo "estado" es requerido y debe ser uno de: ${validStatus.join(', ')}`);
    error.statusCode = 400;
    return next(error);
  }
  try {
    const sql = 'UPDATE orders SET estado = ? WHERE OrderID = ?';
    const [result] = await pool.execute(sql, [estado, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Orden no encontrada.' });
    }
    res.status(200).json({ message: `Estado de la orden actualizado a "${estado}".` });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/:orderId/lotes - Crear un nuevo lote para una orden
exports.createLoteForOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const { Quantity, Model, TEK, Shruds, Wrap, Color, Tail, LotNumber, Details } = req.body;

  if (!Quantity || !Model) {
    const error = new Error('"Quantity" y "Model" son campos requeridos.');
    error.statusCode = 400;
    return next(error);
  }
  try {
    const sql = 'INSERT INTO lote (OrderID, Quantity, Model, TEK, Shruds, Wrap, Color, Tail, LotNumber, Details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [orderId, Quantity, Model, TEK, Shruds, Wrap, Color, Tail, LotNumber, Details];
    const [result] = await pool.execute(sql, params);
    res.status(201).json({ message: 'Lote agregado a la orden.', loteId: result.insertId });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:orderId/lotes - Ver todos los lotes de una orden
exports.getLotesByOrderId = async (req, res, next) => {
    const { orderId } = req.params;
    try {
        const [lotes] = await pool.execute('SELECT * FROM lote WHERE OrderID = ?', [orderId]);
        res.status(200).json(lotes);
    } catch (error) {
        next(error);
    }
};

// GET /api/lotes/:id - Ver un lote por su ID
exports.getLoteById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const [lotes] = await pool.execute('SELECT * FROM lote WHERE LotID = ?', [id]);
        if(lotes.length === 0) {
            return res.status(404).json({ message: 'Lote no encontrado.' });
        }
        res.status(200).json(lotes[0]);
    } catch (error) {
        next(error);
    }
};