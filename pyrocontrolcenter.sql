-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-11-2025 a las 20:09:19
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pyrocontrolcenter`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `customers`
--

CREATE TABLE `customers` (
  `CustomerID` int(11) NOT NULL,
  `CustomerName` varchar(255) DEFAULT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `CountryCode` char(2) NOT NULL,
  `CountryName` varchar(100) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `State` varchar(100) DEFAULT NULL,
  `PostalCode` varchar(10) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `customers`
--

INSERT INTO `customers` (`CustomerID`, `CustomerName`, `PhoneNumber`, `CountryCode`, `CountryName`, `Email`, `Address`, `State`, `PostalCode`, `estado`) VALUES
(55, 'Piromex Internacional', '3339876543', '52', 'México', 'contacto@piromex.com', 'Blvd. Revolución 789', 'Guadalajara', '44100', 1),
(56, 'Eventos Especiales del Norte', '8181234567', '52', 'México', 'ventas@eventosnorte.com', 'Av. Constitución 456', 'Monterrey', '64000', 1),
(57, 'Fiestas y Pirotecnia SA', '5555432109', '52', 'México', 'info@fiestaspiro.com', 'Calle Hidalgo 123', 'Ciudad de México', '03100', 1),
(58, 'Distribuidora Aguascalientes', '4491122334', '52', 'México', 'compras@distags.com', 'Av. Universidad 321', 'Aguascalientes', '20100', 1),
(59, 'Espectáculos Luminosos', '3338765432', '52', 'México', 'admin@espectaculos.com', 'Av. Patria 999', 'Zapopan', '45030', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sku` int(11) NOT NULL,
  `producto` varchar(100) DEFAULT NULL,
  `categoria` varchar(50) NOT NULL DEFAULT 'Sin asignar',
  `stock` decimal(10,3) DEFAULT 0.000,
  `minstock` decimal(10,3) DEFAULT 0.000,
  `unidad_de_medida` varchar(10) NOT NULL,
  `precio` decimal(10,2) DEFAULT 0.00,
  `proveedor_id` int(11) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id`, `sku`, `producto`, `categoria`, `stock`, `minstock`, `unidad_de_medida`, `precio`, `proveedor_id`, `notas`, `estado`) VALUES
(130, 1001, 'Pólvora negra grano fino', 'Químicos', 499.250, 100.000, 'kg', 450.00, 55, 'Pólvora de grano fino para efectos rápidos', 1),
(131, 1002, 'Pólvora negra grano grueso', 'Químicos', 99.000, 150.000, 'kg', 420.00, 55, 'Pólvora de grano grueso para propulsión', 1),
(132, 1003, 'Perclorato de potasio', 'Químicos', 78.600, 80.000, 'kg', 380.00, 56, 'Oxidante para mezclas pirotécnicas', 1),
(133, 1004, 'Nitrato de estroncio', 'Químicos', 199.850, 50.000, 'kg', 520.00, 56, 'Para efectos de color rojo', 1),
(134, 1005, 'Clorato de bario', 'Químicos', 149.850, 40.000, 'kg', 480.00, 56, 'Para efectos de color verde', 1),
(135, 1006, 'Aluminio en polvo', 'Químicos', 249.420, 60.000, 'kg', 350.00, 56, 'Para efectos de chispas plateadas', 1),
(136, 2001, 'Tubo de cartón 1\" x 6\"', 'Contenedores', 4999.000, 1000.000, 'pza', 8.50, 57, 'Tubo de cartón comprimido 1 pulgada diámetro', 1),
(137, 2002, 'Tubo de cartón 2\" x 8\"', 'Contenedores', 2998.000, 800.000, 'pza', 15.00, 57, 'Tubo de cartón comprimido 2 pulgadas diámetro', 1),
(138, 2003, 'Tubo de cartón 3\" x 12\"', 'Contenedores', 1999.000, 500.000, 'pza', 28.00, 57, 'Tubo de cartón comprimido 3 pulgadas diámetro', 1),
(139, 2004, 'Tapas de arcilla 1\"', 'Contenedores', 9998.000, 2000.000, 'pza', 1.20, 57, 'Tapas de arcilla para sellar tubos', 1),
(140, 2005, 'Tapas de arcilla 2\"', 'Contenedores', 7996.000, 1500.000, 'pza', 2.00, 57, 'Tapas de arcilla para sellar tubos', 1),
(141, 2006, 'Tapas de arcilla 3\"', 'Contenedores', 4998.000, 1000.000, 'pza', 3.50, 57, 'Tapas de arcilla para sellar tubos', 1),
(142, 3001, 'Mecha de seguridad verde', 'Fusibles', 9994.000, 2000.000, 'metros', 12.00, 58, 'Mecha de seguridad velocidad estándar', 1),
(143, 3002, 'Mecha rápida (quick match)', 'Fusibles', 4997.500, 1000.000, 'metros', 25.00, 58, 'Mecha de combustión rápida', 1),
(144, 3003, 'Fusible eléctrico', 'Fusibles', 2000.000, 400.000, 'pza', 35.00, 58, 'Fusible de ignición eléctrica', 1),
(145, 4001, 'Pegamento para pirotecnia', 'Materiales', 499.800, 100.000, 'litros', 180.00, 57, 'Adhesivo especial resistente al calor', 1),
(146, 4002, 'Cinta adhesiva reforzada', 'Materiales', 999.980, 200.000, 'rollos', 45.00, 57, 'Cinta de alta resistencia', 1),
(147, 4003, 'Papel kraft para envolver', 'Materiales', 800.000, 150.000, 'kg', 35.00, 57, 'Papel para protección de productos', 1),
(148, 4004, 'Etiquetas de seguridad', 'Materiales', 4995.000, 1000.000, 'pza', 2.50, 57, 'Etiquetas con advertencias y especificaciones', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `OrderID` int(11) NOT NULL,
  `CustomerID` int(11) DEFAULT NULL,
  `Product` enum('PYROBLAST','J-Tek','Línea') DEFAULT NULL,
  `Invoice` varchar(20) DEFAULT NULL,
  `OrderDate` date DEFAULT NULL,
  `PaymentMethod` varchar(50) DEFAULT NULL,
  `estado` enum('Pendiente','Entregada','Cancelada') DEFAULT 'Pendiente',
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`OrderID`, `CustomerID`, `Product`, `Invoice`, `OrderDate`, `PaymentMethod`, `estado`, `activo`) VALUES
(62, 58, 'PYROBLAST', 'F981', '2025-11-27', 'tarjeta', 'Pendiente', 0),
(63, 59, 'J-Tek', 'FAC-2', '2025-11-05', 'efectivo', 'Pendiente', 0),
(64, 58, 'J-Tek', 'FAC-2024-3333', '2025-11-20', 'efectivo', 'Pendiente', 1),
(65, 58, 'Línea', 'FAC-2024-3330', '2025-11-20', 'efectivo', 'Entregada', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_materials`
--

