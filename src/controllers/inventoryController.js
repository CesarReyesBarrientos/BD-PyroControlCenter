const { pool } = require('../config/database');

const getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                i.*,
                COALESCE(s.nombre, 'N/A') as proveedor_nombre
            FROM inventario i
            LEFT JOIN suppliers s ON i.proveedor_id = s.id
            WHERE i.estado = 1
            ORDER BY i.id
        `);

        // Transformar los nombres de campos para el frontend
        const products = rows.map(row => ({
            id: row.id,
            nombre: row.producto,
            categoria: row.categoria,
            stock_actual: row.stock,
            stock_minimo: row.minstock,
            unidad_de_medida: row.unidad_de_medida,
            precio: row.precio,
            proveedor_id: row.proveedor_id,
            proveedor_nombre: row.proveedor_nombre,
            notas: row.notas,
            estado: row.estado
        }));

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const getProductById = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                i.*,
                COALESCE(s.nombre, 'N/A') as proveedor_nombre
            FROM inventario i
            LEFT JOIN suppliers s ON i.proveedor_id = s.id
            WHERE i.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const product = {
            id: rows[0].id,
            nombre: rows[0].producto,
            categoria: rows[0].categoria,
            stock_actual: rows[0].stock,
            stock_minimo: rows[0].minstock,
            unidad_de_medida: rows[0].unidad_de_medida,
            precio: rows[0].precio,
            proveedor_id: rows[0].proveedor_id,
            proveedor_nombre: rows[0].proveedor_nombre,
            notas: rows[0].notas,
            estado: rows[0].estado
        };

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const createProduct = async (req, res) => {
    try {
        console.log('Datos recibidos en createProduct:', req.body);
        
        const {
            nombre,            // Se usará como 'producto' en la BD
            categoria,
            stock_actual,      // Se usará como 'stock' en la BD
            stock_minimo,      // Se usará como 'minstock' en la BD
            unidad_de_medida,
            precio,
            proveedor_id = null,
            notas = null
        } = req.body;

        const [result] = await pool.query(
            'INSERT INTO inventario (producto, stock, minstock, precio, unidad_de_medida, categoria, estado, proveedor_id, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, stock_actual, stock_minimo, precio, unidad_de_medida, categoria, 1, proveedor_id, notas]
        );

        res.status(201).json({
            id: result.insertId,
            nombre,
            categoria,
            stock_actual,
            stock_minimo,
            unidad_de_medida,
            precio,
            proveedor_id,
            notas,
            estado: 1
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const {
            nombre,
            categoria,
            stock_actual,
            stock_minimo,
            unidad_de_medida,
            precio,
            proveedor_id,
            notas,
            estado = 1
        } = req.body;

        const [result] = await pool.query(
            'UPDATE inventario SET producto = ?, stock = ?, minstock = ?, precio = ?, unidad_de_medida = ?, categoria = ?, estado = ?, proveedor_id = ?, notas = ? WHERE id = ?',
            [nombre, stock_actual, stock_minimo, precio, unidad_de_medida, categoria, estado, proveedor_id, notas, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM inventario WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const searchProducts = async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        
        if (!searchTerm.trim()) {
            return res.status(400).json({ message: 'Término de búsqueda requerido' });
        }

        const searchPattern = `%${searchTerm}%`;
        
        // Query con búsqueda insensible a acentos usando COLLATE
        const [rows] = await pool.query(`
            SELECT 
                i.*,
                COALESCE(s.nombre, 'N/A') as proveedor_nombre
            FROM inventario i
            LEFT JOIN suppliers s ON i.proveedor_id = s.id
            WHERE i.estado = 1
            AND (
                i.producto COLLATE utf8mb4_general_ci LIKE ? 
                OR CONCAT('PROD-', LPAD(i.id, 3, '0')) LIKE ?
                OR i.categoria COLLATE utf8mb4_general_ci LIKE ?
                OR s.nombre COLLATE utf8mb4_general_ci LIKE ?
                OR COALESCE(i.notas, '') COLLATE utf8mb4_general_ci LIKE ?
            )
            ORDER BY i.producto ASC
        `, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]);

        // Transformar los nombres de campos para el frontend
        const products = rows.map(row => ({
            id: row.id,
            nombre: row.producto,
            categoria: row.categoria,
            stock_actual: row.stock,
            stock_minimo: row.minstock,
            unidad_de_medida: row.unidad_de_medida,
            precio: row.precio,
            proveedor_id: row.proveedor_id,
            proveedor_nombre: row.proveedor_nombre,
            notas: row.notas,
            estado: row.estado
        }));

        console.log(`🔍 Búsqueda: "${searchTerm}" - ${products.length} resultados encontrados`);

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT categoria 
            FROM inventario 
            WHERE estado = 1 AND categoria IS NOT NULL
            ORDER BY categoria ASC
        `);
        
        const categories = rows.map(row => row.categoria);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const getUnits = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT unidad_de_medida 
            FROM inventario 
            WHERE estado = 1 AND unidad_de_medida IS NOT NULL
            ORDER BY unidad_de_medida ASC
        `);
        
        const units = rows.map(row => row.unidad_de_medida);
        res.json(units);
    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getCategories,
    getUnits
};