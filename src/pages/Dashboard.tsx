import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MonitorPlay, Coffee, Tag, Image, Film, Edit, Cake } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';
import { useContentStore } from '../store/contentStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import BirthdayMessageDialog from '../components/BirthdayMessageDialog';

const StatCard = ({ title, value, icon: Icon, color }: { 
  title: string;
  value: number;
  icon: typeof Building2;
  color: string;
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-semibold mt-1 text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  </div>
);

const CategoryBadge = ({ category }: { category: string }) => {
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'promotion': return { label: 'Promoción', color: 'bg-red-100 text-red-700' };
      case 'hot_drinks': return { label: 'Bebida Caliente', color: 'bg-amber-100 text-amber-700' };
      case 'cold_drinks': return { label: 'Bebida Fría', color: 'bg-blue-100 text-blue-700' };
      case 'frappes': return { label: 'Frappé', color: 'bg-indigo-100 text-indigo-700' };
      case 'breakfast': return { label: 'Desayuno', color: 'bg-green-100 text-green-700' };
      case 'lunch': return { label: 'Almuerzo', color: 'bg-orange-100 text-orange-700' };
      case 'dinner': return { label: 'Cena', color: 'bg-purple-100 text-purple-700' };
      case 'snacks': return { label: 'Snack', color: 'bg-pink-100 text-pink-700' };
      default: return { label: 'Otro', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const { label, color } = getCategoryInfo(category);
  return (
    <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { locations, fetchLocations } = useLocationStore();
  const { contents, fetchContents } = useContentStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isBirthdayDialogOpen, setIsBirthdayDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchLocations(),
          fetchContents()
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchLocations, fetchContents]);

  const totalScreens = locations.reduce((acc, loc) => acc + loc.screens.length, 0);
  const totalDrinks = contents.filter(c => ['hot_drinks', 'cold_drinks', 'frappes'].includes(c.category)).length;
  const totalFood = contents.filter(c => ['breakfast', 'lunch', 'dinner', 'snacks'].includes(c.category)).length;
  const totalPromotions = contents.filter(c => c.category === 'promotion').length;

  // Get the 10 most recent products
  const recentProducts = [...contents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsBirthdayDialogOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm sm:text-base"
          >
            <Cake size={20} className="flex-shrink-0" />
            <span>Mensaje de Cumpleaños</span>
          </button>
          <button
            onClick={() => navigate('/locations')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4F46E5]/90 transition-colors text-sm sm:text-base"
          >
            <Building2 size={20} className="flex-shrink-0" />
            <span>Gestionar Sucursales</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pantallas Activas"
          value={totalScreens}
          icon={MonitorPlay}
          color="bg-[#4F46E5]"
        />
        <StatCard
          title="Sucursales"
          value={locations.length}
          icon={Building2}
          color="bg-[#10B981]"
        />
        <StatCard
          title="Productos"
          value={totalFood + totalDrinks}
          icon={Coffee}
          color="bg-[#F59E0B]"
        />
        <StatCard
          title="Promociones"
          value={totalPromotions}
          icon={Tag}
          color="bg-[#EF4444]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Pantallas por Sucursal</h2>
          <div className="flex-1 overflow-y-auto">
            {locations.length > 0 ? (
              <div className="space-y-4">
                {locations.map(location => (
                  <div key={location.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="text-[#4F46E5]" size={20} />
                      <span className="font-medium text-gray-700">{location.name}</span>
                    </div>
                    <span className="text-[#4F46E5] font-medium">{location.screens.length} pantallas</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay sucursales registradas
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Productos Recientes</h2>
            <button
              onClick={() => navigate('/products')}
              className="text-sm text-[#4F46E5] hover:underline font-medium"
            >
              Ver todos
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentProducts.length > 0 ? (
              <div className="grid gap-4">
                {recentProducts.map(product => (
                  <div 
                    key={product.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {product.type === 'image' ? (
                        <img
                          src={product.url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(product.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                          </p>
                        </div>
                        <CategoryBadge category={product.category} />
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => navigate('/products')}
                          className="text-[#4F46E5] hover:text-[#4F46E5]/80 transition-colors"
                          title="Editar producto"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay productos registrados
              </div>
            )}
          </div>
        </div>
      </div>

      <BirthdayMessageDialog
        isOpen={isBirthdayDialogOpen}
        onClose={() => setIsBirthdayDialogOpen(false)}
      />
    </div>
  );
};

export default Dashboard;