CREATE TABLE `product_materials` (
  `id` int(11) NOT NULL,
  `product_name` enum('PYROBLAST','J-Tek','Línea') NOT NULL,
  `material_id` bigint(20) UNSIGNED NOT NULL,
  `quantity_required` decimal(10,3) NOT NULL COMMENT 'Cantidad de material necesaria por unidad de producto'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `product_materials`
--

INSERT INTO `product_materials` (`id`, `product_name`, `material_id`, `quantity_required`) VALUES
(1, 'PYROBLAST', 138, 1.000),
(2, 'PYROBLAST', 141, 2.000),
(3, 'PYROBLAST', 130, 0.500),
(4, 'PYROBLAST', 131, 0.800),
(5, 'PYROBLAST', 132, 0.300),
(6, 'PYROBLAST', 133, 0.150),
(7, 'PYROBLAST', 134, 0.150),
(8, 'PYROBLAST', 135, 0.200),
(9, 'PYROBLAST', 142, 2.000),
(10, 'PYROBLAST', 145, 0.100),
(11, 'PYROBLAST', 148, 2.000),
(12, 'J-Tek', 137, 1.000),
(13, 'J-Tek', 140, 2.000),
(14, 'J-Tek', 130, 0.300),
(15, 'J-Tek', 131, 0.400),
(16, 'J-Tek', 132, 0.200),
(17, 'J-Tek', 135, 0.150),
(18, 'J-Tek', 142, 1.500),
(19, 'J-Tek', 143, 0.500),
(20, 'J-Tek', 145, 0.050),
(21, 'J-Tek', 148, 1.000),
(22, 'Línea', 136, 1.000),
(23, 'Línea', 139, 2.000),
(24, 'Línea', 130, 0.150),
(25, 'Línea', 131, 0.200),
(26, 'Línea', 135, 0.080),
(27, 'Línea', 142, 1.000),
(28, 'Línea', 143, 1.500),
(29, 'Línea', 146, 0.020),
(30, 'Línea', 148, 1.000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `rfc` varchar(13) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `suppliers`
--

INSERT INTO `suppliers` (`id`, `nombre`, `telefono`, `email`, `direccion`, `rfc`, `estado`) VALUES
(55, 'Explosivos Industriales SA', '4491234567', 'ventas@expindustriales.com', 'Av. Industrial 123, Aguascalientes', 'EIN850101ABC', 1),
(56, 'Química Pirotécnica del Centro', '4497654321', 'contacto@quimicapiro.com', 'Carretera a San Luis km 15, Aguascalientes', 'QPC920305XYZ', 1),
(57, 'Tubos y Empaques del Bajío', '4493332211', 'ventas@tubosbajio.com', 'Zona Industrial Norte, Aguascalientes', 'TEB880715MNO', 1),
(58, 'Distribuidora de Mechas y Fusibles', '4495556789', 'info@mechasfusibles.com', 'Col. Centro, Aguascalientes', 'DMF910420PQR', 1),
(59, 'Explosivos Industriales SA', '4491234567', 'ventas@expindustriales.com', 'Av. Industrial 123, Aguascalientes', 'EIN850101ABC', 1),
(60, 'Química Pirotécnica del Centro', '4497654321', 'contacto@quimicapiro.com', 'Carretera a San Luis km 15, Aguascalientes', 'QPC920305XYZ', 1),
(61, 'Tubos y Empaques del Bajío', '4493332211', 'ventas@tubosbajio.com', 'Zona Industrial Norte, Aguascalientes', 'TEB880715MNO', 1),
(62, 'Distribuidora de Mechas y Fusibles', '4495556789', 'info@mechasfusibles.com', 'Col. Centro, Aguascalientes', 'DMF910420PQR', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`CustomerID`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inventario_proveedor` (`proveedor_id`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`OrderID`),
  ADD KEY `CustomerID` (`CustomerID`);

--
-- Indices de la tabla `product_materials`
--
ALTER TABLE `product_materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_product_material` (`product_name`,`material_id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indices de la tabla `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `customers`
--
ALTER TABLE `customers`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=149;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `OrderID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT de la tabla `product_materials`
--
ALTER TABLE `product_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `fk_inventario_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `suppliers` (`id`);

--
-- Filtros para la tabla `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`);

--
-- Filtros para la tabla `product_materials`
--
ALTER TABLE `product_materials`
  ADD CONSTRAINT `product_materials_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `inventario` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
