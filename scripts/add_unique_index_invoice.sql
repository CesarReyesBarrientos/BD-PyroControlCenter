-- Script para agregar índice único a la columna Invoice en la tabla orders
-- Esto previene facturas duplicadas a nivel de base de datos

-- Verificar si ya existe el índice
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'orders' 
  AND COLUMN_NAME = 'Invoice'
  AND TABLE_SCHEMA = 'pyrocontrolcenter';

-- Si NO existe, agregar el índice único
-- IMPORTANTE: Primero verificar que no haya duplicados actuales
SELECT Invoice, COUNT(*) as cantidad
FROM orders
WHERE activo = 1
GROUP BY Invoice
HAVING COUNT(*) > 1;

-- Si la consulta anterior no devuelve resultados, ejecutar:
ALTER TABLE orders 
ADD UNIQUE INDEX idx_invoice_unique (Invoice);

-- Verificar que el índice fue creado
SHOW INDEX FROM orders WHERE Key_name = 'idx_invoice_unique';
