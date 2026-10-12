/*
  # Update Content Categories

  1. Changes
    - Add new categories for products
    - Update existing content to use new categories
    - Add check constraint for new categories

  2. Categories
    - breakfast (Desayunos)
    - lunch (Almuerzos)
    - dinner (Cenas)
    - snacks (Extras)
    - hot_drinks (Bebidas Calientes)
    - cold_drinks (Bebidas Frías)
    - frappes (Frappés)
    - others (Otros)
    - promotion (Promociones)
*/

-- First, temporarily disable the check constraint
ALTER TABLE content DROP CONSTRAINT IF EXISTS content_category_check;

-- Update existing content categories
UPDATE content SET category = 'hot_drinks' WHERE category = 'drinks';
UPDATE content SET category = 'lunch' WHERE category = 'main';

-- Add the new check constraint
ALTER TABLE content ADD CONSTRAINT content_category_check 
  CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snacks', 'hot_drinks', 'cold_drinks', 'frappes', 'others', 'promotion'));

-- Add comment to explain categories
COMMENT ON COLUMN content.category IS 'Product category: breakfast (Desayunos), lunch (Almuerzos), dinner (Cenas), snacks (Extras), hot_drinks (Bebidas Calientes), cold_drinks (Bebidas Frías), frappes (Frappés), others (Otros), promotion (Promociones)';