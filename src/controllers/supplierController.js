const { pool } = require('../config/database');

const getSuppliers = async (req, res) => {
  try {
    const [suppliers] = await pool.query('SELECT * FROM suppliers WHERE estado = 1');
    res.json(suppliers);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { nombre, telefono, email, direccion, rfc } = req.body;
    const [result] = await pool.query(
      'INSERT INTO suppliers (nombre, telefono, email, direccion, rfc, estado) VALUES (?, ?, ?, ?, ?, 1)',
      [nombre, telefono, email, direccion, rfc]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email, direccion, rfc } = req.body;
    await pool.query(
      'UPDATE suppliers SET nombre = ?, telefono = ?, email = ?, direccion = ?, rfc = ? WHERE id = ?',
      [nombre, telefono, email, direccion, rfc, id]
    );
    res.json({ message: 'Proveedor actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE suppliers SET estado = 0 WHERE id = ?', [id]);
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
};