-- Script para corregir la columna Invoice en la tabla orders
-- Problema: varchar(5) es muy corto para el formato FAC-2024-0001
-- Solución: Ampliar a varchar(20) y agregar índice único

USE pyrocontrolcenter;

-- 1. Ampliar la columna Invoice de varchar(5) a varchar(20)
ALTER TABLE orders 
MODIFY COLUMN Invoice varchar(20) DEFAULT NULL;

-- 2. Verificar el cambio
DESCRIBE orders;

-- 3. Agregar índice único para evitar duplicados (OPCIONAL - si no hay duplicados actuales)
-- Primero verificar si hay duplicados:
SELECT Invoice, COUNT(*) as cantidad
FROM orders
WHERE activo = 1 AND Invoice IS NOT NULL
GROUP BY Invoice
HAVING COUNT(*) > 1;

-- Si la consulta anterior NO devuelve resultados, ejecutar:
ALTER TABLE orders 
ADD UNIQUE INDEX idx_invoice_unique (Invoice);

-- Verificar que el índice fue creado
SHOW INDEX FROM orders WHERE Key_name = 'idx_invoice_unique';

-- RESULTADO ESPERADO:
-- Invoice ahora acepta hasta 20 caracteres
-- Formato FAC-2024-0001 (14 caracteres) funciona perfectamente
