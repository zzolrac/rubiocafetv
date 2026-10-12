/*
  # Agregar precio a los productos

  1. Cambios
    - Agregar columna `price` a la tabla `content`
    - Establecer un precio por defecto de 0
    - Asegurar que el precio sea positivo

  2. Notas
    - El precio se almacena como un número decimal con 2 decimales
    - Se agrega una restricción para asegurar que el precio sea positivo
*/

ALTER TABLE content
ADD COLUMN price decimal(10,2) NOT NULL DEFAULT 0.00;

-- Asegurar que el precio sea positivo
ALTER TABLE content
ADD CONSTRAINT content_price_check CHECK (price >= 0);