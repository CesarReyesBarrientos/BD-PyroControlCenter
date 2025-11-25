-- Script para agregar campos Product y PaymentMethod a la tabla orders

-- Agregar campo Product a la tabla orders
ALTER TABLE `orders` 
ADD COLUMN `Product` ENUM('PYROBLAST', 'J-Tek', 'Línea') DEFAULT NULL AFTER `CustomerID`;

-- Agregar campo PaymentMethod a la tabla orders
ALTER TABLE `orders` 
ADD COLUMN `PaymentMethod` VARCHAR(50) DEFAULT NULL AFTER `OrderDate`;

-- Actualizar el enum de estado para que coincida con el frontend
ALTER TABLE `orders` 
MODIFY COLUMN `estado` ENUM('pendiente','entregada','cancelada','en_proceso') DEFAULT 'pendiente';
