/*
  # Populate Menu Data

  1. Changes
    - Add menu items for drinks, food, and promotions
    - Insert content records with proper categorization
    - Include URLs for menu images

  2. Data Categories
    - Drinks (bebidas)
    - Main dishes (platos principales)
    - Promotions (promociones)
*/

-- Insert drinks content
INSERT INTO content (type, url, title, description, category) VALUES
  ('image', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1600', 'Café Americano', 'Café negro recién hecho', 'drinks'),
  ('image', 'https://images.unsplash.com/photo-1534687941688-651ccaafbff8?q=80&w=1600', 'Café con Leche', 'Café con leche cremosa', 'drinks'),
  ('image', 'https://images.unsplash.com/photo-1497636577773-f1231844b336?q=80&w=1600', 'Cappuccino', 'Café espresso con leche espumada', 'drinks'),
  ('image', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=1600', 'Latte', 'Café con leche y espuma', 'drinks'),
  ('image', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1600', 'Moka', 'Café con chocolate y leche', 'drinks'),
  ('image', 'https://images.unsplash.com/photo-1560824740-c0a9c6e2f379?q=80&w=1600', 'Frappé', 'Bebida helada de café', 'drinks'),
  ('image', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1600', 'Chocolate Caliente', 'Chocolate caliente cremoso', 'drinks'),
  ('image', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=1600', 'Té Verde', 'Té verde natural', 'drinks');

-- Insert main dishes content
INSERT INTO content (type, url, title, description, category) VALUES
  ('image', 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1600', 'Sandwich de Pollo', 'Pan artesanal con pollo a la plancha', 'main'),
  ('image', 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?q=80&w=1600', 'Sandwich de Jamón y Queso', 'Jamón y queso fundido', 'main'),
  ('image', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1600', 'Croissant', 'Croissant recién horneado', 'main'),
  ('image', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1600', 'Bagel', 'Bagel con queso crema', 'main'),
  ('image', 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?q=80&w=1600', 'Dona Glaseada', 'Dona con glaseado de azúcar', 'main'),
  ('image', 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1600', 'Brownie', 'Brownie de chocolate', 'main');

-- Insert breakfast items
INSERT INTO content (type, url, title, description, category) VALUES
  ('image', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1600', 'Desayuno Americano', 'Huevos, tocino y pan tostado', 'breakfast'),
  ('image', 'https://images.unsplash.com/photo-1608000066124-4d4bb824b1f7?q=80&w=1600', 'Pancakes', 'Torre de pancakes con miel', 'breakfast'),
  ('image', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1600', 'Avena', 'Avena con frutas y miel', 'breakfast'),
  ('image', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1600', 'Huevos Revueltos', 'Huevos revueltos con pan tostado', 'breakfast');

-- Insert promotions
INSERT INTO content (type, url, title, description, category) VALUES
  ('promotion', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600', 'Desayuno Completo', 'Café americano + sandwich a elección', 'promotion'),
  ('promotion', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1600', '2x1 en Café', 'Todos los días de 3pm a 5pm', 'promotion'),
  ('promotion', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1600', 'Happy Hour', 'Café y postre con 30% de descuento', 'promotion'),
  ('promotion', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1600', 'Combo Merienda', 'Café + croissant a precio especial', 'promotion');