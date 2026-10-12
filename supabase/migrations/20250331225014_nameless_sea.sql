/*
  # Crear Sucursal Santa Rosa y sus Pantallas

  1. Nueva Sucursal
    - Santa Rosa de Lima
  
  2. Nuevas Pantallas
    - Pantalla de Bebidas (full_text)
    - Pantalla de Comidas (full_image)
    - Pantalla Principal (split)

  3. Programación Inicial
    - Asignar contenido relevante a cada pantalla
*/

-- Crear la sucursal Santa Rosa
INSERT INTO locations (id, name, address)
VALUES (
  'f8c4c9a0-5c1a-4e1d-9b5a-6b5c0f0e1b2c',
  'Santa Rosa de Lima',
  'Av. Santa Rosa 123, Lima'
);

-- Crear las pantallas
INSERT INTO screens (id, name, location_id, layout_type)
VALUES
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f',
    'Pantalla de Bebidas',
    'f8c4c9a0-5c1a-4e1d-9b5a-6b5c0f0e1b2c',
    'full_text'
  ),
  (
    'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a',
    'Pantalla de Comidas',
    'f8c4c9a0-5c1a-4e1d-9b5a-6b5c0f0e1b2c',
    'full_image'
  ),
  (
    'c3d4e5f6-a7b8-6c7d-0e1f-3c4d5e6f7a8b',
    'Pantalla Principal',
    'f8c4c9a0-5c1a-4e1d-9b5a-6b5c0f0e1b2c',
    'split'
  );

-- Programar contenido para la pantalla de bebidas
INSERT INTO content_schedule (screen_id, content_id, start_time, end_time, days_of_week)
SELECT 
  'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f',
  id,
  '07:00',
  '22:00',
  ARRAY[1,2,3,4,5,6,0]
FROM content
WHERE category = 'drinks';

-- Programar contenido para la pantalla de comidas
INSERT INTO content_schedule (screen_id, content_id, start_time, end_time, days_of_week)
SELECT 
  'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a',
  id,
  '07:00',
  '22:00',
  ARRAY[1,2,3,4,5,6,0]
FROM content
WHERE category IN ('main', 'breakfast');

-- Programar contenido para la pantalla principal
INSERT INTO content_schedule (screen_id, content_id, start_time, end_time, days_of_week)
SELECT 
  'c3d4e5f6-a7b8-6c7d-0e1f-3c4d5e6f7a8b',
  id,
  '07:00',
  '22:00',
  ARRAY[1,2,3,4,5,6,0]
FROM content
WHERE category IN ('main', 'drinks', 'promotion');