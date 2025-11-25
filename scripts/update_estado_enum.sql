-- Script para actualizar el ENUM de estado en la tabla orders

-- Primero actualizamos los valores existentes que no coincidan
UPDATE `orders` 
SET `estado` = 'Pendiente' 
WHERE `estado` IN ('Nuevo', 'En proceso', 'Enviando', 'Pagada');

-- Ahora modificamos la columna para que solo acepte los 3 valores deseados
ALTER TABLE `orders` 
MODIFY COLUMN `estado` ENUM('Pendiente', 'Entregada', 'Cancelada') DEFAULT 'Pendiente';
