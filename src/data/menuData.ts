import { v4 as uuidv4 } from 'uuid';
import type { Content } from '../types';

export const menuData: Omit<Content, 'created_at'>[] = [
  // Bebidas Calientes
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80',
    title: 'Café Americano',
    description: 'Café espresso con agua caliente',
    category: 'drinks',
    price: 2.50
  },
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80',
    title: 'Café Latte',
    description: 'Café espresso con leche vaporizada',
    category: 'drinks',
    price: 3.00
  },
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80',
    title: 'Cappuccino',
    description: 'Café espresso con leche vaporizada y espuma',
    category: 'drinks',
    price: 3.00
  },
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1579494398610-7435a2bee449?auto=format&fit=crop&q=80',
    title: 'Chocolate Caliente',
    description: 'Chocolate con leche caliente y malvaviscos',
    category: 'drinks',
    price: 3.00
  },

  // Bebidas Frías
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1586195831800-24f14c992cea?auto=format&fit=crop&q=80',
    title: 'Frappé de Café',
    description: 'Café helado batido con leche y crema batida',
    category: 'drinks',
    price: 3.50
  },
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?auto=format&fit=crop&q=80',
    title: 'Café Helado',
    description: 'Café frío con hielo y leche',
    category: 'drinks',
    price: 3.00
  },
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1619158401201-8fa932695178?auto=format&fit=crop&q=80',
    title: 'Limonada',
    description: 'Limonada natural con hielo',
    category: 'drinks',
    price: 2.50
  },

  // Desayunos
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80',
    title: 'Pancakes',
    description: 'Torre de pancakes con miel de maple y mantequilla',
    category: 'breakfast',
    price: 5.00
  },
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80',
    title: 'Huevos Revueltos',
    description: 'Huevos revueltos con tocino y pan tostado',
    category: 'breakfast',
    price: 6.00
  },
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80',
    title: 'Tostadas Francesas',
    description: 'Pan francés con frutas y miel',
    category: 'breakfast',
    price: 5.50
  },

  // Platos Principales
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&q=80',
    title: 'Hamburguesa Clásica',
    description: 'Hamburguesa de res con queso, lechuga y tomate',
    category: 'main',
    price: 8.00
  },
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80',
    title: 'Club Sandwich',
    description: 'Sandwich triple con pollo, tocino, lechuga y tomate',
    category: 'main',
    price: 7.50
  },
  {
    id: uuidv4(),
    type: 'image',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80',
    title: 'Pizza Margarita',
    description: 'Pizza con salsa de tomate, mozzarella y albahaca',
    category: 'main',
    price: 10.00
  },

  // Promociones
  {
    id: uuidv4(),
    type: 'promotion',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80',
    title: 'Desayuno Completo',
    description: 'Huevos, pancakes, café y jugo',
    category: 'promotion',
    price: 9.99
  },
  {
    id: uuidv4(),
    type: 'promotion',
    url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80',
    title: '2x1 en Café',
    description: 'Todos los martes, 2x1 en café americano',
    category: 'promotion',
    price: 2.50
  },
  {
    id: uuidv4(),
    type: 'promotion',
    url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&q=80',
    title: 'Combo Almuerzo',
    description: 'Hamburguesa, papas fritas y refresco',
    category: 'promotion',
    price: 10.99
  }
];