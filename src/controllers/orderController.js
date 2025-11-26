// src/controllers/orderController.js
const { pool } = require('../config/database');

// GET /api/orders - Obtener todas las órdenes con datos de clientes
exports.getAllOrders = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        o.OrderID,
        o.CustomerID,
        o.Product,
        o.Invoice,
        o.OrderDate,
        o.PaymentMethod,
        o.estado,
        c.CustomerName
      FROM orders o
      JOIN customers c ON o.CustomerID = c.CustomerID
      WHERE o.activo = 1
      ORDER BY o.OrderDate DESC
    `;
    const [orders] = await pool.execute(sql);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// POST /api/orders - Crear una nueva orden
exports.createOrder = async (req, res, next) => {
  const { CustomerID, Product, Invoice, OrderDate, PaymentMethod, estado } = req.body;
  
  console.log('📝 Datos recibidos:', { CustomerID, Product, Invoice, OrderDate, PaymentMethod, estado });
  
  if (!CustomerID || !Invoice) {
    return res.status(400).json({ 
      message: 'CustomerID e Invoice son campos requeridos.' 
    });
  }
  
  // Iniciar transacción
  let connection;
  
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // 1. Verificar si el producto tiene materiales asociados
    if (Product) {
      console.log(`🔍 Buscando materiales para producto: "${Product}"`);
      
      const [materials] = await connection.execute(
        `SELECT pm.material_id, pm.quantity_required, i.producto, i.stock, i.unidad_de_medida
         FROM product_materials pm
         JOIN inventario i ON pm.material_id = i.id
         WHERE pm.product_name = ? AND i.estado = 1`,
        [Product]
      );
      
      console.log(`📦 Materiales encontrados: ${materials.length}`);
      
      if (materials.length > 0) {
        // 2. Verificar si hay stock suficiente de todos los materiales
        const insufficientStock = [];
        for (const material of materials) {
          const stockActual = parseFloat(material.stock);
          const stockNecesario = parseFloat(material.quantity_required);
          
          console.log(`  - ${material.producto}: ${stockActual} ${material.unidad_de_medida} (necesita ${stockNecesario})`);
          
          if (stockActual < stockNecesario) {
            insufficientStock.push({
              nombre: material.producto,
              necesario: stockNecesario,
              disponible: stockActual,
              unidad: material.unidad_de_medida
            });
          }
        }
        
        if (insufficientStock.length > 0) {
          await connection.rollback();
          connection.release();
          
          console.log('❌ Stock insuficiente:', insufficientStock);
          return res.status(400).json({ 
            message: 'Stock insuficiente para crear la orden',
            details: insufficientStock.map(m => 
              `${m.nombre}: necesita ${m.necesario} ${m.unidad}, disponible ${m.disponible} ${m.unidad}`
            ).join('; ')
          });
        }
        
        // 3. Descontar materiales del inventario
        for (const material of materials) {
          await connection.execute(
            'UPDATE inventario SET stock = stock - ? WHERE id = ?',
            [material.quantity_required, material.material_id]
          );
          console.log(`✅ Descontado: ${material.quantity_required} ${material.unidad_de_medida} de ${material.producto}`);
        }
      } else {
        console.log(`⚠️ Producto "${Product}" no tiene materiales configurados en la BD`);
      }
    }
    
    // 4. Crear la orden
    const sql = 'INSERT INTO orders (CustomerID, Product, Invoice, OrderDate, PaymentMethod, estado) VALUES (?, ?, ?, ?, ?, ?)';
    const estadoValue = estado || 'Pendiente';
    console.log('🔍 Valores a insertar en orders:', [CustomerID, Product, Invoice, OrderDate, PaymentMethod, estadoValue]);
    const [result] = await connection.execute(sql, [CustomerID, Product, Invoice, OrderDate, PaymentMethod, estadoValue]);
    
    // Confirmar transacción
    await connection.commit();
    connection.release();
    
    console.log('✅ Orden creada con ID:', result.insertId);
    res.status(201).json({ 
      message: 'Orden creada exitosamente. Materiales descontados del inventario.', 
      orderId: result.insertId 
    });
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('❌ Error al crear orden:', error.message);
    console.error('📋 Stack:', error.stack);
    res.status(500).json({ 
      message: 'Error al crear la orden: ' + error.message,
      error: error.sqlMessage || error.message
    });
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

// PUT /api/orders/:id - Actualizar una orden completa
exports.updateOrder = async (req, res, next) => {
  const { id } = req.params;
  const { CustomerID, Product, Invoice, OrderDate, PaymentMethod, estado } = req.body;
  
  if (!CustomerID || !Invoice) {
    const error = new Error('CustomerID e Invoice son campos requeridos.');
    error.statusCode = 400;
    return next(error);
  }
  
  try {
    const sql = 'UPDATE orders SET CustomerID = ?, Product = ?, Invoice = ?, OrderDate = ?, PaymentMethod = ?, estado = ? WHERE OrderID = ?';
    const [result] = await pool.execute(sql, [CustomerID, Product, Invoice, OrderDate, PaymentMethod, estado, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Orden no encontrada.' });
    }
    
    res.status(200).json({ message: 'Orden actualizada exitosamente.' });
  } catch (error) {
    console.error('❌ Error al actualizar orden:', error);
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

// DELETE /api/orders/:id - Dar de baja una orden (baja lógica)
exports.deactivateOrder = async (req, res, next) => {
  const { id } = req.params;
  try {
    const sql = 'UPDATE orders SET activo = 0 WHERE OrderID = ?';
    const [result] = await pool.execute(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Orden no encontrada.' });
    }
    res.status(200).json({ message: 'Orden dada de baja correctamente.' });
  } catch (error) {
    next(error);
  }
};