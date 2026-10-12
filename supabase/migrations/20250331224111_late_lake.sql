/*
  # Add screen layouts support

  1. Changes
    - Add layout_type column to screens table
    - Add check constraint for valid layout types
    - Update existing screens to default layout

  2. Layout Types
    - full_text: Solo texto, ideal para menús y listas de precios
    - full_image: Imágenes a pantalla completa
    - split: Diseño dividido con imagen y texto
*/

ALTER TABLE screens
ADD COLUMN layout_type text NOT NULL DEFAULT 'split'
CHECK (layout_type IN ('full_text', 'full_image', 'split'));

COMMENT ON COLUMN screens.layout_type IS 'Tipo de diseño de la pantalla: full_text (solo texto), full_image (solo imágenes), split (imagen y texto)';