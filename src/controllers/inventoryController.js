// src/controllers/inventoryController.js
const { pool } = require('../config/database');

// GET /api/inventory - Ver todo el inventario activo
exports.getAllInventory = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM inventario WHERE estado = 1');
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// GET /api/inventory/:id - Ver un producto por ID
exports.getProductById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM inventario WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// POST /api/inventory - Agregar un nuevo producto
exports.createProduct = async (req, res, next) => {
  const { producto, stock, unidad_de_medida } = req.body;
  if (!producto || !unidad_de_medida) {
    const error = new Error('"producto" y "unidad_de_medida" son campos requeridos.');
    error.statusCode = 400;
    return next(error);
  }
  try {
    const sql = 'INSERT INTO inventario (producto, stock, unidad_de_medida) VALUES (?, ?, ?)';
    const [result] = await pool.execute(sql, [producto, stock || 0, unidad_de_medida]);
    res.status(201).json({ message: 'Producto agregado al inventario.', productId: result.insertId });
  } catch (error) {
    next(error);
  }
};

// PUT /api/inventory/:id/deactivate - "Dar de baja" un producto
exports.deactivateProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('UPDATE inventario SET estado = 0 WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    res.status(200).json({ message: 'Producto desactivado correctamente.' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/inventory/:id/stock - Actualizar (sumar) stock de un producto
exports.addStock = async (req, res, next) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
    const error = new Error('Se requiere una "quantity" numérica y positiva en el body.');
    error.statusCode = 400;
    return next(error);
  }
  try {
    const sql = 'UPDATE inventario SET stock = stock + ? WHERE id = ?';
    const [result] = await pool.execute(sql, [quantity, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    const [[updatedProduct]] = await pool.execute('SELECT id, producto, stock FROM inventario WHERE id = ?', [id]);
    res.status(200).json({ message: 'Stock actualizado.', product: updatedProduct });
  } catch (error) {
    next(error);
  }
};