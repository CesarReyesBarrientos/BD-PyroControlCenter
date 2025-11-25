-- Script para actualizar la tabla orders con los campos necesarios
-- Ejecuta este script en tu base de datos

-- Agregar campos faltantes
ALTER TABLE `orders` 
ADD COLUMN IF NOT EXISTS `OrderDate` DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `PaymentMethod` VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `Notes` TEXT DEFAULT NULL;

-- Actualizar el enum de estado para incluir los nuevos valores
ALTER TABLE `orders` 
MODIFY COLUMN `estado` ENUM('Pendiente','En proceso','Entregada','Cancelada','Finalizada') DEFAULT 'Pendiente';
