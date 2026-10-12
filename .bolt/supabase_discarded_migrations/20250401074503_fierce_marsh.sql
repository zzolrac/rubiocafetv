/*
  # Create Locations and Screens

  1. New Locations
    - Santa Rosa de Lima
    - Anamoros
  
  2. New Screens
    - Santa Rosa:
      - Pantalla Principal (split)
      - Pantalla de Bebidas (full_text)
      - Pantalla de Comidas (full_image)
    - Anamoros:
      - Pantalla Principal (split)
      - Pantalla de Menú (full_text)
      - Pantalla de Promociones (full_image)

  3. Initial Content Schedule
    - Configure content for each screen based on its type and purpose
*/

-- Create Santa Rosa de Lima location
INSERT INTO locations (id, name, address)
VALUES (
  'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  'Santa Rosa de Lima',
  'Barrio El Convento, Santa Rosa de Lima'
);

-- Create Anamoros location
INSERT INTO locations (id, name, address)
VALUES (
  'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7',
  'Anamoros',
  'Barrio El Centro, Anamoros'
);

-- Create screens for Santa Rosa de Lima
INSERT INTO screens (id, name, location_id, layout_type)
VALUES
  (
    'c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8',
    'Pantalla Principal',
    'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    'split'
  ),
  (
    'd4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9',
    'Pantalla de Bebidas',
    'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    'full_text'
  ),
  (
    'e5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9t0',
    'Pantalla de Comidas',
    'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    'full_image'
  );

-- Create screens for Anamoros
INSERT INTO screens (id, name, location_id, layout_type)
VALUES
  (
    'f6g7h8i9-j0k1-l2m3-n4o5-p6q7r8s9t0u1',
    'Pantalla Principal',
    'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7',
    'split'
  ),
  (
    'g7h8i9j0-k1l2-m3n4-o5p6-q7r8s9t0u1v2',
    'Pantalla de Menú',
    'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7',
    'full_text'
  ),
  (
    'h8i9j0k1-l2m3-n4o5-p6q7-r8s9t0u1v2w3',
    'Pantalla de Promociones',
    'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7',
    'full_image'
  );

-- Schedule content for Santa Rosa's Pantalla Principal (mixed content)
INSERT INTO content_schedule (screen_id, content_id, start_time, end_time, days_of_week)
SELECT 
  'c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8',
  id,
  '07:00',
  '22:00',
  ARRAY[1,2,3,4,5,6,0]
FROM content
WHERE category IN ('main', 'drinks', 'promotion')
LIMIT 10;

-- Schedule content for Santa Rosa's Pantalla de Bebidas (drinks only)
INSERT INTO content_schedule (screen_id, content_id, start_time, end_time, days_of_week)
SELECT 
  'd4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9',
  id,
  '07:00',
  '22:00',
  ARRAY[1,2,3,4,5,6,0]
FROM content
WHERE category = 'drinks';

-- Schedule content for Santa Rosa's Pantalla de Comidas (food only)
INSERT INTO content_schedule (screen_id, content_id, start_time, end_time, days_of_week)
SELECT 
  'e5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9t0',
  id,
  '07:00',
  '22:00',
  ARRAY[1,2,3,4,5,6,0]
FROM content
WHERE category IN ('main', 'breakfast');

-- Schedule content for Anamoros's Pantalla Principal (mixed content)
INSERT INTO content_schedule (screen_id, content_id, start_time, end_time, days_of_week)
SELECT 
  'f6g7h8i9-j0k1-l2m3-n4o5-p6q7r8s9t0u1',
  id,
  '07:00',
  '22:00',
  ARRAY[1,2,3,4,5,6,0]
FROM content
WHERE category IN ('main', 'drinks', 'promotion')
LIMIT 10;

-- Schedule content for Anamoros's Pantalla de Menú (all menu items)
INSERT INTO content_schedule (screen_id, content_id, start_time, end_time, days_of_week)
SELECT 
  'g7h8i9j0-k1l2-m3n4-o5p6-q7r8s9t0u1v2',
  id,
  '07:00',
  '22:00',
  ARRAY[1,2,3,4,5,6,0]
FROM content
WHERE category IN ('main', 'drinks', 'breakfast');

-- Schedule content for Anamoros's Pantalla de Promociones (promotions only)
INSERT INTO content_schedule (screen_id, content_id, start_time, end_time, days_of_week)
SELECT 
  'h8i9j0k1-l2m3-n4o5-p6q7-r8s9t0u1v2w3',
  id,
  '07:00',
  '22:00',
  ARRAY[1,2,3,4,5,6,0]
FROM content
WHERE category = 'promotion';