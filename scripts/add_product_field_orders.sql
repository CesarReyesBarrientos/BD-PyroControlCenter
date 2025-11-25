-- Script para agregar el campo de producto a la tabla orders
-- Ejecuta este script en tu base de datos

-- Agregar campo Product a la tabla orders
ALTER TABLE `orders` 
ADD COLUMN `Product` ENUM('PYROBLAST', 'J-Tek', 'Línea') DEFAULT NULL AFTER `CustomerID`;

-- Opcional: Si quieres agregar también PaymentMethod y Notes que creamos antes
ALTER TABLE `orders` 
ADD COLUMN IF NOT EXISTS `PaymentMethod` VARCHAR(50) DEFAULT NULL AFTER `OrderDate`,
ADD COLUMN IF NOT EXISTS `Notes` TEXT DEFAULT NULL AFTER `estado`;

-- Actualizar el enum de estado si es necesario (para que coincida con el frontend)
ALTER TABLE `orders` 
MODIFY COLUMN `estado` ENUM('Pendiente','En proceso','Entregada','Cancelada','Finalizada','Nuevo','Pagada','Enviando') DEFAULT 'Pendiente';
