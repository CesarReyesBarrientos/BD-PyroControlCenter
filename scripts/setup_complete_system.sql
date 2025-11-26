-- ========================================
-- SCRIPT COMPLETO PARA SISTEMA PYROCONTROL
-- ========================================

-- 1. CREAR TABLA DE RELACIÓN PRODUCTO-MATERIALES
CREATE TABLE IF NOT EXISTS product_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name ENUM('PYROBLAST', 'J-Tek', 'Línea') NOT NULL,
  material_id BIGINT UNSIGNED NOT NULL,
  quantity_required DECIMAL(10,3) NOT NULL COMMENT 'Cantidad de material necesaria por unidad de producto',
  FOREIGN KEY (material_id) REFERENCES inventario(id),
  UNIQUE KEY unique_product_material (product_name, material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- 2. INSERTAR PROVEEDORES
-- ========================================
INSERT INTO suppliers (nombre, telefono, email, direccion, rfc, estado) VALUES
('Explosivos Industriales SA', '4491234567', 'ventas@expindustriales.com', 'Av. Industrial 123, Aguascalientes', 'EIN850101ABC', 1),
('Química Pirotécnica del Centro', '4497654321', 'contacto@quimicapiro.com', 'Carretera a San Luis km 15, Aguascalientes', 'QPC920305XYZ', 1),
('Tubos y Empaques del Bajío', '4493332211', 'ventas@tubosbajio.com', 'Zona Industrial Norte, Aguascalientes', 'TEB880715MNO', 1),
('Distribuidora de Mechas y Fusibles', '4495556789', 'info@mechasfusibles.com', 'Col. Centro, Aguascalientes', 'DMF910420PQR', 1);

-- ========================================
-- 3. INSERTAR MATERIALES EN INVENTARIO
-- ========================================

-- Materiales básicos para pirotecnia
INSERT INTO inventario (sku, producto, categoria, stock, minstock, unidad_de_medida, precio, proveedor_id, notas, estado) VALUES
-- Pólvoras y compuestos químicos
(1001, 'Pólvora negra grano fino', 'Químicos', 500.000, 100.000, 'kg', 450.00, 55, 'Pólvora de grano fino para efectos rápidos', 1),
(1002, 'Pólvora negra grano grueso', 'Químicos', 800.000, 150.000, 'kg', 420.00, 55, 'Pólvora de grano grueso para propulsión', 1),
(1003, 'Perclorato de potasio', 'Químicos', 300.000, 80.000, 'kg', 380.00, 56, 'Oxidante para mezclas pirotécnicas', 1),
(1004, 'Nitrato de estroncio', 'Químicos', 200.000, 50.000, 'kg', 520.00, 56, 'Para efectos de color rojo', 1),
(1005, 'Clorato de bario', 'Químicos', 150.000, 40.000, 'kg', 480.00, 56, 'Para efectos de color verde', 1),
(1006, 'Aluminio en polvo', 'Químicos', 250.000, 60.000, 'kg', 350.00, 56, 'Para efectos de chispas plateadas', 1),

-- Tubos y contenedores
(2001, 'Tubo de cartón 1" x 6"', 'Contenedores', 5000.000, 1000.000, 'pza', 8.50, 57, 'Tubo de cartón comprimido 1 pulgada diámetro', 1),
(2002, 'Tubo de cartón 2" x 8"', 'Contenedores', 3000.000, 800.000, 'pza', 15.00, 57, 'Tubo de cartón comprimido 2 pulgadas diámetro', 1),
(2003, 'Tubo de cartón 3" x 12"', 'Contenedores', 2000.000, 500.000, 'pza', 28.00, 57, 'Tubo de cartón comprimido 3 pulgadas diámetro', 1),
(2004, 'Tapas de arcilla 1"', 'Contenedores', 10000.000, 2000.000, 'pza', 1.20, 57, 'Tapas de arcilla para sellar tubos', 1),
(2005, 'Tapas de arcilla 2"', 'Contenedores', 8000.000, 1500.000, 'pza', 2.00, 57, 'Tapas de arcilla para sellar tubos', 1),
(2006, 'Tapas de arcilla 3"', 'Contenedores', 5000.000, 1000.000, 'pza', 3.50, 57, 'Tapas de arcilla para sellar tubos', 1),

-- Mechas y fusibles
(3001, 'Mecha de seguridad verde', 'Fusibles', 10000.000, 2000.000, 'metros', 12.00, 58, 'Mecha de seguridad velocidad estándar', 1),
(3002, 'Mecha rápida (quick match)', 'Fusibles', 5000.000, 1000.000, 'metros', 25.00, 58, 'Mecha de combustión rápida', 1),
(3003, 'Fusible eléctrico', 'Fusibles', 2000.000, 400.000, 'pza', 35.00, 58, 'Fusible de ignición eléctrica', 1),

-- Materiales de ensamble
(4001, 'Pegamento para pirotecnia', 'Materiales', 500.000, 100.000, 'litros', 180.00, 57, 'Adhesivo especial resistente al calor', 1),
(4002, 'Cinta adhesiva reforzada', 'Materiales', 1000.000, 200.000, 'rollos', 45.00, 57, 'Cinta de alta resistencia', 1),
(4003, 'Papel kraft para envolver', 'Materiales', 800.000, 150.000, 'kg', 35.00, 57, 'Papel para protección de productos', 1),
(4004, 'Etiquetas de seguridad', 'Materiales', 5000.000, 1000.000, 'pza', 2.50, 57, 'Etiquetas con advertencias y especificaciones', 1);

-- ========================================
-- 4. DEFINIR RECETAS DE PRODUCTOS
-- ========================================

-- PYROBLAST (Producto grande, efectos múltiples)
-- Requiere tubos grandes, más pólvora y efectos elaborados
INSERT INTO product_materials (product_name, material_id, quantity_required) VALUES
('PYROBLAST', (SELECT id FROM inventario WHERE sku = 2003), 1.000),    -- 1 Tubo 3"x12"
('PYROBLAST', (SELECT id FROM inventario WHERE sku = 2006), 2.000),    -- 2 Tapas 3"
('PYROBLAST', (SELECT id FROM inventario WHERE sku = 1001), 0.500),    -- 500g Pólvora fina
('PYROBLAST', (SELECT id FROM inventario WHERE sku = 1002), 0.800),    -- 800g Pólvora gruesa
('PYROBLAST', (SELECT id FROM inventario WHERE sku = 1003), 0.300),    -- 300g Perclorato
('PYROBLAST', (SELECT id FROM inventario WHERE sku = 1004), 0.150),    -- 150g Nitrato estroncio
('PYROBLAST', (SELECT id FROM inventario WHERE sku = 1005), 0.150),    -- 150g Clorato bario
('PYROBLAST', (SELECT id FROM inventario WHERE sku = 1006), 0.200),    -- 200g Aluminio
('PYROBLAST', (SELECT id FROM inventario WHERE sku = 3001), 2.000),    -- 2m Mecha seguridad
('PYROBLAST', (SELECT id FROM inventario WHERE sku = 4001), 0.100),    -- 100ml Pegamento
('PYROBLAST', (SELECT id FROM inventario WHERE sku = 4004), 2.000);    -- 2 Etiquetas

-- J-Tek (Producto mediano, efectos técnicos)
INSERT INTO product_materials (product_name, material_id, quantity_required) VALUES
('J-Tek', (SELECT id FROM inventario WHERE sku = 2002), 1.000),        -- 1 Tubo 2"x8"
('J-Tek', (SELECT id FROM inventario WHERE sku = 2005), 2.000),        -- 2 Tapas 2"
('J-Tek', (SELECT id FROM inventario WHERE sku = 1001), 0.300),        -- 300g Pólvora fina
('J-Tek', (SELECT id FROM inventario WHERE sku = 1002), 0.400),        -- 400g Pólvora gruesa
('J-Tek', (SELECT id FROM inventario WHERE sku = 1003), 0.200),        -- 200g Perclorato
('J-Tek', (SELECT id FROM inventario WHERE sku = 1006), 0.150),        -- 150g Aluminio
('J-Tek', (SELECT id FROM inventario WHERE sku = 3001), 1.500),        -- 1.5m Mecha seguridad
('J-Tek', (SELECT id FROM inventario WHERE sku = 3002), 0.500),        -- 0.5m Mecha rápida
('J-Tek', (SELECT id FROM inventario WHERE sku = 4001), 0.050),        -- 50ml Pegamento
('J-Tek', (SELECT id FROM inventario WHERE sku = 4004), 1.000);        -- 1 Etiqueta

-- Línea (Producto básico, efectos en secuencia)
INSERT INTO product_materials (product_name, material_id, quantity_required) VALUES
('Línea', (SELECT id FROM inventario WHERE sku = 2001), 1.000),        -- 1 Tubo 1"x6"
('Línea', (SELECT id FROM inventario WHERE sku = 2004), 2.000),        -- 2 Tapas 1"
('Línea', (SELECT id FROM inventario WHERE sku = 1001), 0.150),        -- 150g Pólvora fina
('Línea', (SELECT id FROM inventario WHERE sku = 1002), 0.200),        -- 200g Pólvora gruesa
('Línea', (SELECT id FROM inventario WHERE sku = 1006), 0.080),        -- 80g Aluminio
('Línea', (SELECT id FROM inventario WHERE sku = 3001), 1.000),        -- 1m Mecha seguridad
('Línea', (SELECT id FROM inventario WHERE sku = 3002), 1.500),        -- 1.5m Mecha rápida
('Línea', (SELECT id FROM inventario WHERE sku = 4002), 0.020),        -- 20cm Cinta adhesiva
('Línea', (SELECT id FROM inventario WHERE sku = 4004), 1.000);        -- 1 Etiqueta

-- ========================================
-- 5. INSERTAR CLIENTES DE EJEMPLO
-- ========================================
INSERT INTO customers (CustomerName, PhoneNumber, CountryCode, CountryName, Email, Address, State, PostalCode, estado) VALUES
('Piromex Internacional', '3339876543', '52', 'México', 'contacto@piromex.com', 'Blvd. Revolución 789', 'Guadalajara', '44100', 1),
('Eventos Especiales del Norte', '8181234567', '52', 'México', 'ventas@eventosnorte.com', 'Av. Constitución 456', 'Monterrey', '64000', 1),
('Fiestas y Pirotecnia SA', '5555432109', '52', 'México', 'info@fiestaspiro.com', 'Calle Hidalgo 123', 'Ciudad de México', '03100', 1),
('Distribuidora Aguascalientes', '4491122334', '52', 'México', 'compras@distags.com', 'Av. Universidad 321', 'Aguascalientes', '20100', 1),
('Espectáculos Luminosos', '3338765432', '52', 'México', 'admin@espectaculos.com', 'Av. Patria 999', 'Zapopan', '45030', 1);

-- ========================================
-- NOTAS DE USO
-- ========================================
-- Este script crea:
-- 1. Tabla product_materials para relacionar productos con materiales
-- 2. 4 proveedores especializados
-- 3. 20 materiales diferentes organizados por categorías:
--    - Químicos (6 tipos)
--    - Contenedores (6 tipos)
--    - Fusibles (3 tipos)
--    - Materiales de ensamble (5 tipos)
-- 4. Recetas para cada producto:
--    - PYROBLAST: 11 materiales (producto grande)
--    - J-Tek: 10 materiales (producto mediano)
--    - Línea: 9 materiales (producto básico)
-- 5. 5 clientes de ejemplo

-- Para verificar las recetas:
-- SELECT pm.product_name, i.producto, pm.quantity_required, i.unidad_de_medida
-- FROM product_materials pm
-- JOIN inventario i ON pm.material_id = i.id
-- ORDER BY pm.product_name, i.producto;
