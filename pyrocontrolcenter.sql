-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-11-2025 a las 00:33:45
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
  `Email` varchar(100) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `producto` varchar(100) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `minstock` float NOT NULL,
  `precio` decimal(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  `unidad_de_medida` varchar(10) NOT NULL,
  `categoria` enum('Wire','Cable','Shruds','Head','Tail','Box','Polvora','Quimicos','Papel','Carton','Otros') NOT NULL DEFAULT 'Otros',
  `estado` tinyint(1) DEFAULT 1,
  `proveedor_id` int(11) DEFAULT NULL,
  `notas` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id`, `producto`, `stock`, `minstock`, `precio`, `unidad_de_medida`, `categoria`, `estado`, `proveedor_id`, `notas`) VALUES
(1, 'Paloma de 1 pulgada', 1500, 3, 0.00, 'pza', 'Otros', 0, NULL, NULL),
(32, 'Paloma de 1 pulgada', 1500, 5, 0.00, 'pza', 'Otros', 0, NULL, NULL),
(33, 'Pólvora negra fina', 120, 3.36, 250.00, 'kg', 'Polvora', 1, NULL, NULL),
(34, 'Mecha rápida tipo A', 500, 4.01, 15.50, 'm', 'Wire', 1, NULL, NULL),
(35, 'Cartón reforzado grueso', 200, 3, 8.75, 'pza', 'Carton', 1, NULL, NULL),
(36, 'Colorante rojo intenso', 60, 3.97, 320.00, 'kg', 'Quimicos', 1, NULL, NULL),
(37, 'Tubo lanzador 3 pulgadas', 85, 4, 42.00, 'pza', 'Otros', 1, NULL, NULL),
(38, 'Sulfato de Magnesio 1210', 11, 1.5, 50.99, 'KG', 'Quimicos', 1, 1, 'P1'),
(39, 'MINI COPPER  LAMINATES', 10, 5, 10.50, 'PZ', 'Shruds', 1, 1, 'P2'),
(40, 'QP COBRA', 50, 10, 80.99, 'CAJA', 'Box', 1, 4, 'p3');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lote`
--

CREATE TABLE `lote` (
  `LotID` int(11) NOT NULL,
  `OrderID` int(11) DEFAULT NULL,
  `Quantity` int(11) DEFAULT NULL,
  `Model` varchar(255) DEFAULT NULL,
  `TEK` int(11) DEFAULT NULL,
  `Shruds` varchar(255) DEFAULT NULL,
  `Wrap` varchar(255) DEFAULT NULL,
  `Color` varchar(255) DEFAULT NULL,
  `Tail` varchar(255) DEFAULT NULL,
  `LotNumber` int(11) DEFAULT NULL,
  `Details` varchar(255) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `OrderID` int(11) NOT NULL,
  `CustomerID` int(11) DEFAULT NULL,
  `Invoice` varchar(5) DEFAULT NULL,
  `estado` enum('Nuevo','En proceso','Pagada','Enviando','Entregada','Finalizada') DEFAULT 'Nuevo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'Distribuidora Industrial SA de CV', '55-1234-5678', 'ventas@distribuidoraindustrial.com', 'Av. Industrial #123, Zona Industrial, Ciudad de México', 'DIN940825XY1', 1),
(2, 'Raygoza & Asociados', '4493732345', 'aaron.raygoza@raygoza.asc.mx', 'Jume 108', 'RAMA030326Q4A', 1),
(4, 'Alvarado PyreBoxes', '019964523', 'ventas@alvarado.pyre.edu', 'Jume 108', 'RAMA030326Q4A', 1);

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
  ADD KEY `idx_inventario_categoria` (`categoria`),
  ADD KEY `fk_inventario_proveedor` (`proveedor_id`);

--
-- Indices de la tabla `lote`
--
ALTER TABLE `lote`
  ADD PRIMARY KEY (`LotID`),
  ADD KEY `OrderID` (`OrderID`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`OrderID`),
  ADD KEY `CustomerID` (`CustomerID`);

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
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `lote`
--
ALTER TABLE `lote`
  MODIFY `LotID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `OrderID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `fk_inventario_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `suppliers` (`id`);

--
-- Filtros para la tabla `lote`
--
ALTER TABLE `lote`
  ADD CONSTRAINT `lote_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
