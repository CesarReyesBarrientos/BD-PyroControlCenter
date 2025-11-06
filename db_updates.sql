-- Crear la tabla de proveedores
CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `rfc` varchar(13) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Modificar la tabla de inventario
ALTER TABLE `inventario` 
  ADD COLUMN `sku` int(11) NOT NULL AFTER `id`,
  ADD COLUMN `categoria` varchar(50) NOT NULL AFTER `producto`,
  ADD COLUMN `stock_minimo` decimal(10,3) DEFAULT 0 AFTER `stock`,
  ADD COLUMN `precio` decimal(10,2) DEFAULT 0 AFTER `unidad_de_medida`,
  ADD COLUMN `proveedor_id` int(11) DEFAULT NULL AFTER `precio`,
  ADD COLUMN `notas` text DEFAULT NULL AFTER `proveedor_id`,
  CHANGE COLUMN `stock` `stock_actual` decimal(10,3) DEFAULT 0,
  ADD CONSTRAINT `fk_inventario_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `suppliers` (`id`);

-- Renombrar columna producto a nombre para consistencia
ALTER TABLE `inventario` 
  CHANGE COLUMN `producto` `nombre` varchar(100) NOT NULL;